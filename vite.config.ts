import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: { css: { include: [/movimento\.css/] } },
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, 'src') },
  },
})
