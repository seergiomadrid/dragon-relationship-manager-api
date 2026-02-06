import type { InputHTMLAttributes } from "react";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
    const { className = "", ...rest } = props;
    return (
        <input
            className={
                "w-full rounded-xl border border-black/25 bg-white/40 px-3 py-2 outline-none focus:ring-2 focus:ring-black/20 " +
                className
            }
            {...rest}
        />
    );
}
