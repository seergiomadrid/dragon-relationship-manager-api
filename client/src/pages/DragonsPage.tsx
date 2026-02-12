/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { OrnatePanel } from "../components/ui/OrnatePanel";
import { RuneButton } from "../components/ui/RuneButton";

type DragonState = "ASSIGNED" | "IN_PROGRESS" | "AT_RISK" | "CLOSED";

type Dragon = {
    id: string;
    name: string;
    speciesType: string;
    aggression: number;
    state: DragonState;
};

function stateMeta(s: DragonState) {
    switch (s) {
        case "ASSIGNED":
            return { label: "Assigned", icon: "⚑", tone: "text-white/80 border-[#f0d28a]/18 bg-black/25" };
        case "IN_PROGRESS":
            return { label: "In Progress", icon: "⚔", tone: "text-white/85 border-[#f0d28a]/22 bg-black/25" };
        case "AT_RISK":
            return { label: "At Risk", icon: "☠", tone: "text-[#f0d28a]/90 border-[#b12d2d]/25 bg-[#b12d2d]/10" };
        case "CLOSED":
            return { label: "Closed", icon: "⛬", tone: "text-white/70 border-white/10 bg-black/20" };
    }
}

function AggroBar({ value }: { value: number }) {
    const v = Math.max(0, Math.min(100, value ?? 0));
    const danger = v >= 70;
    const warn = v >= 45 && v < 70;

    return (
        <div className="w-full">
            <div className="flex items-center justify-between text-xs text-white/55">
                <span className="tracking-[0.22em]">AGGRESSION</span>
                <span className={danger ? "text-[#f0d28a]" : warn ? "text-white/70" : "text-white/55"}>
                    {v}/100
                </span>
            </div>
            <div className="mt-2 h-3 rounded-full border border-[#f0d28a]/12 bg-black/30 overflow-hidden">
                <div
                    className={[
                        "h-full rounded-full",
                        "bg-[linear-gradient(90deg,rgba(240,210,138,0.15),rgba(240,210,138,0.55),rgba(240,122,42,0.50))]",
                        danger ? "shadow-[0_0_30px_rgba(240,122,42,0.16)]" : "shadow-[0_0_24px_rgba(240,210,138,0.10)]",
                    ].join(" ")}
                    style={{ width: `${v}%` }}
                />
            </div>
        </div>
    );
}

export function DragonsPage() {
    const [items, setItems] = useState<Dragon[]>([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    // filtros
    const [q, setQ] = useState("");
    const [state, setState] = useState<DragonState | "ALL">("ALL");
    const [minAggro, setMinAggro] = useState(0);

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
        const atRisk = items.filter((d) => d.state === "AT_RISK").length;
        const inProgress = items.filter((d) => d.state === "IN_PROGRESS").length;
        const avgAggro =
            total === 0 ? 0 : Math.round(items.reduce((a, b) => a + (b.aggression ?? 0), 0) / total);

        return { total, atRisk, inProgress, avgAggro };
    }, [items]);

    return (
        <div className="space-y-6">
            <OrnatePanel
                title="Dragons Ledger"
                subtitle="A living archive of threats, bargains, and flames."
                right={<RuneButton onClick={load}>Refresh</RuneButton>}
            >
                {/* Stats row */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div className="rounded-2xl border border-[#f0d28a]/12 bg-black/25 p-4">
                        <div className="text-xs tracking-[0.26em] text-white/50">RECORDS</div>
                        <div className="mt-1 font-cinzel text-2xl text-[#f0d28a]/90">{stats.total}</div>
                        <div className="mt-1 text-xs text-white/55">Total dragons registered</div>
                    </div>
                    <div className="rounded-2xl border border-[#f0d28a]/12 bg-black/25 p-4">
                        <div className="text-xs tracking-[0.26em] text-white/50">AT RISK</div>
                        <div className="mt-1 font-cinzel text-2xl text-[#f0d28a]/90">{stats.atRisk}</div>
                        <div className="mt-1 text-xs text-white/55">Critical volatility</div>
                    </div>
                    <div className="rounded-2xl border border-[#f0d28a]/12 bg-black/25 p-4">
                        <div className="text-xs tracking-[0.26em] text-white/50">IN PROGRESS</div>
                        <div className="mt-1 font-cinzel text-2xl text-[#f0d28a]/90">{stats.inProgress}</div>
                        <div className="mt-1 text-xs text-white/55">Active operations</div>
                    </div>
                    <div className="rounded-2xl border border-[#f0d28a]/12 bg-black/25 p-4">
                        <div className="text-xs tracking-[0.26em] text-white/50">AVG AGGRO</div>
                        <div className="mt-1 font-cinzel text-2xl text-[#f0d28a]/90">{stats.avgAggro}</div>
                        <div className="mt-1 text-xs text-white/55">Mean aggression</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="mt-5 rounded-[26px] border border-[#f0d28a]/12 bg-black/25 p-4">
                    <div className="flex items-center justify-between">
                        <div className="font-cinzel text-sm text-[#f0d28a]/85 tracking-wide">Control Panel</div>
                        <div className="text-xs text-white/50">{filtered.length} shown</div>
                    </div>
                    <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                        <div className="space-y-2">
                            <div className="text-xs tracking-[0.22em] text-white/50">SEARCH</div>
                            <input
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Name or species…"
                                className="w-full rounded-2xl border border-[#f0d28a]/15 bg-black/25 px-4 py-3 text-sm text-white/90 outline-none focus:border-[#f0d28a]/30 focus:shadow-[0_0_0_4px_rgba(240,210,138,0.07)]"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="text-xs tracking-[0.22em] text-white/50">STATE</div>
                            <select
                                value={state}
                                onChange={(e) => setState(e.target.value as any)}
                                className="w-full rounded-2xl border border-[#f0d28a]/15 bg-black/25 px-4 py-3 text-sm text-white/90 outline-none focus:border-[#f0d28a]/30"
                            >
                                <option value="ALL">All</option>
                                <option value="ASSIGNED">Assigned</option>
                                <option value="IN_PROGRESS">In progress</option>
                                <option value="AT_RISK">At risk</option>
                                <option value="CLOSED">Closed</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <div className="text-xs tracking-[0.22em] text-white/50">
                                MIN AGGRESSION: <span className="text-[#f0d28a]/80">{minAggro}</span>
                            </div>
                            <input
                                type="range"
                                min={0}
                                max={100}
                                value={minAggro}
                                onChange={(e) => setMinAggro(Number(e.target.value))}
                                className="w-full accent-[#f0d28a]"
                            />
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="mt-5 space-y-3">
                    {loading ? (
                        <div className="rounded-2xl border border-[#f0d28a]/12 bg-black/25 p-6 text-sm text-white/70">
                            Loading ledger…
                        </div>
                    ) : err ? (
                        <div className="rounded-2xl border border-[#b12d2d]/20 bg-[#b12d2d]/10 p-6 text-sm text-white/75">
                            <div className="font-cinzel text-[#f0d28a]/90">Could not load dragons</div>
                            <div className="mt-2 text-white/65">{err}</div>
                        </div>
                    ) : (
                        <>
                            {filtered.map((d) => {
                                const meta = stateMeta(d.state);
                                return (
                                    <div
                                        key={d.id}
                                        className={[
                                            "rounded-[26px] border border-[#f0d28a]/12 bg-black/25",
                                            "p-5 shadow-[0_12px_45px_rgba(0,0,0,0.45)]",
                                            "hover:shadow-[0_18px_65px_rgba(0,0,0,0.55)] transition",
                                        ].join(" ")}
                                    >
                                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <div className="font-cinzel text-xl text-[#f0d28a]/95 tracking-wide">
                                                        {d.name}
                                                    </div>

                                                    <span
                                                        className={[
                                                            "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs",
                                                            "border",
                                                            meta.tone,
                                                        ].join(" ")}
                                                    >
                                                        <span className="opacity-80">{meta.icon}</span>
                                                        <span className="tracking-wide">{meta.label}</span>
                                                    </span>
                                                </div>

                                                <div className="mt-1 text-sm text-white/70">
                                                    Species:{" "}
                                                    <span className="text-white/90 font-semibold">
                                                        {d.speciesType}
                                                    </span>
                                                </div>

                                                <div className="mt-2 text-xs text-white/50">
                                                    Record ID: <span className="text-white/65">{d.id}</span>
                                                </div>
                                            </div>

                                            <div className="w-full max-w-md">
                                                <AggroBar value={d.aggression} />
                                            </div>

                                            <div className="flex justify-end">
                                                <Link
                                                    to={`/dragons/${d.id}`}
                                                    className="rounded-2xl border border-[#f0d28a]/15 bg-black/25 px-4 py-2.5 text-sm text-white/85 hover:bg-black/35 transition shadow-[0_10px_30px_rgba(0,0,0,0.45)]"
                                                >
                                                    Open dossier →
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {filtered.length === 0 && (
                                <div className="rounded-2xl border border-[#f0d28a]/12 bg-black/25 p-6 text-sm text-white/70">
                                    No dragons match the current filters.
                                </div>
                            )}
                        </>
                    )}
                </div>
            </OrnatePanel>
        </div>
    );
}
