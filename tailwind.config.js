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
    extend: {},
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
};
