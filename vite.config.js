/* eslint-disable no-undef */
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import Components from 'unplugin-vue-components/vite';  
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'; 
export default defineConfig({
  plugins: [
    vue(),  
    
    Components({  
      resolvers: [ElementPlusResolver()],  
    }), 
  ],
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), './src'), // 核心别名定义:ml-citation{ref="4,7" data="citationList"}
      'components': path.resolve(process.cwd(), './src/components') // 多别名配置示例:ml-citation{ref="4" data="citationList"}
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
      }
    }
    
  }
  
})
