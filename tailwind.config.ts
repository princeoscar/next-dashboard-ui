import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
  rubixTeal: "#99F6E4",       // Use for primary highlights/buttons
  rubixTealLight: "#F0FDFA",  // Use for background panels
  rubixRose: "#FBCFE8",       // Use for secondary accents/badges
  rubixRoseLight: "#FFF1F2",  // Use for hover states
  rubixAmber: "#FDE68A",      // Use for warnings/alerts
  rubixAmberLight: "#FFFBEB"  // Use for background callouts
}

    },
  },
  plugins: [],
};
export default config;
