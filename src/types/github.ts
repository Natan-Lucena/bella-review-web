export type GithubRepoOption = {
  fullName: string;
  private: boolean;
  defaultBranch: string;
  alreadyAdded: boolean;
};

export type ListGithubReposResponse = {
  repos: GithubRepoOption[];
};

export type InstallActionResult = {
  prUrl: string;
};
