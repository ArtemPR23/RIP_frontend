// import {defineConfig, loadEnv} from "vite";
// import react from "@vitejs/plugin-react";
// import tsconfigPaths from 'vite-tsconfig-paths'
// import {VitePWA, VitePWAOptions} from "vite-plugin-pwa";

// const manifestForPlugin: Partial<VitePWAOptions> = {
//     registerType: 'autoUpdate',
//     includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
//     manifest: {
//         name: 'История и культура',
//         short_name: 'История и культура',
//         description: 'Description',
//         theme_color: '#ffffff',
//         icons: [
//             {
//                 src: 'pwa-192x192.png',
//                 sizes: '192x192',
//                 type: 'image/png'
//             },
//             {
//                 src: 'pwa-512x512.png',
//                 sizes: '512x512',
//                 type: 'image/png'
//             }
//         ]
//     }
// };

// // @ts-expect-error process is a nodejs global
// const host = process.env.TAURI_DEV_HOST;

// export default defineConfig({
//     plugins: [
//         react(),
//         tsconfigPaths(),
//         VitePWA(manifestForPlugin)
//     ],
//     clearScreen: false,
//     server: {
//         port: 3000,
//         strictPort: true,
//         host: host || false,
//         watch: {
//             ignored: ["**/src-tauri/**"]
//         },
//     },
// });

import {defineConfig, loadEnv} from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from 'vite-tsconfig-paths'
import {VitePWA, VitePWAOptions} from "vite-plugin-pwa";

const manifestForPlugin: Partial<VitePWAOptions> = {
    registerType: 'autoUpdate',
    includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
    manifest: {
        name: 'История и культура',
        short_name: 'История и культура',
        description: 'Description',
        theme_color: '#ffffff',
        icons: [
            {
                src: 'pwa-192x192.png',
                sizes: '192x192',
                type: 'image/png'
            },
            {
                src: 'pwa-512x512.png',
                sizes: '512x512',
                type: 'image/png'
            }
        ]
    }
};

export default defineConfig(({ mode }) => {
  // Загружаем переменные окружения
  const env = loadEnv(mode, process.cwd(), '');
  
  // Определяем хост в зависимости от режима
  const host = env.TAURI_DEV_HOST || '0.0.0.0';
  
  // Получаем ZeroTier IP из переменных окружения или используем дефолтный
  const zeroTierIP = env.VITE_ZEROTIER_IP || '192.168.195.38';
  
  return {
    plugins: [
        react(),
        tsconfigPaths(),
        VitePWA(manifestForPlugin)
    ],
    clearScreen: false,
    server: {
        port: 3000,
        strictPort: true,
        host: host, // Используем динамический хост
        // Автоматически открываем браузер на ZeroTier IP
        open: `http://${zeroTierIP}:3000`,
        proxy: {
          // Прокси для API бэкенда
          '/api': {
            target: `http://${zeroTierIP}:8000`, // Django порт
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, ''),
          },
          // Прокси для медиа файлов (если нужно)
          '/media': {
            target: `http://${zeroTierIP}:8000`,
            changeOrigin: true,
          },
          // Прокси для статических файлов Django
          '/static': {
            target: `http://${zeroTierIP}:8000`,
            changeOrigin: true,
          }
        },
        watch: {
            ignored: ["**/src-tauri/**"]
        },
        // Настройка CORS для разработки
        cors: true,
    },
    // Билд конфигурация
    build: {
      outDir: 'dist',
      sourcemap: true,
    },
    // Переменные окружения для клиента
    define: {
      __ZEROTIER_IP__: JSON.stringify(zeroTierIP),
    }
  };
});