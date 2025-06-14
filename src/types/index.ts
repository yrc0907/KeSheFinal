// We define types manually here to avoid potential resolution issues with the TS server.
// This ensures a stable type definition across the application.

export interface User {
  id: string
  name: string | null
  image: string | null
}

export interface Comment {
  id: string
  text: string
  image: string | null
  createdAt: string // Using string for date serialization
  authorId: string
  postId: string | null
  houseId: string | null
  parentId: string | null
  rootId: string | null
}

// This is a full comment object, with author information.
export type CommentWithAuthor = Comment & {
  author: User
}

// This is for top-level comments, which include their nested replies.
export type RootComment = CommentWithAuthor & {
  replies: CommentWithAuthor[]
} 