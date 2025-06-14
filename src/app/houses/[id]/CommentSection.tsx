"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

import { RootComment, CommentWithAuthor } from "@/types"
import { CommentItem } from "./CommentItem"
import { CommentForm } from "./CommentForm"


interface CommentSectionProps {
  houseId: string
}

export function CommentSection({ houseId }: CommentSectionProps) {
  const { data: session } = useSession()
  const [comments, setComments] = useState<RootComment[]>([])
  const [totalComments, setTotalComments] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/houses/${houseId}/comments`)
      if (response.ok) {
        const data = await response.json()
        setComments(data)
        const count = data.reduce(
          (acc: number, comment: RootComment) =>
            acc + 1 + (comment.replies?.length || 0),
          0
        )
        setTotalComments(count)
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (houseId) {
      fetchComments()
    }
  }, [houseId])

  const onCommentPosted = (newComment: RootComment) => {
    setComments([newComment, ...comments])
    setTotalComments(totalComments + 1)
  }

  const handleReplyPosted = (
    newReply: CommentWithAuthor,
    parentId: string
  ) => {
    setComments((currentComments) =>
      currentComments.map((comment) => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies: [...comment.replies, newReply],
          }
        }
        return comment
      })
    )
    setTotalComments((count) => count + 1)
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">评论 ({totalComments})</h2>
      {session?.user ? (
        <CommentForm houseId={houseId} onCommentPosted={onCommentPosted} />
      ) : (
        <p className="mb-6 text-muted-foreground">
          <Link href="/login" className="text-blue-500 hover:underline">
            登录
          </Link>{" "}
          后才能发表评论。
        </p>
      )}

      {isLoading ? (
        <p>正在加载评论...</p>
      ) : (
        <div className="space-y-6 mt-6">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              houseId={houseId}
              onReplyPosted={handleReplyPosted}
            />
          ))}

          {comments.length === 0 && (
            <p className="text-muted-foreground">还没有评论。</p>
          )}
        </div>
      )}
    </div>
  )
} 