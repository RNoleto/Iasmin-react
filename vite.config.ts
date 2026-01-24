
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Injeta a chave da Vercel no código. 
    // O Vite substituirá todas as ocorrências de 'process.env.API_KEY' pelo valor real.
    'process.env.API_KEY': JSON.stringify(process.env.VITE_API_KEY || process.env.API_KEY),
  },
  server: {
    port: 3000,
  },
});
