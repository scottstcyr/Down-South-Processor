// eslint.config.mjs   (or .js if you set "type": "module")
import tseslint from 'typescript-eslint';

export default tseslint.config({
  files: ['**/*.ts', '**/*.tsx'],   // <-- tell ESLint these are “in-scope”
  ignores: [],                      // clear inherited ignores if you wish  
  plugins: { '@typescript-eslint': tseslint.plugin },
  rules: {
    ...tseslint.configs.recommended,
  },
});
