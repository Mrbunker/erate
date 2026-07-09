import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";

// GitHub Pages 部署在 https://<user>.github.io/erate/，需设置 base 为仓库名
const base = process.env.GITHUB_ACTIONS ? '/erate/' : '/'

// https://vite.dev/config/
export default defineConfig({
  base,
  build: {
    sourcemap: 'hidden',
  },
  plugins: [
    react({
      babel: {
        plugins: [
          'react-dev-locator',
        ],
      },
    }),
    tsconfigPaths()
  ],
})
