/**
 * Vite配置文件
 * 功能：配置开发服务器、构建选项、插件等
 * 移除TypeScript相关配置，适配JavaScript项目
 */

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'

// Vite配置
export default defineConfig({
  plugins: [
    // Vue插件
    vue(),
    
    // 自动导入API
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      dts: false, // 禁用TypeScript声明文件生成
    }),
    
    // 自动导入组件
    Components({
      resolvers: [
        AntDesignVueResolver({
          importStyle: false, // 使用CSS-in-JS
        }),
      ],
      dts: false, // 禁用TypeScript声明文件生成
    }),
  ],
  
  // 路径别名配置
  resolve: {
    alias: {
      '@': resolve(process.cwd(), 'src'),
    },
  },
  
  // 开发服务器配置
  server: {
    port: 3000,                // 开发服务器端口
    host: true,                // 允许外部访问
    open: true,                // 自动打开浏览器
    
    // 代理配置 - 将API请求转发到后端服务器
    proxy: {
      '/api': {
        target: 'http://localhost:8080',      // 本地开发后端服务器
        changeOrigin: true,                   // 改变源
        secure: false,                        // 开发环境允许自签名证书
        rewrite: (path) => path.replace(/^\/api/, ''),  // 重写路径
      },
    },
  },
  
  // 构建配置
  build: {
    outDir: 'dist',                    // 输出目录
    sourcemap: false,                  // 生产环境不生成sourcemap
    chunkSizeWarningLimit: 1000,       // chunk大小警告限制
    
    // Rollup配置
    rollupOptions: {
      output: {
        // 手动分包，优化加载性能
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],  // Vue生态库
          antd: ['ant-design-vue'],                // UI组件库
          utils: ['axios'],                        // 工具库
        },
      },
    },
  },
  
  // 环境变量配置
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
  },
}) 