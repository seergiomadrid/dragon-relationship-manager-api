import React from "react";

export function RuneButton({
    children,
    className = "",
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...props}
            className={[
                "relative inline-flex items-center justify-center gap-2",
                "rounded-2xl px-4 py-2.5 text-sm transition",
                "border border-[#f0d28a]/18 bg-black/25 hover:bg-black/35",
                "text-[#f3f1ea] shadow-[0_10px_30px_rgba(0,0,0,0.45)]",
                "hover:shadow-[0_12px_40px_rgba(0,0,0,0.55)]",
                "active:translate-y-[1px]",
                className,
            ].join(" ")}
        >
            <span className="text-[#f0d28a]/80">✦</span>
            <span className="font-cinzel tracking-wide">{children}</span>
            <span className="text-[#f0d28a]/60">✦</span>

            <span className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition">
                <span className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_30%_20%,rgba(240,210,138,0.12),transparent_55%)]" />
            </span>
        </button>
    );
}
