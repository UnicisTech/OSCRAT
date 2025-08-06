import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

/** @type {import('eslint').Linter.Config[]} */
export default [
  js.configs.recommended,

  // Global ignores
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/build/**',
      '**/.turbo/**',
      '**/coverage/**',
      '**/*.tsbuildinfo',
    ],
  },

  // Common TypeScript rules for all workspaces
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-debugger': 'error',
    },
  },

  // Config files
  {
    files: ['**/*.config.{js,mjs}', '**/.prettierrc.{js,cjs}'],
    languageOptions: {
      sourceType: 'commonjs',
    },
  },
];
