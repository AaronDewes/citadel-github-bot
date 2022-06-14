import { Probot } from "probot";

export default function probotApp(app: Probot) {
  app.on(
    ["pull_request.opened", "pull_request.synchronize"],
    async (context) => {
      if (
        context.payload.pull_request.title.toLowerCase().includes("release")
      ) {
        const check = await context.octokit.checks.create({
          ...context.repo(),
          head_sha: context.payload.pull_request.head.sha,
          status: "in_progress",
          name: "validate-release",
        });
        let releaseComment = "";
        // Various checks for a release
        const reposWithUntaggedCommits = checkUntaggedHead([
          "manager",
          "middleware",
          "dashboard",
        ]);
        const outdatedContainers = checkLatestReleaseIncluded([
          "manager",
          "middleware",
          "dashboard",
        ]);
        const pendingAppUpdates = getPendingAppUpdates([
          "apps",
          "apps-nonfree",
        ]);
        if (
          Object.keys(reposWithUntaggedCommits).length === 0 &&
          Object.keys(outdatedContainers).length === 0 &&
          Object.keys(pendingAppUpdates).length === 0
        ) {
          context.octokit.rest.checks.update({
            ...context.repo(),
            check_run_id: check.data.id,
            status: "completed",
            conclusion: "success",
          });
        } else {
          context.octokit.rest.checks.update({
            ...context.repo(),
            check_run_id: check.data.id,
            status: "completed",
            conclusion: "action_required",
            actions: [
              {
                label: "Attempt automatic updates",
                description:
                  "This attempts to automatically update the apps and containers.",
                identifier: "automated_update",
              },
            ],
          });
        }
      }
    }
  );
}

function checkUntaggedHead(repos: string[]): Record<
  string,
  {
    untaggedCommits: any[];
    compareLink: string;
  }
> {
  throw new Error("Function not implemented.");
}

function checkLatestReleaseIncluded(repos: string[]): Record<
  string,
  {
    currentRelease: string;
    includedRelease: string;
  }
> {
  throw new Error("Function not implemented.");
}

function getPendingAppUpdates(appRepos: string[]): Record<
  string,
  Record<
    string,
    {
      currentRelease: string;
      includedRelease: string;
    }
  >
> {
  throw new Error("Function not implemented.");
}
