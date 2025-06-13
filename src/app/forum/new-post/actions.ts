"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import path from "path"
import fs from "fs/promises"

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

export async function createPost(formData: FormData) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return { error: "Unauthorized: You must be logged in to create a post." }
  }

  const title = formData.get("title") as string
  const content = formData.get("content") as string
  const imageFiles = formData.getAll("images") as File[]

  if (!title || title.trim().length === 0) {
    return { error: "Title is required." }
  }
  if (!content || content.trim().length === 0) {
    return { error: "Content is required." }
  }

  try {
    const imageUrls: { url: string }[] = []
    if (imageFiles && imageFiles.length > 0) {
      for (const imageFile of imageFiles) {
        if (imageFile.size > 0) {
          const imageUrl = await saveImage(imageFile, session.user.id)
          imageUrls.push({ url: imageUrl })
        }
      }
    }

    await prisma.post.create({
      data: {
        title,
        content,
        authorId: session.user.id,
        images: {
          create: imageUrls,
        },
      },
    })
  } catch (error) {
    console.error(error)
    return {
      error: "Database error: Failed to create post.",
    }
  }

  revalidatePath("/forum")
  redirect("/forum")
} 