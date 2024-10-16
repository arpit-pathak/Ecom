/** @type {import('tailwindcss').Config} */
const plugin = require("tailwindcss/plugin");

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{html,js",
    "./node_modules/tw-elements/dist/js/**/*.js",
  ],
  theme: {
    extend: {
      colors: {
        warning: "#FF0000",
        orangeButton: "#F5AB35",
        greyDivider: "#F5F5F6",
        orangeGradiant1: "#ED9106",
        orangeGradiant2: "#F5AA33",
        darkOrange: "#F2994A",
        greyBorder: "#333333",
        redColor: "#EB5757",
        paleOrange: "rgba(245, 171, 53, 0.1)",
        paleOrange2: "rgba(245, 217, 172, 0.1)",
        grey6Border: "#F2F2F2",
        grey4Border: "#BDBDBD",
        green2: "#27AE60",
        pendingStatus: "#ECC521",
        customOrangeButton: "rgba(245, 171, 53, 0.44)",
        mildOrange: "#ffedd0",
        wolfgrey: "#4A5759",
        blue: "#296DFF",
      },
      boxShadow: {
        productListing: "0px 0px 16px 0px rgba(0, 0, 0, 0.08)",
      },
      transitionDuration: {
        // Control the duration of the animation
        400: "400ms",
      },
      transitionTimingFunction: {
        // Choose the ease function for the animation
        "custom-ease": "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      screens: {
        xs: "320px",
        // => @media (min-width: 320px) { ... }
        
        sm: "640px",
        // => @media (min-width: 640px) { ... }

        md: "768px",
        // => @media (min-width: 768px) { ... }

        lg: "1024px",
        // => @media (min-width: 1024px) { ... }

        xl: "1280px",
        // => @media (min-width: 1280px) { ... }

        "2xl": "1536px",
        // => @media (min-width: 1536px) { ... }
      },
      fontFamily: {
        'playfair': ['Playfair Display', 'serif'],
      },
    },
  },
  plugins: [
    require("tw-elements/dist/plugin"),
    plugin(({ addVariant, e }) => {
      addVariant("sidebar-expanded", ({ modifySelectors, separator }) => {
        modifySelectors(
          ({ className }) =>
            `.sidebar-expanded .${e(
              `sidebar-expanded${separator}${className}`
            )}`
        );
      });
    }),
  ],
  darkMode: "class",
};
