import React from "react";

export function OrnatePanel({
    title,
    subtitle,
    right,
    children,
    className = "",
}: {
    title?: string;
    subtitle?: string;
    right?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <section
            className={[
                "relative overflow-hidden rounded-[30px]",
                "border border-[#c7a75a]/15 bg-black/30",
                "shadow-[0_18px_70px_rgba(0,0,0,0.60)]",
                className,
            ].join(" ")}
        >
            {/* Decorative corners */}
            <div className="pointer-events-none absolute inset-0 opacity-90">
                <div className="absolute -top-16 -left-16 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(240,210,138,0.10),transparent_60%)]" />
                <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(240,122,42,0.08),transparent_60%)]" />
            </div>

            {/* Inner frame */}
            <div className="relative p-5 md:p-6">
                {(title || subtitle || right) && (
                    <header className="mb-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                            <div className="min-w-0">
                                {title && (
                                    <div className="font-cinzel text-2xl tracking-wide text-[#f0d28a]/95">
                                        {title}
                                    </div>
                                )}
                                {subtitle && (
                                    <div className="mt-1 text-sm text-white/65">{subtitle}</div>
                                )}
                            </div>
                            {right && <div className="shrink-0">{right}</div>}
                        </div>
                        <div className="mt-4 rune-divider" />
                    </header>
                )}

                <div className="relative">{children}</div>
            </div>
        </section>
    );
}
