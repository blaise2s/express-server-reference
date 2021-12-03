module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'body-leading-blank': [2, 'always'],
    'body-max-line-length': [2, 'always', 80],
    'footer-leading-blank': [2, 'always'],
    'footer-empty': [2, 'never'],
    'footer-max-line-length': [2, 'always', 80],
    'header-max-length': [2, 'always', 72],
    'scope-case': [2, 'always', 'lower-case'],
  },
};
