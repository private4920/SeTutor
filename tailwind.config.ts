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
        brand: {
          neon: "#CCFF00",
          black: "#050505", // Keep for strong contrast elements
          "dark-grey": "#0A0A0A", // Keep for dark sections
          grey: "#F3F4F6", // Light grey for cards
          light: "#FFFFFF",
          "off-white": "#F9FAFB",
          border: "#E5E7EB",
        },
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-subtle": "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
