"use client"

import { useState, useRef, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { RootComment } from "@/types"

interface CommentFormProps {
  houseId: string
  parentId?: string | null
  rootId?: string | null
  onCommentPosted: (newComment: RootComment) => void
  onCancel?: () => void
  autoFocus?: boolean
}

export function CommentForm({
  houseId,
  parentId = null,
  rootId = null,
  onCommentPosted,
  onCancel,
  autoFocus = false,
}: CommentFormProps) {
  const { data: session } = useSession()
  const [text, setText] = useState("")
  const [isPending, setIsPending] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (autoFocus) {
      textareaRef.current?.focus()
    }
  }, [autoFocus])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!text.trim() || !session?.user) return

    setIsPending(true)

    try {
      const response = await fetch(`/api/houses/${houseId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, parentId, rootId }),
      })

      if (response.ok) {
        const newComment = await response.json()
        toast.success("评论已发布！")
        setText("")
        onCommentPosted({
          ...newComment,
          author: {
            id: session.user.id,
            name: session.user.name,
            image: session.user.image,
          },
          replies: [],
        })
        if (onCancel) onCancel()
      } else {
        toast.error("评论失败，请稍后重试。")
      }
    } catch (error) {
      toast.error("评论失败，请稍后重试。")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={parentId ? "写下你的回复..." : "写下你的评论..."}
        rows={3}
        disabled={isPending}
        required
      />
      <div className="flex justify-end items-center gap-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            取消
          </Button>
        )}
        <Button type="submit" disabled={!text.trim() || isPending}>
          {isPending ? "发布中..." : parentId ? "回复" : "发布评论"}
        </Button>
      </div>
    </form>
  )
} 