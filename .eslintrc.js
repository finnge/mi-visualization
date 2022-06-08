module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  plugins: [
    'import',
  ],
  extends: [
    'airbnb-base',
    'plugin:import/recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'sort-imports':
      [
        'error',
        {
          ignoreCase: true,
          ignoreDeclarationSort: true,
        },
      ],
  },
};
