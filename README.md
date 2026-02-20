# ai-changelog

[![CI](https://github.com/ofershap/ai-changelog/actions/workflows/ci.yml/badge.svg)](https://github.com/ofershap/ai-changelog/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

GitHub Action that generates changelogs from your merged pull requests using AI. Runs when a release is published, reads all PRs since the last release, and produces a structured changelog.

```yaml
on:
  release:
    types: [published]

jobs:
  changelog:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ofershap/ai-changelog@v1
        with:
          api-key: ${{ secrets.OPENAI_API_KEY }}
          provider: openai
          model: gpt-4o-mini
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

> Supports OpenAI and Anthropic. Transforms raw PR titles and metadata into readable release notes. No SDK dependencies, just native fetch.

![GitHub Action for AI-generated changelogs from pull requests](assets/demo.gif)

<sub>Demo built with <a href="https://github.com/ofershap/remotion-readme-kit">remotion-readme-kit</a></sub>

## Why

Writing changelogs is one of those tasks that everyone agrees is important but nobody wants to do. GitHub has built-in auto-generated release notes, but they're just a list of PR titles, which is barely better than `git log`. This action reads your merged PRs, sends them to an AI model, and gets back a properly categorized changelog with human-readable descriptions. It groups changes into Features, Bug Fixes, Breaking Changes, and whatever other categories you define. You can have it update the GitHub Release body automatically, so publishing a release is all it takes to get a proper changelog.

## Usage

Add the action to a workflow that runs on `release: published`:

```yaml
name: Generate Changelog

on:
  release:
    types: [published]

jobs:
  changelog:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ofershap/ai-changelog@v1
        with:
          api-key: ${{ secrets.OPENAI_API_KEY }}
          provider: openai
          model: gpt-4o-mini
          categories: "Features,Bug Fixes,Breaking Changes,Other"
          update-release: "true"
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Inputs

| Input            | Required | Default                                     | Description                                       |
| ---------------- | -------- | ------------------------------------------- | ------------------------------------------------- |
| `provider`       | No       | `openai`                                    | AI provider: `openai` or `anthropic`              |
| `model`          | No       | `gpt-4o-mini`                               | Model to use (e.g. `gpt-4o`, `claude-3-haiku`)    |
| `api-key`        | Yes      |                                             | API key for the AI provider                       |
| `categories`     | No       | `Features,Bug Fixes,Breaking Changes,Other` | Comma-separated changelog categories              |
| `update-release` | No       | `true`                                      | Update the GitHub Release body with the changelog |

## Outputs

| Output      | Description                  |
| ----------- | ---------------------------- |
| `changelog` | The generated changelog text |

## How It Works

1. Runs when a new GitHub Release is published.
2. Uses the GitHub API to list merged PRs since the previous release.
3. Builds a text summary of PR numbers, titles, authors, and labels.
4. Sends the summary to OpenAI or Anthropic with a changelog system prompt.
5. Optionally writes the generated changelog to the release body.

## Supported Providers

| Provider      | Models (examples)                   | API Key Secret      |
| ------------- | ----------------------------------- | ------------------- |
| **OpenAI**    | `gpt-4o-mini`, `gpt-4o`, `gpt-4`    | `OPENAI_API_KEY`    |
| **Anthropic** | `claude-3-haiku`, `claude-3-sonnet` | `ANTHROPIC_API_KEY` |

## Example Output

```markdown
## Features

- Added dark mode support for the dashboard (#42)
- New `--dry-run` flag for migrations (#38)

## Bug Fixes

- Fixed memory leak in WebSocket handler (#41)
- Resolved timezone handling for scheduled tasks (#39)

## Other

- Updated dependencies (#40)
```

## AI DevOps Suite

Part of the AI DevOps suite:

- **[ai-commit-msg](https://github.com/ofershap/ai-commit-msg)**: AI-generated conventional commit messages
- **[ai-pr-reviewer](https://github.com/ofershap/ai-pr-reviewer)**: AI-powered PR review comments
- **[ai-label-pr](https://github.com/ofershap/ai-label-pr)**: Auto-label PRs by size and type
- **ai-changelog**: AI-generated changelogs from merged PRs (this project)

## Development

```bash
npm install
npm run typecheck
npm run build
npm test
npm run lint
```

## Author

**Ofer Shapira**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-ofershap-blue?logo=linkedin)](https://linkedin.com/in/ofershap)
[![GitHub](https://img.shields.io/badge/GitHub-ofershap-black?logo=github)](https://github.com/ofershap)
[![Portfolio](https://img.shields.io/badge/Portfolio-gitshow.dev-orange)](https://gitshow.dev/ofershap)

## License

[MIT](LICENSE) © [Ofer Shapira](https://github.com/ofershap)
