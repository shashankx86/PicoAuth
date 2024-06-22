import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import inject from '@rollup/plugin-inject';

export default defineConfig({
  plugins: [vue(),
    inject({
      Buffer: ['buffer', 'Buffer']
    })
  ],
  resolve: {
    alias: {
      buffer: 'buffer',
    },
  },
});


