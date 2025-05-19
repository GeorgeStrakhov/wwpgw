export interface Essay {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  modelUsed: string | null;
  generatedBy: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  errorMessage?: string | null;
  createdAt: string | Date; // Or Date, depending on how it's serialized/deserialized
  author?: {
    githubHandle: string;
    githubId: string; // Or number, depending on what GitHub API provides if you fetch more details
  };
  averageRating?: number; // Added for average rating
  totalRatings?: number;  // Added for total number of ratings
  // Add any other fields you expect to use on the client-side
  isExisting?: boolean; // From our POST /api/essays response
}

export interface EssayRatingStats {
  essayId: string;
  averageRating: number;
  totalRatings: number;
  currentUserRating: number | null;
}

export interface UserProfile {
  githubHandle: string;
  avatarUrl: string | null;
}

export interface CommentWithUser {
  id: string;
  essayId: string;
  userId: string;
  parentId: string | null;
  content: string;
  createdAt: string | Date;
  user: UserProfile | null;
  replies?: HierarchicalComment[];
}

export interface HierarchicalComment extends CommentWithUser {
  replies: HierarchicalComment[];
} 