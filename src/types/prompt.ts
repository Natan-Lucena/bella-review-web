export type Prompt = {
  id: string;
  name: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type CreatePromptInput = { name: string; content: string };
export type UpdatePromptInput = Partial<CreatePromptInput>;

export type ListPromptsResponse = { prompts: Prompt[] };
