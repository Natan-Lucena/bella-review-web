export type CommentReplyStatus = "queued" | "processing" | "completed" | "failed";
export type CommentReplyCategory = "fix" | "clarification" | "disagreement" | "acknowledgment" | "other";

export type CommentReply = {
  id: string;
  humanBody: string;
  humanAuthor: string;
  status: CommentReplyStatus;
  category: CommentReplyCategory | null; // null while still queued/processing, same as bellaBody/bellaSuggestedCode
  bellaBody: string | null;
  bellaSuggestedCode: string | null;
  createdAt: string;
  completedAt: string | null;
};

export type ListCommentRepliesResponse = { replies: CommentReply[] };
