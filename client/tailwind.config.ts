import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        title: ["Cinzel", "serif"],
        body: ["Crimson Text", "serif"],
      },
      colors: {
        parchment: "#f3e7c7",
        ink: "#151515",
        stone: "#1b1b1b",
        wax: "#7a1e1e",
      },
    },
  },
} satisfies Config;
