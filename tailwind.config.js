const colors = require("tailwindcss/colors");
const defaultTheme = require("tailwindcss/defaultTheme");
module.exports = {
  mode: "jit",
  content: ["./htdocs/**/*.{html,php,js}", "./source/**/*.{html,php,js}"],
  important: true,
  plugins: [require("@tailwindcss/typography")],
  theme: {
    extend: {
      screens: {
        punchsize: "350px",
      },
      colors: {
        gray: colors.neutral,
      },
      fontFamily: {
        fun: ["Raleway", ...defaultTheme.fontFamily.sans],
        mono: [...defaultTheme.fontFamily.mono],
        sans: ["Inconsolata", ...defaultTheme.fontFamily.sans],
        serif: [...defaultTheme.fontFamily.serif],
      },
    },
  },
};
