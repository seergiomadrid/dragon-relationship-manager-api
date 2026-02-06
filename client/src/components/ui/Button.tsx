import type { ButtonHTMLAttributes } from "react";

export function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) {
    const { className = "", ...rest } = props;
    return (
        <button
            className={
                "rounded-xl border border-black/30 bg-[#1f1b16] text-[#f3e7c7] px-4 py-2 font-semibold shadow-md shadow-black/30 hover:bg-[#2a241d] active:bg-[#17130f] " +
                className
            }

            {...rest}
        />
    );
}
