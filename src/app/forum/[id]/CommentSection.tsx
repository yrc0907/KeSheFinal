"use client"

import { useState, useTransition } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { createComment } from "./actions"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"

interface Comment {
  id: string
  text: string
  createdAt: Date
  author: {
    id: string
    name: string | null
    image: string | null
  }
}

interface CommentSectionProps {
  postId: string
  initialComments: Comment[]
}

export function CommentSection({ postId, initialComments }: CommentSectionProps) {
  const { data: session } = useSession()
  const [comments, setComments] = useState(initialComments)
  const [commentText, setCommentText] = useState("")
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!commentText.trim() || !session?.user) return

    const formData = new FormData()
    formData.append("comment", commentText)

    // Create a temporary new comment for optimistic update
    const newComment: Comment = {
      id: "temp-" + Date.now(), // Temporary ID
      text: commentText,
      createdAt: new Date(),
      author: {
        id: session.user.id,
        name: session.user.name ?? "User",
        image: session.user.image ?? null,
      },
    }

    // Optimistically add the new comment to the list
    setComments(prevComments => [...prevComments, newComment])
    setCommentText("")

    startTransition(async () => {
      try {
        await createComment(postId, formData)
        // No need to clear text again, already cleared
        toast.success("评论成功！")
        // The revalidation will eventually sync the real data from the server
      } catch (error) {
        toast.error("评论失败，请稍后重试。")
        // On error, remove the optimistically added comment
        setComments(prevComments => prevComments.filter(c => c.id !== newComment.id))
      }
    })
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">评论</h2>
      {session?.user ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <Textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="写下你的评论..."
            className="mb-2"
            rows={3}
            disabled={isPending}
          />
          <Button type="submit" disabled={isPending}>
            {isPending ? "发布中..." : "发布评论"}
          </Button>
        </form>
      ) : (
        <p className="mb-6 text-muted-foreground">
          <Link href="/login" className="text-blue-500 hover:underline">
            登录
          </Link>{" "}
          后才能发表评论。
        </p>
      )}

      <div className="space-y-6">
        {comments.map(comment => (
          <div key={comment.id} className="flex gap-4">
            <Avatar>
              <AvatarImage src={comment.author.image || undefined} />
              <AvatarFallback>
                {comment.author.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold">{comment.author.name}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(comment.createdAt).toLocaleString()}
                </p>
              </div>
              <p className="mt-1 whitespace-pre-wrap">{comment.text}</p>
            </div>
          </div>
        ))}
        {comments.length === 0 && <p className="text-muted-foreground">还没有评论。</p>}
      </div>
    </div>
  )
} 