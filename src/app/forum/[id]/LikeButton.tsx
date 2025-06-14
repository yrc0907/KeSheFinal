"use client"

import { useState, useTransition } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { toggleLikePost } from "./actions"

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
  const { data: session } = useSession()
  const router = useRouter()
  const [isLiked, setIsLiked] = useState(isInitiallyLiked)
  const [likeCount, setLikeCount] = useState(initialLikes)
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    if (!session) {
      router.push("/login")
      return
    }

    // Optimistic update
    setIsLiked(prev => !prev)
    setLikeCount(prev => (isLiked ? prev - 1 : prev + 1))

    startTransition(() => {
      toggleLikePost(postId).catch(() => {
        // Revert on error
        setIsLiked(isInitiallyLiked)
        setLikeCount(initialLikes)
        toast.error("操作失败，请重试")
      })
    })
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isPending}
      variant="ghost"
      className="flex items-center gap-2"
    >
      <Heart className={`w-5 h-5 ${isLiked ? "text-red-500 fill-red-500" : "text-gray-500"}`} />
      <span className="font-medium">{likeCount}</span>
    </Button>
  )
} 