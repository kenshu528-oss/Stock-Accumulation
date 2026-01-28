import { defineConfig } from 'vite';
import { resolve } from 'path';

/**
 * Vite 建置工具?�置
 * v1.3.X ?��??��?專用
 * 
 * ?�能�?
 * - TypeScript 編譯
 * - 程�?碼�?小�?
 * - Source map ?��?
 * - ?��?資�??��?
 * - ?�發伺�??��?�?
 */
export default defineConfig({
  // ?�目??
  root: '.',
  
  // ?�共?��?路�? - 使用?��?路�?以支?��?種部署環�?
  base: './',
  
  // ?�發伺�??��?�?
  server: {
    port: 3000,
    open: true,
    cors: true,
    strictPort: false,
    host: true, // ?�許外部訪�?
  },
  
  // 建置?�置
  build: {
    // 輸出?��?
    outDir: 'dist',
    
    // ?��?資�??��?
    assetsDir: 'assets',
    
    // ?��? source map（�??�環境�?保�?，方便除?��?
    sourcemap: true,
    
    // 程�?碼�?小�? - 使用 esbuild（更快�??�建�?
    minify: 'esbuild',
    
    // esbuild ?��?�??��?（替�?terser�?
    // 保�? console.log ?�於 v1.3.X ?��?系統
    
    // Rollup ?��??��?
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        // ?��??��?策略
        manualChunks: {
          // 第�??�函式庫
          'vendor': ['xlsx'],
          // v1.3.X ?��?管�???
          'managers': [
            './src/managers/StockManager',
            './src/managers/AccountManager', 
            './src/managers/DividendManager',
            './src/managers/PortfolioManager'
          ],
          // v1.3.X ?��?�?
          'services': [
            './src/services/StorageService',
            './src/services/MigrationService',
            './src/services/StockApiService'
          ],
        },
        // 輸出檔�??��?規�?
        entryFileNames: 'js/[name].[hash].js',
        chunkFileNames: 'js/[name].[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.');
          const ext = info?.[info.length - 1];
          
          // CSS 檔�?
          if (/\.(css)$/.test(assetInfo.name ?? '')) {
            return 'css/[name].[hash].[ext]';
          }
          
          // ?��?檔�?
          if (/\.(png|jpe?g|gif|svg|ico|webp)$/.test(assetInfo.name ?? '')) {
            return 'images/[name].[hash].[ext]';
          }
          
          // 字�?檔�?
          if (/\.(woff|woff2|eot|ttf|otf)$/.test(assetInfo.name ?? '')) {
            return 'fonts/[name].[hash].[ext]';
          }
          
          // ?��?資�?
          return 'assets/[name].[hash].[ext]';
        },
      },
    },
    
    // ?��?大�?警�??�制（KB�?
    chunkSizeWarningLimit: 1000,
    
    // 清空輸出?��?
    emptyOutDir: true,
    
    // ?��??�覽??
    target: ['es2020', 'chrome80', 'firefox78', 'safari14'],
  },
  
  // �???�置
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@types': resolve(__dirname, 'src/types'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@services': resolve(__dirname, 'src/services'),
      '@managers': resolve(__dirname, 'src/managers'),
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
  },
  
  // ?�覽伺�??��?�?
  preview: {
    port: 4173,
    open: true,
    cors: true,
    host: true,
  },
  
  // 依賴?��??�置
  optimizeDeps: {
    include: ['xlsx'],
    exclude: [], // ?�除不�?要�??��??��?�?
  },
  
  // CSS ?�置
  css: {
    devSourcemap: true, // ?�發模�?下�? CSS source map
  },
  
  // 定義全域常數
  define: {
    __APP_VERSION__: JSON.stringify('v1.3.0.0014'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
});
