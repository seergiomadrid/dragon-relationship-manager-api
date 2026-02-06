import { Outlet } from "react-router-dom";

export function AppShell() {
    return (
        <div className="min-h-screen w-full bg-[#0b0c0f]">
            {/* “humo”/viñeta */}
            <div className="pointer-events-none fixed inset-0 opacity-70 [background:radial-gradient(ellipse_at_center,rgba(255,255,255,0.08),rgba(0,0,0,0.85)_65%)]" />

            {/* contenedor centrado */}
            <div className="relative mx-auto w-full max-w-6xl px-6 py-10">
                <Outlet />
            </div>
        </div>
    );
}
