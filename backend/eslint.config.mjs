// eslint.config.mjs
import globals from 'globals';
import eslint from '@eslint/js'; // Required for defineConfig
import { defineConfig } from 'eslint/config'; // ESLint's built-in helper
import tseslint from 'typescript-eslint';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default defineConfig([
  // Base config for all files
  {
    files: ['**/*.{ts,tsx,js,jsx,mjs,cjs}'],
    languageOptions: {
      globals: {
        ...globals.node, // Node.js globals for Express (process, __dirname, etc.)
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
  },

  // Core ESLint recommended rules
  eslint.configs.recommended,

  // TypeScript-specific configs (spread to avoid type issues)
  ...tseslint.configs.recommended,

  // Prettier integration (must come last to override)
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      ...prettierConfig.rules,
      'prettier/prettier': 'error', // Treat Prettier issues as ESLint errors
    },
  },

  // Custom rules for Express + TypeScript
  {
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-imports': 'error',
      'no-console': 'warn',
    },
  },

  // Ignores
  {
    ignores: [
      'dist/',
      'node_modules/',
      '*.d.ts',
      'coverage/',
      '.env*',
      'eslint.config.mjs',
    ],
  },
]);
