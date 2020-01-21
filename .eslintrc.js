
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  extends: [
    'standard' // Out of the box StandardJS rules
  ],
  plugins: [
    '@typescript-eslint', // Let's us override rules below.
    'import',
  ],
  env: {
    es6: true,
    node: true,
    jest: true
  },
  rules: {
    // Prevent unused vars errors when variables are only used as TS types
    // see: https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-unused-vars.md#options
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        vars: 'all',
        args: 'after-used',
        ignoreRestSiblings: false
      }
    ],
    '@typescript-eslint/interface-name-prefix': ['error', 'always'],
    camelcase: 'error',
    'import/no-default-export': 'error',
    'import/order': 'error',
    'no-trailing-spaces': 'error',
    'no-unused-vars': 'off',
    quotes: ['error', 'single']
  }
}
