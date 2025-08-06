import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import globals from 'globals';

/** @type {import('eslint').Linter.Config[]} */
export default [
  js.configs.recommended,

  // Global ignores
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      '.next/**',
      'build/**',
      '.turbo/**',
      'coverage/**',
      '*.tsbuildinfo',
      'eslint.config.mjs',
    ],
  },

  // TypeScript and React files
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        React: 'readonly',
        JSX: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      react,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...react.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': 'warn',
      'no-debugger': 'error',
      'react/react-in-jsx-scope': 'off', // Not needed in Next.js
      'react/prop-types': 'off', // Using TypeScript instead
    },
  },

  // API routes and lib files that need Node.js
  {
    files: [
      'pages/api/**/*.{js,ts}',
      'lib/**/*.{js,ts}',
      'models/**/*.{js,ts}',
    ],
    languageOptions: {
      globals: {
        ...globals.node,
        NodeJS: 'readonly',
        Buffer: 'readonly',
      },
    },
    rules: {
      'no-console': 'off', // Console is fine in API routes
    },
  },

  // Config files
  {
    files: ['**/*.config.{js,mjs}', '**/.prettierrc.{js,cjs}'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
    },
  },
];
