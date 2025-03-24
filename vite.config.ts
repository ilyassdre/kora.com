import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'], // استثناء مكتبة معينة من التحسين المسبق
  },
  server: {
    port: 3000, // تحديد منفذ الخادم المحلي
    open: true, // فتح المتصفح تلقائيًا عند تشغيل الخادم
    strictPort: true, // عدم البحث عن منفذ بديل في حال كان 3000 مشغولًا
  },
  build: {
    target: 'esnext', // تحسين التوافق مع المتصفحات الحديثة
    sourcemap: true, // تمكين ملفات الخرائط المصدرية لتسهيل تصحيح الأخطاء
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor'; // فصل الأكواد الخارجية في ملف مستقل لتحسين التحميل
          }
        },
      },
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
});

