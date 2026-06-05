import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    https: {
      key: '/home/ubuntu/localhost.key',
      cert: '/home/ubuntu/localhost.crt',
    },
    host: '51.75.20.230',
    port: 8100
  }
});