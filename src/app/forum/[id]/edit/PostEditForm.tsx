"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import Image from "next/image"
import { X } from "lucide-react"
import { updatePost } from "./actions"

// Define types locally to avoid any potential editor/TS server resolution issues.
// This makes the component self-contained and robust.
interface PostImage {
  id: string
  url: string
}

interface Post {
  id: string
  title: string
  content: string
  images: PostImage[]
}

interface PostEditFormProps {
  post: Post
}

export function PostEditForm({ post }: PostEditFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [existingImages, setExistingImages] = useState(post.images || [])
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([])

  const handleRemoveExistingImage = (imageId: string) => {
    setExistingImages(existingImages.filter(img => img.id !== imageId))
    setImagesToDelete(prev => [...prev, imageId])
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    // Append the IDs of images marked for deletion
    imagesToDelete.forEach(id => formData.append("imagesToDelete", id))

    const result = await updatePost(post.id, formData)

    if (result?.error) {
      toast.error(result.error)
      setIsSubmitting(false)
    } else {
      toast.success("帖子更新成功！")
      // Redirect is handled by the server action, no need to do it here.
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">标题</Label>
        <Input
          id="title"
          name="title"
          defaultValue={post.title}
          required
          disabled={isSubmitting}
        />
      </div>

      {existingImages && existingImages.length > 0 && (
        <div className="space-y-2">
          <Label>当前图片</Label>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
            {existingImages.map(image => (
              <div key={image.id} className="relative group aspect-square">
                <Image
                  src={image.url}
                  alt="Current post image"
                  fill
                  className="object-cover rounded-md border"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveExistingImage(image.id)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none"
                  aria-label="Remove image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="images">添加新图片 (可选)</Label>
        <Input
          id="images"
          name="images"
          type="file"
          multiple
          accept="image/png, image/jpeg, image/gif"
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">内容</Label>
        <Textarea
          id="content"
          name="content"
          defaultValue={post.content}
          required
          rows={10}
          disabled={isSubmitting}
        />
      </div>
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          取消
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "更新中..." : "更新帖子"}
        </Button>
      </div>
    </form>
  )
} 