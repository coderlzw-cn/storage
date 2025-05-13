export default {
  '*.{js,ts}': [
    "npm run format",
    "npm run format:check",
    "npm run lint",
    "npm run lint:check",
  ],
  '*.{json,md}': [
    "npm run format",
    "npm run format:check",
  ],
};
