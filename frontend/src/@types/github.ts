type GitHubRepository = {
  name: string;
  url: string;
};

export type GetAuthUserGithubRepos = {
  gitHubRepositories: GitHubRepository[];
};
