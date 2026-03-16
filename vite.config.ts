import path from 'node:path'

import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite';

const host = process.env.TAURI_DEV_HOST

// https://vite.dev/config/
export default defineConfig((_env) =>
  ( {
    // 性能优化配置
    build: {
      // 启用代码压缩
      minify: 'terser',
    },
    // 优化依赖预构建
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'class-variance-authority',
        'clsx',
        'tailwind-merge',
        'lucide-react',
      ],
    },
    plugins: [react(), tailwindcss(), tanstackRouter()],
    resolve: {
      alias: {
        // oxlint-disable-next-line unicorn/prefer-module
        '@': path.resolve(__dirname, './src'),
      },
    },

    // 开发服务器配置
    server: {
      hmr: host
        ? {
          host,
          port: 1421,
          protocol: 'ws',
        }
        : undefined,
      host: host || false,
      port: 1420,
      strictPort: true,
      watch: {
        // 3. tell Vite to ignore watching `src-tauri`
        ignored: ['**/src-tauri/**'],
      },
    },

  })
)
