import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#000000",
        surface: "#0F0F23",
        "surface-elevated": "#1E1B4B",
        accent: "#E11D48",
        foreground: "#F8FAFC",
        muted: "#94A3B8",
        border: "#312E81",
      },
      fontFamily: {
        sans: ["Poppins", "system-ui", "sans-serif"],
        display: ["Righteous", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
