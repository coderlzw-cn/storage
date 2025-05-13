export default {
  extends: ["@commitlint/config-conventional"],
  parserPreset: {
    parserOpts: {
      headerPattern: /^(?<type>\w*)(?:\s*\((?<scope>.*)\))?!?:\s(?<subject>(?:(?!#).)*(?:(?!\s).))$/,
      headerCorrespondence: ["type", "scope", "subject"]
    }
  },
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "docs",
        "style",
        "refactor",
        "perf",
        "test",
        "chore",
        "revert",
        "ci",
        "build",
        "release",
        "tag",
        "security",
        "i18n",
        "design",
        "debug",
        "responsive",
        "plugin",
        "analytics"
      ]
    ],
    "type-case": [0],
    "type-empty": [0],
    "scope-empty": [0],
    "subject-empty": [2, "never"],
    "header-max-length": [2, "always", 200]
  }
};
