import { Outlet, NavLink, useLocation } from "react-router-dom";

function NavItem({ to, label }: { to: string; label: string }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                [
                    "group relative block rounded-2xl px-4 py-3 transition",
                    "border border-[#c7a75a]/15 bg-black/20 hover:bg-black/30",
                    isActive ? "ring-1 ring-[#f0d28a]/35 shadow-[0_0_40px_rgba(240,210,138,0.10)]" : "",
                ].join(" ")
            }
        >
            <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <div className="font-cinzel text-sm tracking-wide text-[#f0d28a]/90">{label}</div>
                    <div className="mt-0.5 text-xs text-white/60 group-hover:text-white/70">
                        Guild systems & records
                    </div>
                </div>
                <div className="text-[#f0d28a]/70 group-hover:text-[#f0d28a]">➜</div>
            </div>
            <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition">
                <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_30%_20%,rgba(240,210,138,0.10),transparent_55%)]" />
            </div>
        </NavLink>
    );
}

export function AppShell() {
    const loc = useLocation();
    const showChrome = loc.pathname !== "/";

    if (!showChrome) return <Outlet />;

    return (
        <div className="noise vignette min-h-screen w-full">
            {/* Ambient layers */}
            <div className="pointer-events-none fixed inset-0 opacity-70 bg-[radial-gradient(ellipse_at_top,rgba(240,210,138,0.10),transparent_55%)]" />
            <div className="pointer-events-none fixed inset-0 opacity-60 bg-[radial-gradient(ellipse_at_bottom,rgba(240,122,42,0.06),transparent_60%)]" />

            <div className="relative mx-auto max-w-7xl px-4 py-8 md:px-8">
                {/* Top bar */}
                <div className="mb-6 rounded-[28px] border border-[#c7a75a]/15 bg-black/30 px-5 py-4 shadow-[0_18px_60px_rgba(0,0,0,0.55)]">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                            <div className="font-cinzel text-xl text-[#f0d28a]/95 tracking-wide">
                                Dragon Relationship Manager
                            </div>
                            <div className="mt-1 text-sm text-white/65">
                                Guild console • ledgers • dossiers • encounter logs
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="hidden md:block text-xs text-white/55">
                                “Steel, ink, and fire.”
                            </div>
                            <div className="h-10 w-10 rounded-2xl border border-[#f0d28a]/20 bg-[radial-gradient(circle_at_30%_20%,rgba(240,210,138,0.20),transparent_60%)] shadow-[0_0_40px_rgba(240,210,138,0.12)] grid place-items-center">
                                🐉
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main grid */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
                    {/* Sidebar */}
                    <aside className="rounded-[28px] border border-[#c7a75a]/15 bg-black/30 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.55)]">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-xs tracking-[0.32em] text-white/55">GUILD PANEL</div>
                                <div className="mt-1 font-cinzel text-lg text-[#f0d28a]/90">War Room</div>
                            </div>
                            <div className="text-[#f0d28a]/60">✷</div>
                        </div>

                        <div className="mt-4 rune-divider" />

                        <div className="mt-4 space-y-3">
                            <NavItem to="/dragons" label="Dragons Ledger" />
                        </div>

                        <div className="mt-6 rounded-2xl border border-[#f0d28a]/12 bg-black/25 p-4">
                            <div className="flex items-center justify-between">
                                <div className="font-cinzel text-sm text-[#f0d28a]/85">Guild Intel</div>
                                <div className="text-[#f0d28a]/55 text-sm">⟡</div>
                            </div>
                            <div className="mt-2 text-sm text-white/65 leading-relaxed">
                                Keep dossiers updated. Encounters shift aggression, and aggression
                                shifts fate.
                            </div>
                            <div className="mt-3 text-xs text-white/50">
                                Tip: use the dossier view to write encounter notes as if it were a logbook.
                            </div>
                        </div>
                    </aside>

                    {/* Content */}
                    <main className="min-w-0">
                        <Outlet />
                    </main>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center text-xs text-white/45">
                    Guild Archive • Version 0.1 • “Records outlive flames.”
                </div>
            </div>
        </div>
    );
}
