import js from '@eslint/js';
import globals from 'globals';
import pluginReact from 'eslint-plugin-react';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs,jsx}'],
    languageOptions: {
      globals: {
        ...globals.browser, // for frontend
        ...globals.node, // for backend
      },
    },
    extends: [js.configs.recommended],
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      sourceType: 'commonjs',
    },
  },

  pluginReact.configs.flat.recommended,
]);
