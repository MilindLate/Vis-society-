import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  plugins: [svelte()],
  // Change 'housing-viz' to your actual GitHub repo name before deploying
  base: '/housing-viz/',
})
