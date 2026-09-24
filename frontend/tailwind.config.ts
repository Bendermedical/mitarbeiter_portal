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
        // BMV Design System v1.0 Palette (§2)
        neutral: {
          0: "#FFFFFF",
          50: "#F7F9FB",
          100: "#EEF1F5",
          200: "#DFE4EA",
          300: "#C4CCD6",
          500: "#7C8798",
          700: "#3F4A5A",
          900: "#161C24",
        },
        brand: {
          50: "#EDF3FA",
          100: "#D3E3F3",
          300: "#7CA9D6",
          500: "#215B8F", // Primary
          600: "#1A4A76", // Hover
          700: "#123657", // Active
        },
        status: {
          neutral: {
            DEFAULT: "#7C8798",
            bg: "#F7F9FB",
            text: "#3F4A5A",
            border: "#DFE4EA",
          },
          pending: {
            DEFAULT: "#B7791B",
            bg: "#FCF3E3",
            text: "#7A4E0E",
            border: "#F5D8A0",
          },
          success: {
            DEFAULT: "#1E7A52",
            bg: "#E7F5EE",
            text: "#175C3E",
            border: "#BCE5D1",
          },
          danger: {
            DEFAULT: "#B3261E",
            bg: "#FBEAE9",
            text: "#8C1D17",
            border: "#F5C2BF",
          },
          info: {
            DEFAULT: "#215B8F",
            bg: "#EDF3FA",
            text: "#123657",
            border: "#C2DAF0",
          },
        },
        // Backward compatibility alias for any existing medical references
        medical: {
          50: "#EDF3FA",
          500: "#215B8F",
          600: "#1A4A76",
          700: "#123657",
        },
      },
      borderRadius: {
        sm: "4px",   // radius-sm
        md: "8px",   // radius-md
        lg: "12px",  // radius-lg
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgba(22, 28, 36, 0.05)",
        md: "0 4px 6px -1px rgba(22, 28, 36, 0.1), 0 2px 4px -1px rgba(22, 28, 36, 0.06)",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
