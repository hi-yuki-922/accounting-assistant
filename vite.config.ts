import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;

// https://vite.dev/config/
export default defineConfig(async () => ({
  plugins: [react(), tailwindcss(), TanStackRouterVite()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  },

  // 性能优化配置
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 将 React 相关模块单独打包
          react: ['react', 'react-dom'],
          // 将 UI 组件库打包
          ui: ['class-variance-authority', 'clsx', 'tailwind-merge'],
          // 将图标库打包
          icons: ['lucide-react'],
          // 将工具函数打包
          utils: ['@/lib/utils'],
        },
      },
    },
    // 启用代码压缩
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },

  // 开发服务器配置
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell Vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
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
}));
