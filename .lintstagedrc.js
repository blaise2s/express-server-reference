module.exports = {
  '**/*.{ts,js}': 'eslint --cache --fix',
  '**/*.{ts,js,json,md,yml,yaml}': 'prettier --write --ignore-unknown',
};
