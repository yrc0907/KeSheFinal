"use client"

import { useState, useTransition } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getMoreComments } from "./actions"
import { CommentForm } from "./CommentForm"
import { RootComment } from "@/types"
import { CommentItem } from "./CommentItem"

interface CommentSectionProps {
  postId: string
  initialComments: RootComment[]
  totalComments: number
}

export function CommentSection({
  postId,
  initialComments,
  totalComments,
}: CommentSectionProps) {
  const { data: session } = useSession()
  const [comments, setComments] = useState(initialComments)
  const [showedCommentsCount, setShowedCommentsCount] = useState(initialComments.length)
  const [isPending, startTransition] = useTransition()

  const handleLoadMore = () => {
    startTransition(async () => {
      const lastCommentId = comments[comments.length - 1]?.id
      const newComments = await getMoreComments(postId, lastCommentId)
      setComments(prev => [...prev, ...newComments])
      setShowedCommentsCount(prev => prev + newComments.length)
    })
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">评论 ({totalComments})</h2>
      {session?.user ? (
        <CommentForm postId={postId} />
      ) : (
        <p className="mb-6 text-muted-foreground">
          <Link href="/login" className="text-blue-500 hover:underline">
            登录
          </Link>{" "}
          后才能发表评论。
        </p>
      )}

      <div className="space-y-6 mt-6">
        {comments.map(comment => (
          <CommentItem
            key={comment.id}
            comment={comment}
            postId={postId}
          />
        ))}

        {comments.length === 0 && <p className="text-muted-foreground">还没有评论。</p>}
      </div>

      {showedCommentsCount < totalComments && (
        <div className="mt-6 text-center">
          <Button onClick={handleLoadMore} disabled={isPending}>
            {isPending ? "加载中..." : "加载更多评论"}
          </Button>
        </div>
      )}
    </div>
  )
} 