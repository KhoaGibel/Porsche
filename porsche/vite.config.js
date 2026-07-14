import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  build: {
    // 🎯 Giải pháp tối ưu cho Vite 8: Xóa console bằng chính build.minify mặc định (oxc/rolldown)
    // Thay vì dùng esbuild config riêng, ta dùng tính năng chính thức này
    minify: true, 
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
  },
  server: {
    proxy: { '/api': { target: 'http://localhost:5000', changeOrigin: true } },
  },
  optimizeDeps: {
    include: ['three', '@react-three/fiber', '@react-three/drei', 'zustand', 'framer-motion'],
  },
});