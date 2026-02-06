import { Link } from "react-router-dom";

export function Header() {
    return (
        <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-6 text-[#f3e7c7]">
            <Link to="/dragons" className="text-xl tracking-wide" style={{ fontFamily: "Cinzel, serif" }}>
                Dragon Relationship Manager
            </Link>
            <div className="text-sm opacity-80">Ledger of the Guild</div>
        </header>
    );
}
