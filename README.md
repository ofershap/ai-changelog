# ai-changelog

[![CI](https://github.com/ofershap/ai-changelog/actions/workflows/ci.yml/badge.svg)](https://github.com/ofershap/ai-changelog/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

GitHub Action that generates beautiful, AI-powered changelogs from your merged pull requests. Triggered on release creation, it reads all PRs since the last release and produces a structured changelog.

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

> Uses OpenAI or Anthropic to transform raw PR titles and metadata into user-friendly release notes. No SDK dependencies—just native fetch.

![Demo](assets/demo.gif)

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
| `api-key`        | Yes      | —                                           | API key for the AI provider                       |
| `categories`     | No       | `Features,Bug Fixes,Breaking Changes,Other` | Comma-separated changelog categories              |
| `update-release` | No       | `true`                                      | Update the GitHub Release body with the changelog |

## Outputs

| Output      | Description                  |
| ----------- | ---------------------------- |
| `changelog` | The generated changelog text |

## How It Works

1. **Trigger**: Runs when a new GitHub Release is published.
2. **Fetch PRs**: Uses the GitHub API to list merged PRs since the previous release.
3. **Summarize**: Builds a text summary of PR numbers, titles, authors, and labels.
4. **Generate**: Sends the summary to OpenAI or Anthropic with a changelog system prompt.
5. **Update**: Optionally writes the generated changelog to the release body.

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

- **[ai-commit-msg](https://github.com/ofershap/ai-commit-msg)** — AI-generated conventional commit messages
- **[ai-pr-reviewer](https://github.com/ofershap/ai-pr-reviewer)** — AI-powered PR review comments
- **[ai-changelog](https://github.com/ofershap/ai-changelog)** — AI-generated changelogs from merged PRs

## Development

```bash
npm install
npm run typecheck
npm run build
npm test
npm run lint
```

## License

[MIT](LICENSE) © [Ofer Shapira](https://github.com/ofershap)
