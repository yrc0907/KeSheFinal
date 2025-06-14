"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { createPost } from "./actions"
import Image from "next/image"
import { X } from "lucide-react"

// We will create this action in the next step
// import { createPost } from "./actions"

export default function NewPostPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {

      const newFiles = Array.from(files)
      setSelectedFiles(prevFiles => [...prevFiles, ...newFiles])
    }
    // Reset the input value to allow selecting the same file again
    event.target.value = ""
  }

  const handleRemoveImage = (indexToRemove: number) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    const form = event.currentTarget
    const formData = new FormData()
    formData.append("title", (form.elements.namedItem("title") as HTMLInputElement).value)
    formData.append("content", (form.elements.namedItem("content") as HTMLTextAreaElement).value)
    selectedFiles.forEach(file => {
      formData.append("images", file)
    })

    const result = await createPost(formData)

    if (result?.error) {
      toast.error(result.error)
      setIsSubmitting(false)
    } else {
      toast.success("帖子发布成功！")
    }
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">创建新帖子</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">标题</Label>
          <Input id="title" name="title" placeholder="请输入帖子标题" required disabled={isSubmitting} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="images">图片 (可选)</Label>
          <Input
            id="images"
            name="images"
            type="file"
            accept="image/png, image/jpeg, image/gif"
            multiple
            disabled={isSubmitting}
            onChange={handleImageChange}
          />
        </div>

        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            <Label>图片预览</Label>
            <div className="grid grid-cols-3 gap-4">
              {selectedFiles.map((file, index) => (
                <div key={index} className="relative group aspect-square">
                  <Image src={URL.createObjectURL(file)} alt={`Preview ${index + 1}`} fill className="object-cover rounded-md" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
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
          <Label htmlFor="content">内容</Label>
          <Textarea id="content" name="content" placeholder="请输入帖子内容..." required rows={10} disabled={isSubmitting} />
        </div>
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
            取消
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "发布中..." : "发布帖子"}
          </Button>
        </div>
      </form>
    </div>
  )
} 