"use server"

import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import fs from "fs/promises"
import path from "path"

async function saveImage(imageFile: File, userId: string): Promise<string> {
  const imageBuffer = Buffer.from(await imageFile.arrayBuffer())
  const fileExtension = path.extname(imageFile.name)
  const newFileName = `${Date.now()}-${userId}${fileExtension}`

  const uploadDir = path.join(process.cwd(), "public", "post_images")
  await fs.mkdir(uploadDir, { recursive: true })

  const filePath = path.join(uploadDir, newFileName)
  await fs.writeFile(filePath, imageBuffer)

  return `/post_images/${newFileName}`
}

export async function updatePost(postId: string, formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { images: true },
  })

  if (!post || post.authorId !== session.user.id) {
    return { error: "Forbidden" }
  }

  const title = formData.get("title") as string
  const content = formData.get("content") as string
  const newImageFiles = formData.getAll("images") as File[]
  const imagesToDelete = formData.getAll("imagesToDelete") as string[]

  if (!title || title.trim().length === 0) {
    return { error: "Title is required." }
  }

  try {
    // 1. Delete images marked for deletion
    if (imagesToDelete.length > 0) {
      for (const imageId of imagesToDelete) {
        const image = post.images.find(img => img.id === imageId)
        if (image) {
          const imagePath = path.join(process.cwd(), "public", image.url)
          await fs.unlink(imagePath).catch(err => console.error("Failed to delete image file:", err))
        }
      }
      await prisma.postImage.deleteMany({
        where: { id: { in: imagesToDelete } },
      })
    }

    // 2. Add new images
    const newImageUrls: { url: string }[] = []
    if (newImageFiles && newImageFiles.length > 0) {
      for (const imageFile of newImageFiles) {
        if (imageFile.size > 0) {
          const imageUrl = await saveImage(imageFile, session.user.id)
          newImageUrls.push({ url: imageUrl })
        }
      }
    }

    // 3. Update post with new text and new images
    await prisma.post.update({
      where: { id: postId },
      data: {
        title,
        content,
        images: {
          create: newImageUrls,
        },
      },
    })
  } catch (error) {
    console.error("Failed to update post:", error)
    return { error: "Database error: Failed to update post." }
  }

  revalidatePath(`/forum`)
  revalidatePath(`/forum/${postId}`)
  redirect(`/forum/${postId}`)
} 