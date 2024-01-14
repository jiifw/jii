module.exports = {
  env: {
    browser: false,
    es6: true,
    node: true,
  },
  root: false,
  ignorePatterns: ['dist', '__tests__', 'coverage', '*.local.ts', 'examples'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:@typescript-eslint/eslint-recommended', 'plugin:jest/recommended', 'prettier'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    ecmaVersion: '2022',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  rules: {
    "@typescript-eslint/no-namespace": "off",
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/ban-ts-comment': 'off'
  },
};
