import { nextui } from "@nextui-org/theme";
import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#19c2a0",
        },
        background: { DEFAULT: "hsla(var(--background))" },
        foreground: { DEFAULT: "hsla(var(--foreground))" },
      },
    },
  },
  darkMode: "class",
  plugins: [nextui()],
} satisfies Config;
