export type RepoConfig = {
  model: string;
  tokenLimit: number;
  temperature: number;
  enabledCategories: string[];
};

// PATCH /repos/:id/config aceita um patch parcial de verdade — só os campos
// enviados são alterados, o resto permanece como estava.
export type RepoConfigPatch = Partial<RepoConfig>;
