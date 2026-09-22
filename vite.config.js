import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
base: '/PROJETO-EXTENSAO-IV/', // 👈 Subsitua "nome-do-seu-repositorio" pelo nome do seu repo no GitHub!
})
