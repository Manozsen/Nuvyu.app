import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        mint: "#00FFA3",
      },
      fontFamily: {
        jakarta: ["var(--font-jakarta)"],
      },
    },
  },
  plugins: [],
};
export default config;
