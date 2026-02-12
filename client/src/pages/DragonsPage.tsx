/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useMe } from "../app/hooks/useMe";
import { RuneButton } from "../components/ui/RuneButton";
import { useHunters } from "../app/hooks/useHunters";

type DragonState = "ASSIGNED" | "IN_PROGRESS" | "AT_RISK" | "CLOSED";

type Dragon = {
    id: string;
    name: string;
    speciesType: string;
    aggression: number;
    state: DragonState;
    ownerHunterId?: string | null;
};

type UserLite = {
    id: string;
    email: string; // NO se muestra
    role: "ADMIN" | "HUNTER";
    displayName: string;
};

function stateLabel(s: DragonState) {
    switch (s) {
        case "ASSIGNED":
            return "Assigned";
        case "IN_PROGRESS":
            return "In progress";
        case "AT_RISK":
            return "At risk";
        case "CLOSED":
            return "Closed";
    }
}

function pillTone(state: DragonState) {
    if (state === "AT_RISK")
        return "border-[#b12d2d]/25 bg-[#b12d2d]/10 text-[#f0d28a]/95";
    if (state === "CLOSED") return "border-white/10 bg-black/20 text-white/75";
    return "border-[#f0d28a]/18 bg-black/25 text-white/90";
}

function clamp(v: number, min: number, max: number) {
    return Math.max(min, Math.min(max, v));
}

function safeName(s?: string | null) {
    const t = (s ?? "").trim();
    return t.length ? t : "Nameless Hunter";
}

export function DragonsPage() {
    const meQ = useMe();
    const isAdmin = meQ.data?.role === "ADMIN";
    const huntersQ = useHunters(isAdmin);

    const [items, setItems] = useState<Dragon[]>([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    // filters
    const [q, setQ] = useState("");
    const [state, setState] = useState<DragonState | "ALL">("ALL");
    const [minAggro, setMinAggro] = useState(0);

    // create dragon (ADMIN)
    const [name, setName] = useState("");
    const [speciesType, setSpeciesType] = useState("");
    const [aggression, setAggression] = useState(30);
    const [creating, setCreating] = useState(false);
    const [createMsg, setCreateMsg] = useState<string | null>(null);

    // assign dragon (ADMIN)
    const [selectedHunterByDragon, setSelectedHunterByDragon] = useState<
        Record<string, string>
    >({});
    const [assigningId, setAssigningId] = useState<string | null>(null);
    const [assignMsg, setAssignMsg] = useState<Record<string, string | null>>({});

    async function load() {
        setLoading(true);
        setErr(null);
        try {
            const data = await api<Dragon[]>("/dragons");
            setItems(data);
        } catch (e: any) {
            setErr(e?.message ?? "Failed to load dragons");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    // ✅ hunterId -> displayName
    const hunterNameById = useMemo(() => {
        const map = new Map<string, string>();
        const list = (huntersQ.data ?? []) as UserLite[];
        for (const u of list) map.set(u.id, safeName(u.displayName));
        return map;
    }, [huntersQ.data]);

    // ✅ Preselect dropdown with current ownerHunterId (without overwriting user's manual selection)
    useEffect(() => {
        if (!isAdmin) return;
        setSelectedHunterByDragon((prev) => {
            const next = { ...prev };
            for (const d of items) {
                if (d.ownerHunterId && !next[d.id]) next[d.id] = d.ownerHunterId;
            }
            return next;
        });
    }, [items, isAdmin]);

    const filtered = useMemo(() => {
        const qq = q.trim().toLowerCase();
        return items.filter((d) => {
            const matchesQ =
                !qq ||
                d.name.toLowerCase().includes(qq) ||
                d.speciesType.toLowerCase().includes(qq);

            const matchesState = state === "ALL" || d.state === state;
            const matchesAggro = (d.aggression ?? 0) >= minAggro;

            return matchesQ && matchesState && matchesAggro;
        });
    }, [items, q, state, minAggro]);

    const stats = useMemo(() => {
        const total = items.length;
        const atRisk = items.filter((x) => x.state === "AT_RISK").length;
        const inProgress = items.filter((x) => x.state === "IN_PROGRESS").length;
        const assigned = items.filter((x) => x.state === "ASSIGNED").length;
        const closed = items.filter((x) => x.state === "CLOSED").length;

        const avg =
            total > 0
                ? Math.round(items.reduce((a, x) => a + (x.aggression ?? 0), 0) / total)
                : 0;

        const top =
            items.reduce((best, x) => {
                if (!best) return x;
                return (x.aggression ?? 0) > (best.aggression ?? 0) ? x : best;
            }, null as Dragon | null) ?? null;

        return { total, atRisk, inProgress, assigned, closed, avg, top };
    }, [items]);

    async function createDragon() {
        setCreateMsg(null);

        const n = name.trim();
        const s = speciesType.trim();
        if (!n || !s) {
            setCreateMsg("Name and species are required.");
            return;
        }

        setCreating(true);
        try {
            await api("/dragons", {
                method: "POST",
                body: JSON.stringify({
                    name: n,
                    speciesType: s,
                    aggression: clamp(aggression, 0, 100),
                }),
            });

            setCreateMsg("A new dragon has been forged into the ledger.");
            setName("");
            setSpeciesType("");
            setAggression(30);
            await load();
        } catch (e: any) {
            setCreateMsg(e?.message ?? "Failed to forge dragon");
        } finally {
            setCreating(false);
        }
    }

    async function assignDragon(dragonId: string) {
        const hunterId = selectedHunterByDragon[dragonId];
        if (!hunterId) {
            setAssignMsg((m) => ({ ...m, [dragonId]: "Choose a hunter first." }));
            return;
        }

        setAssigningId(dragonId);
        setAssignMsg((m) => ({ ...m, [dragonId]: null }));

        try {
            await api(`/dragons/${dragonId}/assign`, {
                method: "PATCH",
                body: JSON.stringify({ hunterId }),
            });

            setAssignMsg((m) => ({ ...m, [dragonId]: "Assignment sealed." }));
            await load();
        } catch (e: any) {
            setAssignMsg((m) => ({
                ...m,
                [dragonId]: e?.message ?? "Failed to assign",
            }));
        } finally {
            setAssigningId(null);
        }
    }

    async function unassignDragon(dragonId: string) {
        setAssigningId(dragonId);
        setAssignMsg((m) => ({ ...m, [dragonId]: null }));

        try {
            await api(`/dragons/${dragonId}/unassign`, { method: "PATCH" });

            setSelectedHunterByDragon((prev) => {
                const next = { ...prev };
                delete next[dragonId];
                return next;
            });

            setAssignMsg((m) => ({ ...m, [dragonId]: "Unassigned. The ledger is reset." }));
            await load();
        } catch (e: any) {
            setAssignMsg((m) => ({
                ...m,
                [dragonId]: e?.message ?? "Failed to unassign",
            }));
        } finally {
            setAssigningId(null);
        }
    }

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                    <div className="text-sm tracking-[0.22em] text-white/55">LEDGER</div>
                    <h1 className="font-cinzel text-4xl text-[#f0d28a]/95">Dragons Ledger</h1>
                    <div className="mt-2 text-lg text-white/70">
                        {filtered.length} of {items.length} records
                    </div>
                </div>

                <button
                    onClick={load}
                    className="rounded-2xl border border-[#f0d28a]/15 bg-black/25 px-5 py-3 text-base text-white/90 hover:bg-black/35 transition"
                >
                    Refresh
                </button>
            </div>

            {/* DASHBOARD */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                <div className="rounded-[22px] border border-[#f0d28a]/12 bg-black/25 p-4">
                    <div className="text-sm tracking-[0.22em] text-white/55">TOTAL</div>
                    <div className="mt-1 font-cinzel text-3xl text-[#f0d28a]/95">{stats.total}</div>
                    <div className="mt-1 text-base text-white/65">Creatures registered</div>
                </div>

                <div className="rounded-[22px] border border-[#f0d28a]/12 bg-black/25 p-4">
                    <div className="text-sm tracking-[0.22em] text-white/55">AT RISK</div>
                    <div className="mt-1 font-cinzel text-3xl text-[#f0d28a]/95">{stats.atRisk}</div>
                    <div className="mt-1 text-base text-white/65">Volatile targets</div>
                </div>

                <div className="rounded-[22px] border border-[#f0d28a]/12 bg-black/25 p-4">
                    <div className="text-sm tracking-[0.22em] text-white/55">AVG AGGRO</div>
                    <div className="mt-1 font-cinzel text-3xl text-[#f0d28a]/95">{stats.avg}</div>
                    <div className="mt-1 text-base text-white/65">Across the ledger</div>
                </div>

                <div className="rounded-[22px] border border-[#f0d28a]/12 bg-black/25 p-4">
                    <div className="text-sm tracking-[0.22em] text-white/55">ACTIVE</div>
                    <div className="mt-1 font-cinzel text-3xl text-[#f0d28a]/95">
                        {stats.inProgress + stats.assigned}
                    </div>
                    <div className="mt-1 text-base text-white/65">Assigned + In progress</div>
                </div>

                <div className="rounded-[22px] border border-[#f0d28a]/12 bg-black/25 p-4">
                    <div className="text-sm tracking-[0.22em] text-white/55">CLOSED</div>
                    <div className="mt-1 font-cinzel text-3xl text-[#f0d28a]/95">{stats.closed}</div>
                    <div className="mt-1 text-base text-white/65">Fates sealed</div>
                </div>
            </div>

            {stats.top && (
                <div className="rounded-[26px] border border-[#f0d28a]/12 bg-black/25 p-5">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                            <div className="text-sm tracking-[0.22em] text-white/55">MOST VOLATILE</div>
                            <div className="mt-1 font-cinzel text-3xl text-[#f0d28a]/95">{stats.top.name}</div>
                            <div className="mt-1 text-lg text-white/70">
                                Aggression <span className="text-white/90 font-semibold">{stats.top.aggression}/100</span> ·{" "}
                                {stats.top.speciesType}
                            </div>
                        </div>

                        <Link
                            to={`/dragons/${stats.top.id}`}
                            className="rounded-2xl border border-[#f0d28a]/15 bg-black/25 px-5 py-3 text-base text-white/90 hover:bg-black/35 transition"
                        >
                            Open dossier →
                        </Link>
                    </div>
                </div>
            )}

            {/* TOP GRID */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                {/* Filters */}
                <div className="rounded-[26px] border border-[#f0d28a]/12 bg-black/25 p-5">
                    <div className="flex items-center justify-between">
                        <div className="font-cinzel text-2xl text-[#f0d28a]/90">Scry Filters</div>
                        <div className="text-base text-white/55">Refine the list</div>
                    </div>
                    <div className="mt-3 rune-divider" />

                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="space-y-2 md:col-span-1">
                            <div className="text-sm tracking-[0.22em] text-white/55">SEARCH</div>
                            <input
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Name or species…"
                                className="w-full rounded-2xl border border-[#f0d28a]/15 bg-black/25 px-4 py-3 text-lg text-white/95 outline-none focus:border-[#f0d28a]/30"
                            />
                        </div>

                        <div className="space-y-2 md:col-span-1">
                            <div className="text-sm tracking-[0.22em] text-white/55">STATE</div>
                            <select
                                value={state}
                                onChange={(e) => setState(e.target.value as any)}
                                className="w-full rounded-2xl border border-[#f0d28a]/15 bg-black/25 px-4 py-3 text-lg text-white/95 outline-none focus:border-[#f0d28a]/30"
                            >
                                <option value="ALL">All</option>
                                <option value="ASSIGNED">Assigned</option>
                                <option value="IN_PROGRESS">In progress</option>
                                <option value="AT_RISK">At risk</option>
                                <option value="CLOSED">Closed</option>
                            </select>
                        </div>

                        <div className="space-y-2 md:col-span-1">
                            <div className="text-sm tracking-[0.22em] text-white/55">
                                MIN AGGRESSION: <span className="text-white/80">{minAggro}</span>
                            </div>
                            <input
                                type="range"
                                min={0}
                                max={100}
                                value={minAggro}
                                onChange={(e) => setMinAggro(Number(e.target.value))}
                                className="w-full"
                            />
                            <div className="text-sm text-white/55">Pull right to hunt only the truly volatile.</div>
                        </div>
                    </div>
                </div>

                {/* Admin Forge */}
                <div className="rounded-[26px] border border-[#f0d28a]/12 bg-black/25 p-5">
                    <div className="flex items-center justify-between">
                        <div className="font-cinzel text-2xl text-[#f0d28a]/90">Forge Dragon</div>
                        <div className="text-base text-white/55">
                            {meQ.isLoading ? "Reading seals…" : meQ.isError ? "Session unknown" : isAdmin ? "ADMIN" : "Restricted"}
                        </div>
                    </div>
                    <div className="mt-3 rune-divider" />

                    {meQ.isLoading ? (
                        <div className="mt-4 rounded-2xl border border-[#f0d28a]/12 bg-black/20 p-4 text-lg text-white/75">
                            Reading your guild seal…
                        </div>
                    ) : meQ.isError ? (
                        <div className="mt-4 rounded-2xl border border-[#b12d2d]/20 bg-[#b12d2d]/10 p-4 text-lg text-white/85">
                            Could not verify session (GET /auth/me). Is the server updated?
                        </div>
                    ) : !isAdmin ? (
                        <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-lg text-white/75">
                            Only <span className="text-[#f0d28a]/90 font-semibold">ADMIN</span> may forge new dragons.
                            <div className="mt-2 text-base text-white/60">(Log in as admin to unlock this panel.)</div>
                        </div>
                    ) : (
                        <div className="mt-4 space-y-4">
                            <div className="space-y-2">
                                <div className="text-sm tracking-[0.22em] text-white/55">NAME</div>
                                <input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g., Vyrnax the Cinder"
                                    className="w-full rounded-2xl border border-[#f0d28a]/15 bg-black/25 px-4 py-3 text-lg text-white/95 outline-none focus:border-[#f0d28a]/30"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="text-sm tracking-[0.22em] text-white/55">SPECIES TYPE</div>
                                <input
                                    value={speciesType}
                                    onChange={(e) => setSpeciesType(e.target.value)}
                                    placeholder="e.g., Ash Drake · Frost Wyrm · Emerald Serpent"
                                    className="w-full rounded-2xl border border-[#f0d28a]/15 bg-black/25 px-4 py-3 text-lg text-white/95 outline-none focus:border-[#f0d28a]/30"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="text-sm tracking-[0.22em] text-white/55">
                                    BASE AGGRESSION: <span className="text-white/85">{aggression}</span>
                                </div>
                                <input
                                    type="range"
                                    min={0}
                                    max={100}
                                    value={aggression}
                                    onChange={(e) => setAggression(Number(e.target.value))}
                                    className="w-full"
                                />
                                <div className="text-sm text-white/55">Start calm… or unleash a catastrophe.</div>
                            </div>

                            <RuneButton onClick={createDragon} disabled={creating} className="w-full py-3 text-base">
                                {creating ? "Forging…" : "Forge into Ledger"}
                            </RuneButton>

                            {createMsg && (
                                <div className="rounded-2xl border border-[#f0d28a]/12 bg-black/20 p-4 text-lg text-white/80">
                                    {createMsg}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* LIST */}
            {loading ? (
                <div className="rounded-2xl border border-[#f0d28a]/12 bg-black/25 p-6 text-lg text-white/75">
                    Loading ledger…
                </div>
            ) : err ? (
                <div className="rounded-2xl border border-[#b12d2d]/20 bg-[#b12d2d]/10 p-6 text-lg text-white/85">
                    <div className="font-cinzel text-[#f0d28a]/90 text-2xl">Could not load dragons</div>
                    <div className="mt-2 text-white/70">{err}</div>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((d) => {
                        const assignedName = d.ownerHunterId
                            ? hunterNameById.get(d.ownerHunterId) ?? "Unknown Hunter"
                            : null;

                        return (
                            <div key={d.id} className="rounded-[26px] border border-[#f0d28a]/12 bg-black/25 p-5">
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <div className="font-cinzel text-2xl text-[#f0d28a]/95">{d.name}</div>

                                            <span className={["inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm border", pillTone(d.state)].join(" ")}>
                                                <span className="opacity-80">⛬</span>
                                                <span className="tracking-wide">{stateLabel(d.state)}</span>
                                            </span>
                                        </div>

                                        <div className="mt-2 text-lg text-white/75">
                                            Species: <span className="text-white/90 font-semibold">{d.speciesType}</span>
                                        </div>

                                        <div className="mt-1 text-base text-white/55">
                                            Aggression: <span className="text-white/80">{d.aggression}/100</span>
                                            {d.ownerHunterId ? <>{" · "}Assigned</> : <>{" · "}Unassigned</>}
                                        </div>

                                        {isAdmin && (
                                            <div className="mt-4 rounded-2xl border border-[#f0d28a]/12 bg-black/20 p-4">
                                                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                                    <div className="text-base text-white/75">
                                                        {d.ownerHunterId ? (
                                                            <>
                                                                Assigned to:{" "}
                                                                <span className="text-white/90 font-semibold">{assignedName}</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                Status: <span className="text-white/90 font-semibold">Unassigned</span>
                                                            </>
                                                        )}
                                                        <div className="text-sm text-white/55">Choose a hunter by guild name.</div>
                                                    </div>

                                                    <div className="flex flex-col gap-3 md:flex-row md:items-center">
                                                        <select
                                                            value={selectedHunterByDragon[d.id] ?? ""}
                                                            onChange={(e) =>
                                                                setSelectedHunterByDragon((prev) => ({
                                                                    ...prev,
                                                                    [d.id]: e.target.value,
                                                                }))
                                                            }
                                                            className="w-full md:w-[320px] rounded-2xl border border-[#f0d28a]/15 bg-black/25 px-4 py-3 text-lg text-white/95 outline-none focus:border-[#f0d28a]/30"
                                                            disabled={huntersQ.isLoading || huntersQ.isError}
                                                        >
                                                            <option value="" disabled>
                                                                {huntersQ.isLoading
                                                                    ? "Summoning hunters…"
                                                                    : huntersQ.isError
                                                                        ? "Hunters unavailable"
                                                                        : "Choose a hunter…"}
                                                            </option>

                                                            {((huntersQ.data as UserLite[] | undefined) ?? []).map((u) => (
                                                                <option key={u.id} value={u.id}>
                                                                    {safeName(u.displayName)}
                                                                </option>
                                                            ))}
                                                        </select>

                                                        <button
                                                            onClick={() => assignDragon(d.id)}
                                                            disabled={assigningId === d.id || huntersQ.isLoading || huntersQ.isError}
                                                            className="rounded-2xl border border-[#f0d28a]/15 bg-black/25 px-5 py-3 text-base text-white/90 hover:bg-black/35 transition disabled:opacity-50"
                                                        >
                                                            {assigningId === d.id ? "Sealing…" : d.ownerHunterId ? "Reassign" : "Assign"}
                                                        </button>

                                                        {d.ownerHunterId && (
                                                            <button
                                                                onClick={() => unassignDragon(d.id)}
                                                                disabled={assigningId === d.id}
                                                                className="rounded-2xl border border-white/10 bg-black/20 px-5 py-3 text-base text-white/80 hover:bg-black/30 transition disabled:opacity-50"
                                                            >
                                                                Unassign
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {assignMsg[d.id] && (
                                                    <div className="mt-3 rounded-2xl border border-[#f0d28a]/12 bg-black/25 p-3 text-base text-white/80">
                                                        {assignMsg[d.id]}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex justify-end">
                                        <Link
                                            to={`/dragons/${d.id}`}
                                            className="rounded-2xl border border-[#f0d28a]/15 bg-black/25 px-5 py-3 text-base text-white/90 hover:bg-black/35 transition"
                                        >
                                            Open dossier →
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {filtered.length === 0 && (
                        <div className="rounded-2xl border border-[#f0d28a]/12 bg-black/25 p-6 text-lg text-white/75">
                            No dragons match the current filters.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
