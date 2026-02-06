import type { ReactNode } from "react";
import { Header } from "./Header";

export function Shell({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen w-full bg-[#141414] text-[#f3e7c7]">
            <div className="min-h-screen w-full bg-[radial-gradient(circle_at_top,#2b2b2b,transparent_60%)]">
                <Header />

                {/* ✅ Full width layout */}
                <div className="w-full px-6 pb-12">
                    <div className="grid w-full grid-cols-12 gap-6">
                        {/* Sidebar */}
                        <aside className="col-span-12 md:col-span-3">
                            <div className="rounded-2xl border border-black/30 bg-black/20 p-4 shadow-lg shadow-black/25">
                                <div className="text-sm opacity-80">Guild Panel</div>
                                <div className="mt-3 space-y-2 text-sm">
                                    <div className="rounded-xl bg-black/20 px-3 py-2">📜 Dragons</div>
                                    <div className="rounded-xl bg-black/10 px-3 py-2 opacity-80">🕯 Encounters</div>
                                    <div className="rounded-xl bg-black/10 px-3 py-2 opacity-80">🏰 Reports</div>
                                </div>
                            </div>
                        </aside>

                        {/* Content */}
                        <section className="col-span-12 md:col-span-9">
                            {children}
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
