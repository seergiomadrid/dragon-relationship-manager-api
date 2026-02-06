/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ParchmentCard } from "../components/ui/ParchmentCard";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { login } from "../api/auth";

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
            nav("/dragons");
        } catch (err: any) {
            setError(err?.response?.data?.message ?? "Login failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen text-[#151515] bg-[#141414]
            bg-[radial-gradient(circle_at_top,#2b2b2b,transparent_60%)]
            relative overflow-hidden">
            <div className="pointer-events-none absolute inset-0
                bg-[radial-gradient(circle_at_center,transparent_55%,rgba(0,0,0,0.55))]
            " />
            <div className="flex min-h-screen w-full items-center justify-center px-4">
                <div className="w-full max-w-xl">
                    <ParchmentCard>
                        <h1 className="mb-2 text-3xl" style={{ fontFamily: "Cinzel, serif" }}>
                            Entrance to the Guild
                        </h1>
                        <p className="mb-6 opacity-80">
                            Present your credentials and the ledger shall open.
                        </p>

                        <form onSubmit={onSubmit} className="space-y-4">
                            <div>
                                <div className="mb-1 text-sm font-semibold">Email</div>
                                <Input value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>
                            <div>
                                <div className="mb-1 text-sm font-semibold">Password</div>
                                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                            </div>

                            {error && (
                                <div className="rounded-xl border border-black/20 bg-black/5 p-3 text-sm">
                                    {error}
                                </div>
                            )}

                            <Button type="submit" disabled={loading} className="w-full">
                                {loading ? "Sealing the pact..." : "Enter"}
                            </Button>
                        </form>
                    </ParchmentCard>
                </div>
            </div>
        </div>
    );
}
