export function AggroBar({ value }: { value: number }) {
    const v = Math.max(0, Math.min(100, value));
    return (
        <div className="w-full">
            <div className="mb-1 flex items-center justify-between text-xs opacity-80">
                <span>Aggression</span>
                <span>{v}/100</span>
            </div>
            <div className="h-2 w-full rounded-full bg-black/15">
                <div
                    className="h-2 rounded-full bg-black/60"
                    style={{ width: `${v}%` }}
                />
            </div>
        </div>
    );
}
