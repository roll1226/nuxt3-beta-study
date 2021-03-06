import { defineNuxtConfig } from "nuxt3";

export default defineNuxtConfig({
  srcDir: "src/",
  css: ["modern-css-reset"],
  build: {
    babel: {
      presets: ["@nuxt/babel-preset-app", "vca-jsx"],
    },
  },
});
