/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import { OrnatePanel } from "../components/ui/OrnatePanel";
import { RuneButton } from "../components/ui/RuneButton";
import { queryClient } from "../app/queryClient";

export function LoginPage() {
    const nav = useNavigate();
    const [email, setEmail] = useState("admin@drm.com");
    const [password, setPassword] = useState("123456");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await login(email, password);
            await queryClient.invalidateQueries({ queryKey: ["me"] });
            nav("/dragons");
        } catch (err: any) {
            setError(err?.response?.data?.message ?? "Login failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="noise vignette min-h-screen relative overflow-hidden">
            {/* Background “castle hall” vibes */}
            <div className="pointer-events-none absolute inset-0 opacity-70 bg-[radial-gradient(ellipse_at_top,rgba(240,210,138,0.10),transparent_60%)]" />
            <div className="pointer-events-none absolute inset-0 opacity-60 bg-[radial-gradient(ellipse_at_bottom,rgba(240,122,42,0.07),transparent_60%)]" />

            {/* Floating embers */}
            <div className="pointer-events-none absolute inset-0 opacity-50">
                <div className="absolute left-[10%] top-[18%] h-2 w-2 rounded-full bg-[#f0d28a]/60 blur-[1px]" />
                <div className="absolute left-[25%] top-[70%] h-1.5 w-1.5 rounded-full bg-[#f07a2a]/60 blur-[1px]" />
                <div className="absolute left-[72%] top-[35%] h-2 w-2 rounded-full bg-[#f0d28a]/45 blur-[1px]" />
                <div className="absolute left-[82%] top-[78%] h-1.5 w-1.5 rounded-full bg-[#f07a2a]/55 blur-[1px]" />
            </div>

            <div className="relative min-h-screen flex items-center justify-center px-4">
                <div className="w-full max-w-xl">
                    <OrnatePanel
                        title="Entrance to the Guild"
                        subtitle="Present your credentials. The ledger shall unseal."
                        right={
                            <div className="h-12 w-12 rounded-2xl border border-[#f0d28a]/20 bg-black/20 grid place-items-center shadow-[0_0_50px_rgba(240,210,138,0.12)]">
                                🜁
                            </div>
                        }
                    >
                        <form onSubmit={onSubmit} className="space-y-4">
                            <div className="grid gap-2">
                                <label className="text-xs tracking-[0.28em] text-white/55">
                                    EMAIL
                                </label>
                                <input
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full rounded-2xl border border-[#f0d28a]/15 bg-black/25 px-4 py-3 text-sm text-white/90 outline-none focus:border-[#f0d28a]/30 focus:shadow-[0_0_0_4px_rgba(240,210,138,0.08)]"
                                    placeholder="guildmaster@drm.com"
                                />
                            </div>

                            <div className="grid gap-2">
                                <label className="text-xs tracking-[0.28em] text-white/55">
                                    PASSWORD
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full rounded-2xl border border-[#f0d28a]/15 bg-black/25 px-4 py-3 text-sm text-white/90 outline-none focus:border-[#f0d28a]/30 focus:shadow-[0_0_0_4px_rgba(240,210,138,0.08)]"
                                    placeholder="••••••••"
                                />
                            </div>

                            {error && (
                                <div className="rounded-2xl border border-[#b12d2d]/25 bg-[#b12d2d]/10 p-4 text-sm text-white/90">
                                    <div className="font-cinzel text-[#f0d28a]/90">Seal rejected</div>
                                    <div className="mt-1 text-white/70">{error}</div>
                                </div>
                            )}

                            <RuneButton type="submit" disabled={loading} className="w-full py-3">
                                {loading ? "Sealing the pact..." : "Enter the Archive"}
                            </RuneButton>

                            <div className="mt-4 text-xs text-white/50 leading-relaxed">
                                Demo accounts: <span className="text-[#f0d28a]/80">admin@drm.com</span> /
                                <span className="text-[#f0d28a]/80"> 123456</span>
                            </div>
                        </form>
                    </OrnatePanel>
                </div>
            </div>
        </div>
    );
}
