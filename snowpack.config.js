// Snowpack Configuration File
// See all supported options: https://www.snowpack.dev/#configuration

/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  alias: {
    react: "preact/compat",
    "react-dom": "preact/compat",
  },
  buildOptions: {
    clean: true,
  },
  plugins: ["@snowpack/plugin-postcss", "@snowpack/plugin-webpack"],
}
