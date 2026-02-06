import type { ReactNode } from "react";

export function ParchmentCard({ children }: { children: ReactNode }) {
    return (
        <div className="rounded-2xl border border-black/25 bg-[#f3e7c7] shadow-lg shadow-black/25">
            <div className="rounded-2xl bg-gradient-to-b from-white/35 to-black/5 p-6">
                {children}
            </div>
        </div>
    );
}
