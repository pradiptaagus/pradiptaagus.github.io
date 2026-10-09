const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  prefix: "tw-",
  darkMode: ["selector", '[data-theme="dark"]'],
  content: [
    "./layouts/**/*.html",
    "./content/**/*.md",
    "./themes/PaperMod/layouts/**/*.html",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
};
