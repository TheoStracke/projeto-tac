import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/pizzas': 'http://localhost:8080',
      '/carrinho': 'http://localhost:8080',
      '/clientes': 'http://localhost:8080',
      '/pedidos': 'http://localhost:8080'
    }
  }
});
