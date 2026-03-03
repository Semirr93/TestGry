import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@shared': path.resolve(__dirname, '../../shared')
      }
    },
    server: {
      port: 3000,
      proxy: {
        '/socket.io': {
          target: env.VITE_WS_URL?.replace('ws://', 'http://') || 'http://localhost:3001',
          ws: true,
        }
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            pixi: ['pixi.js'],
            socketio: ['socket.io-client']
          }
        }
      }
    },
    define: {
      __VITE_WS_URL__: JSON.stringify(env.VITE_WS_URL || 'ws://localhost:3001')
    }
  }
})
