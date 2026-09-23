import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Medical Corporate Palette
        medical: {
          50: "#f0f7f9",
          100: "#e0eef3",
          200: "#b8dbe7",
          300: "#8fc8db",
          400: "#3ca2c1",
          500: "#007d9b", // Primary Teal
          600: "#006b85",
          700: "#005367",
          800: "#003e4d",
          900: "#002933",
        },
        slate: {
          850: "#15202e",
        }
      },
    },
  },
  plugins: [],
};
export default config;
