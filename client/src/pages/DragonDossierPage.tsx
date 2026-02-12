/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { OrnatePanel } from "../components/ui/OrnatePanel";
import { RuneButton } from "../components/ui/RuneButton";

type DragonState = "ASSIGNED" | "IN_PROGRESS" | "AT_RISK" | "CLOSED";
type EncounterType = "NEGOTIATION" | "COMBAT" | "BRIBE" | "OBSERVATION";
type EncounterOutcome = "SUCCESS" | "NEUTRAL" | "FAIL";

// Ajusta si tu enum de Prisma tiene otros valores
type DragonOutcome = "DOMESTICATED" | "ONE_TIME_DEAL" | "ELIMINATED";

type Dragon = {
    id: string;
    name: string;
    speciesType: string;
    aggression: number;
    state: DragonState;
    ownerHunterId?: string | null;
    outcome?: DragonOutcome | null;
    lastEncounterAt?: string | null;
};

type Encounter = {
    id: string;
    dragonId: string;
    performedById: string;
    type: EncounterType;
    outcome: EncounterOutcome;
    aggressionDelta: number | null;
    notes: string | null;
    createdAt: string; // ISO
};

function pillTone(state: DragonState) {
    if (state === "AT_RISK") return "border-[#b12d2d]/25 bg-[#b12d2d]/10 text-[#f0d28a]/95";
    if (state === "CLOSED") return "border-white/10 bg-black/20 text-white/70";
    return "border-[#f0d28a]/18 bg-black/25 text-white/85";
}

function outcomeTone(o: EncounterOutcome) {
    if (o === "SUCCESS") return "border-[#f0d28a]/18 bg-black/25 text-[#f0d28a]/95";
    if (o === "FAIL") return "border-[#b12d2d]/25 bg-[#b12d2d]/10 text-[#f0d28a]/95";
    return "border-white/10 bg-black/20 text-white/80";
}

function encounterIcon(t: EncounterType) {
    switch (t) {
        case "NEGOTIATION":
            return "✒";
        case "COMBAT":
            return "⚔";
        case "BRIBE":
            return "⛁";
        case "OBSERVATION":
            return "👁";
    }
}

function fmtDate(iso: string) {
    try {
        const d = new Date(iso);
        return d.toLocaleString(undefined, {
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return iso;
    }
}

function DeltaBadge({ delta }: { delta?: number | null }) {
    const v = typeof delta === "number" ? delta : 0;
    const sign = v > 0 ? "+" : "";
    const tone =
        v > 0
            ? "border-[#b12d2d]/25 bg-[#b12d2d]/10 text-[#f0d28a]/95"
            : v < 0
                ? "border-[#f0d28a]/18 bg-black/25 text-[#f0d28a]/95"
                : "border-white/10 bg-black/20 text-white/80";

    return (
        <span className={["inline-flex items-center rounded-full border px-3 py-1.5 text-sm", tone].join(" ")}>
            Δ Aggro {sign}
            {v}
        </span>
    );
}

export function DragonDossierPage() {
    const { dragonId } = useParams();

    const [dragon, setDragon] = useState<Dragon | null>(null);
    const [encounters, setEncounters] = useState<Encounter[]>([]);

    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    const [loadingEnc, setLoadingEnc] = useState(true);
    const [errEnc, setErrEnc] = useState<string | null>(null);

    // Create encounter form
    const [type, setType] = useState<EncounterType>("NEGOTIATION");
    const [encOutcome, setEncOutcome] = useState<EncounterOutcome>("NEUTRAL");
    const [notes, setNotes] = useState("");
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState<string | null>(null);

    // Close dragon form
    const [closeOutcome, setCloseOutcome] = useState<DragonOutcome>("DOMESTICATED");
    const [closeNotes, setCloseNotes] = useState("");
    const [closing, setClosing] = useState(false);
    const [closeMsg, setCloseMsg] = useState<string | null>(null);

    const isClosed = useMemo(() => dragon?.state === "CLOSED", [dragon?.state]);

    async function loadDragon() {
        if (!dragonId) return;
        setLoading(true);
        setErr(null);
        try {
            const d = await api<Dragon>(`/dragons/${dragonId}`);
            setDragon(d);
            // Si ya viene outcome, sincroniza el selector (para UI consistente)
            if (d?.outcome) setCloseOutcome(d.outcome);
        } catch (e: any) {
            setErr(e?.message ?? "Failed to load dragon dossier");
            setDragon(null);
        } finally {
            setLoading(false);
        }
    }

    async function loadEncounters() {
        if (!dragonId) return;
        setLoadingEnc(true);
        setErrEnc(null);
        try {
            const data = await api<Encounter[]>(`/dragons/${dragonId}/encounters`);
            setEncounters(data);
        } catch (e: any) {
            setErrEnc(e?.message ?? "Failed to load encounter chronicle");
            setEncounters([]);
        } finally {
            setLoadingEnc(false);
        }
    }

    async function refreshAll() {
        await Promise.all([loadDragon(), loadEncounters()]);
    }

    useEffect(() => {
        refreshAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dragonId]);

    async function createEncounter() {
        if (!dragonId || isClosed) return;
        setSaving(true);
        setSaveMsg(null);

        try {
            await api("/encounters", {
                method: "POST",
                body: JSON.stringify({
                    dragonId,
                    type,
                    outcome: encOutcome,
                    notes: notes || null,
                }),
            });

            setNotes("");
            setSaveMsg("Encounter recorded in the archive.");
            await refreshAll();
        } catch (e: any) {
            setSaveMsg(e?.message ?? "Failed to record encounter");
        } finally {
            setSaving(false);
        }
    }

    async function closeDragon() {
        if (!dragonId || isClosed) return;
        setClosing(true);
        setCloseMsg(null);

        try {
            await api(`/dragons/${dragonId}/close`, {
                method: "PATCH",
                body: JSON.stringify({
                    outcome: closeOutcome,
                    notes: closeNotes || undefined,
                }),
            });

            setCloseMsg("Fate sealed. The dossier is now closed.");
            await refreshAll();
        } catch (e: any) {
            setCloseMsg(e?.message ?? "Failed to close dragon");
        } finally {
            setClosing(false);
        }
    }

    return (
        <div className="space-y-6">
            <OrnatePanel
                title="Dragon Dossier"
                subtitle="A sealed record of flame, motive, and consequence."
                right={
                    <div className="flex items-center gap-3">
                        <Link
                            to="/dragons"
                            className="rounded-2xl border border-[#f0d28a]/15 bg-black/25 px-4 py-3 text-base text-white/85 hover:bg-black/35 transition"
                        >
                            ← Back to ledger
                        </Link>
                        <RuneButton onClick={refreshAll} className="px-5 py-3 text-base">
                            Refresh
                        </RuneButton>
                    </div>
                }
            >
                {loading ? (
                    <div className="rounded-2xl border border-[#f0d28a]/12 bg-black/25 p-6 text-base text-white/75">
                        Unsealing dossier…
                    </div>
                ) : err ? (
                    <div className="rounded-2xl border border-[#b12d2d]/20 bg-[#b12d2d]/10 p-6 text-base text-white/80">
                        <div className="font-cinzel text-[#f0d28a]/90 text-xl">Could not load dossier</div>
                        <div className="mt-2 text-white/70">{err}</div>
                    </div>
                ) : !dragon ? (
                    <div className="rounded-2xl border border-[#f0d28a]/12 bg-black/25 p-6 text-base text-white/75">
                        No dragon found with ID <span className="text-white/85">{dragonId}</span>.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                        {/* Left */}
                        <div className="space-y-5">
                            <div className="rounded-[26px] border border-[#f0d28a]/12 bg-black/25 p-5">
                                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                    <div className="min-w-0">
                                        <div className="font-cinzel text-4xl text-[#f0d28a]/95 tracking-wide">
                                            {dragon.name}
                                        </div>

                                        <div className="mt-2 text-lg text-white/75">
                                            Species:{" "}
                                            <span className="text-white/92 font-semibold">{dragon.speciesType}</span>
                                        </div>

                                        <div className="mt-2 text-sm text-white/55">
                                            Record ID: <span className="text-white/70">{dragon.id}</span>
                                        </div>

                                        {dragon.lastEncounterAt && (
                                            <div className="mt-2 text-sm text-white/55">
                                                Last encounter:{" "}
                                                <span className="text-white/70">{fmtDate(dragon.lastEncounterAt)}</span>
                                            </div>
                                        )}

                                        {isClosed && dragon.outcome && (
                                            <div className="mt-3 text-base text-white/75">
                                                Outcome:{" "}
                                                <span className="text-[#f0d28a]/90 font-semibold">{dragon.outcome}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                        <span
                                            className={[
                                                "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm border",
                                                pillTone(dragon.state),
                                            ].join(" ")}
                                        >
                                            <span className="opacity-80">⛬</span>
                                            <span className="tracking-wide">{dragon.state}</span>
                                        </span>

                                        <span className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm border border-[#f0d28a]/12 bg-black/20 text-white/80">
                                            <span className="opacity-80">🔥</span>
                                            Aggro {dragon.aggression}/100
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-5 rune-divider" />

                                <div className="mt-4 text-lg text-white/72 leading-relaxed">
                                    This dossier is maintained by the Guild. Encounters alter aggression and may
                                    shift the creature’s state toward fate.
                                </div>

                                {isClosed && (
                                    <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-base text-white/75">
                                        This record is sealed. No further encounters may be inscribed.
                                    </div>
                                )}
                            </div>

                            {/* Timeline */}
                            <div className="rounded-[26px] border border-[#f0d28a]/12 bg-black/25 p-5">
                                <div className="flex items-center justify-between">
                                    <div className="font-cinzel text-xl text-[#f0d28a]/90">Encounter Chronicle</div>
                                    <div className="text-sm text-white/55">
                                        {loadingEnc ? "Fetching…" : `${encounters.length} entries`}
                                    </div>
                                </div>

                                <div className="mt-3 rune-divider" />

                                {loadingEnc ? (
                                    <div className="mt-4 rounded-2xl border border-[#f0d28a]/10 bg-black/20 p-4 text-base text-white/75">
                                        Summoning the chronicle…
                                    </div>
                                ) : errEnc ? (
                                    <div className="mt-4 rounded-2xl border border-[#b12d2d]/20 bg-[#b12d2d]/10 p-4 text-base text-white/80">
                                        <div className="font-cinzel text-[#f0d28a]/90 text-lg">Chronicle unavailable</div>
                                        <div className="mt-1 text-white/70">{errEnc}</div>
                                    </div>
                                ) : encounters.length === 0 ? (
                                    <div className="mt-4 rounded-2xl border border-[#f0d28a]/10 bg-black/20 p-4 text-base text-white/75">
                                        No encounters recorded yet. Write the first line of history.
                                    </div>
                                ) : (
                                    <div className="mt-4 space-y-3">
                                        {encounters.map((e) => (
                                            <div
                                                key={e.id}
                                                className="rounded-2xl border border-[#f0d28a]/10 bg-black/20 p-4"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-0.5 h-10 w-10 rounded-2xl border border-[#f0d28a]/15 bg-black/25 grid place-items-center text-[#f0d28a]/85 text-lg">
                                                        {encounterIcon(e.type)}
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <div className="font-cinzel text-base tracking-wide text-white/92">
                                                                {e.type}
                                                            </div>

                                                            <span
                                                                className={[
                                                                    "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm border",
                                                                    outcomeTone(e.outcome),
                                                                ].join(" ")}
                                                            >
                                                                <span className="opacity-80">✦</span>
                                                                <span className="tracking-wide">{e.outcome}</span>
                                                            </span>

                                                            <DeltaBadge delta={e.aggressionDelta} />
                                                        </div>

                                                        {e.notes && (
                                                            <div className="mt-2 text-base text-white/75 leading-relaxed">
                                                                {e.notes}
                                                            </div>
                                                        )}

                                                        <div className="mt-2 text-sm text-white/55">
                                                            Scribed: <span className="text-white/70">{fmtDate(e.createdAt)}</span>
                                                            {" · "}
                                                            By: <span className="text-white/70">{e.performedById}</span>
                                                        </div>
                                                    </div>

                                                    <div className="text-sm text-white/55">{fmtDate(e.createdAt)}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right */}
                        <div className="space-y-5">
                            {/* Create encounter */}
                            <div className="rounded-[26px] border border-[#f0d28a]/12 bg-black/25 p-5">
                                <div className="font-cinzel text-xl text-[#f0d28a]/90">Record an Encounter</div>
                                <div className="mt-2 text-base text-white/70">
                                    Posts to <span className="text-white/85">POST /encounters</span>.
                                </div>

                                <div className="mt-3 rune-divider" />

                                {isClosed ? (
                                    <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-base text-white/75">
                                        The ledger is sealed. Encounters can no longer be added.
                                    </div>
                                ) : (
                                    <div className="mt-4 space-y-4">
                                        <div className="space-y-2">
                                            <div className="text-sm tracking-[0.22em] text-white/55">TYPE</div>
                                            <select
                                                value={type}
                                                onChange={(ev) => setType(ev.target.value as EncounterType)}
                                                className="w-full rounded-2xl border border-[#f0d28a]/15 bg-black/25 px-4 py-3 text-base text-white/92 outline-none focus:border-[#f0d28a]/30"
                                            >
                                                <option value="NEGOTIATION">NEGOTIATION</option>
                                                <option value="COMBAT">COMBAT</option>
                                                <option value="BRIBE">BRIBE</option>
                                                <option value="OBSERVATION">OBSERVATION</option>
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="text-sm tracking-[0.22em] text-white/55">OUTCOME</div>
                                            <select
                                                value={encOutcome}
                                                onChange={(ev) => setEncOutcome(ev.target.value as EncounterOutcome)}
                                                className="w-full rounded-2xl border border-[#f0d28a]/15 bg-black/25 px-4 py-3 text-base text-white/92 outline-none focus:border-[#f0d28a]/30"
                                            >
                                                <option value="SUCCESS">SUCCESS</option>
                                                <option value="NEUTRAL">NEUTRAL</option>
                                                <option value="FAIL">FAIL</option>
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="text-sm tracking-[0.22em] text-white/55">NOTES</div>
                                            <textarea
                                                value={notes}
                                                onChange={(ev) => setNotes(ev.target.value)}
                                                className="min-h-[130px] w-full resize-none rounded-2xl border border-[#f0d28a]/15 bg-black/25 px-4 py-3 text-base text-white/92 outline-none focus:border-[#f0d28a]/30 focus:shadow-[0_0_0_4px_rgba(240,210,138,0.07)]"
                                                placeholder="Write as a guild logbook…"
                                            />
                                            <div className="text-sm text-white/50">Max 500 chars recommended.</div>
                                        </div>

                                        <RuneButton disabled={saving} onClick={createEncounter} className="w-full py-3 text-base">
                                            {saving ? "Inscribing…" : "Seal Encounter"}
                                        </RuneButton>

                                        {saveMsg && (
                                            <div className="rounded-2xl border border-[#f0d28a]/12 bg-black/20 p-4 text-base text-white/78">
                                                {saveMsg}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Close dragon */}
                            <div className="rounded-[26px] border border-[#f0d28a]/12 bg-black/25 p-5">
                                <div className="font-cinzel text-xl text-[#f0d28a]/90">Seal the Fate</div>
                                <div className="mt-2 text-base text-white/70">
                                    Posts to <span className="text-white/85">PATCH /dragons/:id/close</span>.
                                </div>

                                <div className="mt-3 rune-divider" />

                                {isClosed ? (
                                    <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-base text-white/75">
                                        This dragon is already sealed as{" "}
                                        <span className="text-[#f0d28a]/90 font-semibold">
                                            {dragon.outcome ?? "UNKNOWN"}
                                        </span>
                                        .
                                    </div>
                                ) : (
                                    <div className="mt-4 space-y-4">
                                        <div className="space-y-2">
                                            <div className="text-sm tracking-[0.22em] text-white/55">OUTCOME</div>
                                            <select
                                                value={closeOutcome}
                                                onChange={(ev) => setCloseOutcome(ev.target.value as DragonOutcome)}
                                                className="w-full rounded-2xl border border-[#f0d28a]/15 bg-black/25 px-4 py-3 text-base text-white/92 outline-none focus:border-[#f0d28a]/30"
                                            >
                                                <option value="DOMESTICATED">DOMESTICATED</option>
                                                <option value="ONE_TIME_DEAL">ONE_TIME_DEAL</option>
                                                <option value="ELIMINATED">ELIMINATED</option>
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="text-sm tracking-[0.22em] text-white/55">NOTES (optional)</div>
                                            <textarea
                                                value={closeNotes}
                                                onChange={(ev) => setCloseNotes(ev.target.value)}
                                                className="min-h-[120px] w-full resize-none rounded-2xl border border-[#f0d28a]/15 bg-black/25 px-4 py-3 text-base text-white/92 outline-none focus:border-[#f0d28a]/30 focus:shadow-[0_0_0_4px_rgba(240,210,138,0.07)]"
                                                placeholder="Final guild statement… (max 500)"
                                                maxLength={500}
                                            />
                                            <div className="text-sm text-white/50">
                                                {closeNotes.length}/500
                                            </div>
                                        </div>

                                        <RuneButton
                                            disabled={closing}
                                            onClick={closeDragon}
                                            className="w-full py-3 text-base"
                                        >
                                            {closing ? "Sealing…" : "Close Dragon"}
                                        </RuneButton>

                                        {closeMsg && (
                                            <div className="rounded-2xl border border-[#f0d28a]/12 bg-black/20 p-4 text-base text-white/78">
                                                {closeMsg}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </OrnatePanel>
        </div>
    );
}
