import { defineConfig } from "vite"
import preactRefresh from "@prefresh/vite"
import WindiCSS from "vite-plugin-windicss"
import { VitePWA } from "vite-plugin-pwa"
import { readFileSync } from "fs"

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      react: "preact/compat",
      "react-dom": "preact/compat",
    },
  },
  esbuild: {
    jsxFactory: "h",
    jsxFragment: "Fragment",
    // jsxInject: `import { h, Fragment } from 'preact'`,
  },
  plugins: [
    WindiCSS(),
    preactRefresh(),
    VitePWA({
      manifest: JSON.parse(
        readFileSync("./public/manifest.webmanifest", "utf-8")
      ),
    }),
  ],
})
