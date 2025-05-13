/**
 * @type {import("semantic-release").GlobalConfig}
 */
export default {
  branches: ["release"],
  plugins: [
    "@semantic-release/commit-analyzer",

    "@semantic-release/release-notes-generator",

    "@semantic-release/changelog",

    [
      "@semantic-release/npm",
      {
        npmPublish: false
      }
    ],
    [
      "@semantic-release/git",
      {
        assets: ["CHANGELOG.md", "package.json"]
      }
    ],
    "@semantic-release/github"
  ]
};
