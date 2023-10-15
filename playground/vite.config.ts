import { defineConfig } from 'vite'
import Inspect from 'vite-plugin-inspect'
import Unplugin from '../src/vite'

export default defineConfig({
  plugins: [
    Inspect(),
    Unplugin({
      include: [/node_modules\/unplugin/, './main.ts', '../src/**/*.ts', /node_modules\/vite/],
      exclude: [/node_modules\/@types/],
    }),
  ],
})
