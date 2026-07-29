export type ServiceState = "active" | "configuration_pending" | "inactive";

export type Repo = {
  id: string;
  fullName: string;
  active: boolean;
  configComplete: boolean;
  llmProvider: string;
  model: string;
};

export type ListReposResponse = {
  repos: Repo[];
};
