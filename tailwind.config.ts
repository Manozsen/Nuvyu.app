import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}", // Extra safety
  ],
  theme: {
    extend: {
      colors: {
        mint: "#00FFA3",
      },
    },
  },
  plugins: [],
};
export default config;
