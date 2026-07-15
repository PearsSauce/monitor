import { fileURLToPath, URL } from 'node:url'
import { writeFileSync } from 'node:fs'
import path from 'path';

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

const generateConfig = () => ({
  socket: process.env.SOCKETURL || "",
  apiURL: process.env.APIURL || "",
});

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    vue(),
    command === 'serve' && vueDevTools(),
    {
      name: 'dynamic-config-json',
      configureServer (server) {
        // dynamic `config.json` for dev
        server.middlewares.use((req, res, next) => {
          if (req.url === '/config.json') {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(generateConfig()));
          } else {
            next();
          }
        });
      },
      closeBundle () {
        // static `config.json` for prod
        const configPath = path.resolve(__dirname, 'dist/config.json');
        writeFileSync(configPath, JSON.stringify(generateConfig(), null, 2));
        console.log('Generated config.json:', generateConfig());
      },
    },
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          arco: ['@arco-design/web-vue'],
          charts: ['highcharts'],
          vue: ['vue', 'vue-i18n'],
          vendor: ['axios', 'moment'],
        },
      },
    },
  },
}))
