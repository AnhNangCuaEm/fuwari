module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{css,scss}",
  ],
  theme: {
    extend: {
      colors: {
        almond: {
          1: "hsl(var(--almond-1) / <alpha-value>)",
          2: "hsl(var(--almond-2) / <alpha-value>)",
          3: "hsl(var(--almond-3) / <alpha-value>)",
          4: "hsl(var(--almond-4) / <alpha-value>)",
          5: "hsl(var(--almond-5) / <alpha-value>)",
          6: "hsl(var(--almond-6) / <alpha-value>)",
          7: "hsl(var(--almond-7) / <alpha-value>)",
          8: "hsl(var(--almond-8) / <alpha-value>)",
          9: "hsl(var(--almond-9) / <alpha-value>)",
          10: "hsl(var(--almond-10) / <alpha-value>)",
          11: "hsl(var(--almond-11) / <alpha-value>)",
          12: "hsl(var(--almond-12) / <alpha-value>)",
        },
      },
    },
  },
  plugins: [daisyui],
};
