import type { Comment } from "../types/comment";

// Destaca a categoria mais frequente do período no resumo do histórico de
// comentários (Tela 10) — ex.: "a maioria dos apontamentos foi de segurança".
export function mostCommonCategory(comments: Comment[]): string | null {
  const categories = comments.map((comment) => comment.category);
  let best: string | null = null;
  let bestCount = 0;
  for (const category of categories) {
    const count = categories.filter((candidate) => candidate === category).length;
    if (count > bestCount) {
      best = category;
      bestCount = count;
    }
  }
  return best;
}
