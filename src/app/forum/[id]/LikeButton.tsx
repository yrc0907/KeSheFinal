"use client"

import { useState, useTransition } from "react"
import { toggleLikePost } from "./actions"
import { Button } from "@/components/ui/button"
import { ThumbsUp } from "lucide-react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface LikeButtonProps {
  postId: string
  initialLikes: number
  isInitiallyLiked: boolean
}

export function LikeButton({
  postId,
  initialLikes,
  isInitiallyLiked,
}: LikeButtonProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLiked, setIsLiked] = useState(isInitiallyLiked)
  const [likeCount, setLikeCount] = useState(initialLikes)
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    // Optimistic update
    setIsLiked(prev => !prev)
    setLikeCount(prev => (isLiked ? prev - 1 : prev + 1))

    startTransition(async () => {
      try {
        await toggleLikePost(postId)
      } catch (error) {
        // Revert optimistic update on error
        setIsLiked(prev => !prev)
        setLikeCount(prev => (isLiked ? prev + 1 : prev - 1))
        toast.error("操作失败，请稍后重试。")
      }
    })
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isPending || status === "loading"}
      variant={isLiked ? "default" : "outline"}
      className="flex items-center gap-2"
    >
      <ThumbsUp className={`h-5 w-5 ${isLiked ? "" : "text-gray-500"}`} />
      <span>{likeCount}</span>
    </Button>
  )
} 