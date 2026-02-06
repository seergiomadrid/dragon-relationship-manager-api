/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { Badge } from "../components/ui/Badge";
import { AggroBar } from "../components/ui/AggroBar";
import { Link } from "react-router-dom";

type DragonState = "ASSIGNED" | "IN_PROGRESS" | "AT_RISK" | "CLOSED";

type Dragon = {
    id: string;
    name: string;
    speciesType: string;
    aggression: number;
    state: DragonState;
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

    return (
        <div className="space-y-5">
            {/* header */}
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                    <div className="text-xs tracking-widest opacity-70">LEDGER</div>
                    <h1 className="font-[Cinzel] text-3xl text-[#1a1a1a]">
                        Dragons Ledger
                    </h1>
                    <div className="mt-1 text-sm opacity-80">
                        {filtered.length} of {items.length} records
                    </div>
                </div>

                <button
                    onClick={load}
                    className="rounded-xl border border-black/25 bg-black/10 px-4 py-2 text-sm hover:bg-black/15"
                >
                    Refresh
                </button>
            </div>

            {/* filtros */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="space-y-1">
                    <div className="text-xs opacity-70">Search</div>
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Name or species…"
                        className="w-full rounded-xl border border-black/20 bg-white/30 px-3 py-2 text-sm outline-none focus:border-black/40"
                    />
                </div>

                <div className="space-y-1">
                    <div className="text-xs opacity-70">State</div>
                    <select
                        value={state}
                        onChange={(e) => setState(e.target.value as any)}
                        className="w-full rounded-xl border border-black/20 bg-white/30 px-3 py-2 text-sm outline-none focus:border-black/40"
                    >
                        <option value="ALL">All</option>
                        <option value="ASSIGNED">Assigned</option>
                        <option value="IN_PROGRESS">In progress</option>
                        <option value="AT_RISK">At risk</option>
                        <option value="CLOSED">Closed</option>
                    </select>
                </div>

                <div className="space-y-1">
                    <div className="text-xs opacity-70">Min aggression: {minAggro}</div>
                    <input
                        type="range"
                        min={0}
                        max={100}
                        value={minAggro}
                        onChange={(e) => setMinAggro(Number(e.target.value))}
                        className="w-full"
                    />
                </div>
            </div>

            {/* contenido */}
            {loading ? (
                <div className="rounded-2xl border border-black/20 bg-white/10 p-6 text-sm">
                    Loading ledger…
                </div>
            ) : err ? (
                <div className="rounded-2xl border border-black/20 bg-white/10 p-6 text-sm">
                    <div className="mb-2 font-semibold">Could not load dragons</div>
                    <div className="opacity-80">{err}</div>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((d) => (
                        <div
                            key={d.id}
                            className="rounded-2xl border border-black/25 bg-[#f3e7c7] p-5 shadow-xl shadow-black/25"
                        >
                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <div className="font-[Cinzel] text-xl text-[#1a1a1a]">
                                            {d.name}
                                        </div>
                                        <Badge>{stateLabel(d.state)}</Badge>
                                    </div>
                                    <div className="mt-1 text-sm opacity-80">
                                        Species: <span className="font-semibold">{d.speciesType}</span>
                                    </div>
                                </div>

                                <div className="w-full max-w-sm">
                                    <AggroBar value={d.aggression} />
                                </div>

                                <div className="flex justify-end">
                                    <Link
                                        to={`/dragons/${d.id}`}
                                        className="rounded-xl border border-black/25 bg-black/10 px-4 py-2 text-sm hover:bg-black/15"
                                    >
                                        Open dossier →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}

                    {filtered.length === 0 && (
                        <div className="rounded-2xl border border-black/20 bg-white/10 p-6 text-sm">
                            No dragons match the current filters.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
