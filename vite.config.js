/* eslint-disable no-undef */
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import Components from 'unplugin-vue-components/vite';  
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'; 
console.log('当前环境变量:', process.env)
export default defineConfig({
 
  base: process.env.NODE_ENV === 'production' 
    ? '' 
    : './',
  plugins: [
    vue(),  
    
    Components({  
      resolvers: [ElementPlusResolver()],  
    }), 
  ],
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), './src'), // 核心别名定义:ml-citation{ref="4,7" data="citationList"}
      'components': path.resolve(process.cwd(), './src/components'), // 多别名配置示例:ml-citation{ref="4" data="citationList"}
      '@assets': path.resolve(process.cwd(), './src/assets')
    }
  },
  build: {
    lib: {
      entry: './src/index.js',  // 组件入口文件
      name: 'topo-edit',   // 全局变量名称
      formats: ['es', 'umd'],   // 输出格式
      fileName: (format) => `topo-edit.${format}.js`
    },
    cssCodeSplit: true,
    rollupOptions: {
      external: ['vue'],        // 排除 Vue 依赖
      output: {
        globals: { vue: 'Vue' }, // 声明全局变量
        //  assetFileNames: 'assets/[name]-[hash][extname]'
      }
    },
    // assetsInlineLimit: 32, // 小图片直接内联
    // assetsDir: 'assets',    // 资源目录
    // publicDir: 'public'     // 公共资源目录
  }
  
})
