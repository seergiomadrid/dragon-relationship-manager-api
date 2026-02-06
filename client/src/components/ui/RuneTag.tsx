export function RuneTag({ text }: { text: string }) {
    return (
        <span className="inline-flex items-center rounded-full border border-black/20 bg-black/5 px-3 py-1 text-sm">
            {text}
        </span>
    );
}
