/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        college: {
          blue: "#0F2B5C", // Navy blue
          accent: "#1A56DB", // Royal blue
          light: "#EBF2FF",
          gold: "#D97706",
          goldLight: "#FEF3C7",
          dark: "#0B192C",
        },
      },
      fontFamily: {
        sans: ["var(--font-sarabun)", "Sarabun", "sans-serif"],
        display: ["var(--font-prompt)", "Prompt", "sans-serif"],
      },
    },
  },
  plugins: [],
};
