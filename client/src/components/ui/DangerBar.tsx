export function DangerBar({ value }: { value: number }) {
    const pct = Math.max(0, Math.min(100, value));
    return (
        <div className="w-full">
            <div className="mb-1 flex justify-between text-xs opacity-80">
                <span>Agresión</span>
                <span>{pct}/100</span>
            </div>
            <div className="h-3 w-full rounded-full bg-black/10">
                <div className="h-3 rounded-full bg-black/40" style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}
