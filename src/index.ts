import * as core from "@actions/core";
import * as github from "@actions/github";
import { generateChangelog } from "./ai.js";
import { getMergedPRsSinceLastRelease, updateReleaseBody } from "./github.js";

async function run(): Promise<void> {
  try {
    const provider = core.getInput("provider") as "openai" | "anthropic";
    const model = core.getInput("model");
    const apiKey = core.getInput("api-key", { required: true });
    const categories = core
      .getInput("categories")
      .split(",")
      .map((c) => c.trim());
    const updateRelease = core.getInput("update-release") === "true";
    const githubToken = process.env.GITHUB_TOKEN ?? "";

    if (!githubToken) {
      throw new Error("GITHUB_TOKEN is required. Add it to your workflow env.");
    }

    core.info("Fetching merged PRs since last release...");
    const prs = await getMergedPRsSinceLastRelease(githubToken);

    if (prs.length === 0) {
      core.info("No merged PRs found since last release.");
      core.setOutput("changelog", "No changes.");
      return;
    }

    core.info(`Found ${prs.length} merged PRs. Generating changelog...`);
    const prSummaries = prs
      .map(
        (pr) =>
          `- PR #${pr.number}: ${pr.title} (by @${pr.author})${pr.labels.length > 0 ? ` [${pr.labels.join(", ")}]` : ""}`,
      )
      .join("\n");

    const changelog = await generateChangelog(
      { provider, model, apiKey },
      prSummaries,
      categories,
    );
    core.info("Changelog generated successfully.");
    core.setOutput("changelog", changelog);

    if (updateRelease && github.context.payload.release) {
      const releaseId = github.context.payload.release.id as number;
      core.info(`Updating release #${releaseId} with changelog...`);
      await updateReleaseBody(githubToken, releaseId, changelog);
      core.info("Release updated.");
    }
  } catch (error) {
    core.setFailed(error instanceof Error ? error.message : String(error));
  }
}

run();
