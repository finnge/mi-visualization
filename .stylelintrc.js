module.exports = {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-idiomatic-order',
  ],
  rules: {
    // BEM
    'selector-class-pattern': '^([a-z][a-z0-9]*)((__|-{1,2})[a-z0-9]+)*$',
  }
}
