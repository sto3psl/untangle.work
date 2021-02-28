import { defineConfig } from "vite"
import preactRefresh from "@prefresh/vite"
import WindiCSS from "vite-plugin-windicss"

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
  plugins: [WindiCSS(), preactRefresh()],
})
