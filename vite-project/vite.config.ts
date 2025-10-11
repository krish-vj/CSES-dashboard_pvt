import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import manifest from './public/manifest.json'; // Import your manifest

export default defineConfig({
  plugins: [react(), crx({ manifest })],
  // Important: Ensure base is './' for relative paths in the extension
  base: './', 
});