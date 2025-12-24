import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        // Alias Base
        '@': resolve('src/renderer/src'),

        // Alias de Módulos (Domain Driven)
        '@core': resolve('src/renderer/src/modules/core'),
        '@auth': resolve('src/renderer/src/modules/auth'),

        // Alias de Utilidades Comunes
        '@ui': resolve('src/renderer/src/components/ui'),
        '@lib': resolve('src/renderer/src/lib'),
        '@config': resolve('src/renderer/src/config')
      }
    },
    plugins: [react(), tailwindcss()]
  }
})
