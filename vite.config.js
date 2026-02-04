import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'    


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  assetsInclude:['**/*.xlsx'],
  esbuild: {
    loader: "jsx",
    include: /src\/.*\.(js|jsx)$/, // ✅ allow both js and jsx in src/
    exclude: [],
  },

})

