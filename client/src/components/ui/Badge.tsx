export function Badge({ children }: { children: string }) {
    return (
        <span className="inline-flex items-center rounded-full border border-black/25 bg-black/10 px-3 py-1 text-xs tracking-wide">
            {children}
        </span>
    );
}
