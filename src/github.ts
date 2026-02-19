import * as github from "@actions/github";

export interface PullRequest {
  number: number;
  title: string;
  body: string | null;
  labels: string[];
  author: string;
  mergedAt: string;
}

export async function getMergedPRsSinceLastRelease(
  token: string,
): Promise<PullRequest[]> {
  const octokit = github.getOctokit(token);
  const { owner, repo } = github.context.repo;

  // Get the previous release (second most recent)
  const releases = await octokit.rest.repos.listReleases({
    owner,
    repo,
    per_page: 2,
  });
  const previousRelease = releases.data[1]; // [0] is current, [1] is previous
  const since = previousRelease?.published_at ?? new Date(0).toISOString();

  // Get merged PRs since the previous release
  const { data: pulls } = await octokit.rest.pulls.list({
    owner,
    repo,
    state: "closed",
    sort: "updated",
    direction: "desc",
    per_page: 100,
  });

  return pulls
    .filter((pr) => pr.merged_at && new Date(pr.merged_at) > new Date(since))
    .map((pr) => ({
      number: pr.number,
      title: pr.title ?? "",
      body: pr.body,
      labels: pr.labels.map((l) =>
        typeof l === "string" ? l : (l.name ?? ""),
      ),
      author: pr.user?.login ?? "",
      mergedAt: pr.merged_at ?? "",
    }));
}

export async function updateReleaseBody(
  token: string,
  releaseId: number,
  body: string,
): Promise<void> {
  const octokit = github.getOctokit(token);
  const { owner, repo } = github.context.repo;
  await octokit.rest.repos.updateRelease({
    owner,
    repo,
    release_id: releaseId,
    body,
  });
}
