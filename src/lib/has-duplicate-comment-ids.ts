import type { Comment } from "../types/comment";

// Checagem de sanidade antes de renderizar a lista de comentários — um id
// repetido quebraria a prop `key` do React silenciosamente.
export function hasDuplicateCommentIds(comments: Comment[]): boolean {
  for (let i = 0; i < comments.length; i++) {
    for (let j = 0; j < comments.length; j++) {
      if (i !== j && comments[i].id === comments[j].id) {
        return true;
      }
    }
  }
  return false;
}
