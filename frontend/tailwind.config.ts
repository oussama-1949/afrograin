// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#B08550",
          light: "#C5A377",
          dark: "#8E6B41",
        },
        afroblack: "#1A1A1A",
        afrogray: "#F9F9F7", // Subtle off-white for sections
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "serif"],
        sans: ["var(--font-jakarta)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;