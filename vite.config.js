import react from '@vitejs/plugin-react'
import { env } from 'node:process'
import { defineConfig } from 'vite'
import pkg from './package.json' with { type: 'json' }

const sha = env.GITHUB_SHA?.slice(0, 7)

export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_APP_NAME': JSON.stringify(pkg.name),
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(sha ? `${pkg.version}+${sha}` : pkg.version),
  },
  test: { environment: 'jsdom' },
})
