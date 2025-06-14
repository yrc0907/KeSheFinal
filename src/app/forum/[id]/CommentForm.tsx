"use client"

import { useState, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { createComment } from "./actions"
import Image from "next/image"
import { X } from "lucide-react"

interface CommentFormProps {
  postId: string
  parentId?: string | null
  onCommentCreated?: () => void
  autoFocus?: boolean
}

export function CommentForm({
  postId,
  parentId = null,
  onCommentCreated,
  autoFocus = false
}: CommentFormProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [commentText, setCommentText] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useState(() => {
    if (autoFocus) {
      textareaRef.current?.focus()
    }
  })

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!commentText.trim() || !session?.user) return

    const formData = new FormData()
    formData.append("comment", commentText)
    if (parentId) {
      formData.append("parentId", parentId)
    }
    if (imageFile) {
      formData.append("image", imageFile)
    }

    setIsPending(true)

    try {
      await createComment(postId, formData)
      toast.success("评论已发布！")

      // Clear form state before refreshing
      setCommentText("")
      removeImage()
      onCommentCreated?.()

      router.refresh()
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
        value={commentText}
        onChange={e => setCommentText(e.target.value)}
        placeholder={parentId ? "写下你的回复..." : "写下你的评论..."}
        rows={3}
        disabled={isPending}
        required
      />
      {imagePreview && (
        <div className="relative w-24 h-24">
          <Image src={imagePreview} alt="Image preview" fill className="object-cover rounded-md" />
          <button
            type="button"
            onClick={removeImage}
            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-0.5"
            aria-label="Remove image preview"
          >
            <X size={16} />
          </button>
        </div>
      )}
      <div className="flex justify-between items-center">
        <Input
          type="file"
          id={`image-upload-${parentId || 'root'}`}
          ref={fileInputRef}
          onChange={handleImageChange}
          accept="image/*"
          className="hidden"
        />
        <label htmlFor={`image-upload-${parentId || 'root'}`} className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
          添加图片
        </label>
        <Button type="submit" disabled={isPending}>
          {isPending ? "发布中..." : (parentId ? "回复" : "发布评论")}
        </Button>
      </div>
    </form>
  )
} 