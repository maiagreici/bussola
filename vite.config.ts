import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // Um único arquivo JS de saída (sem code-splitting): jsPDF importa
    // dinamicamente módulos opcionais (html2canvas/dompurify) que nunca
    // usamos, e o bundle único simplifica publicar o app como uma página
    // HTML autocontida além do fluxo normal de hospedagem.
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
