"use server"

import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import fs from "fs/promises"
import path from "path"

export async function deletePost(postId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true, image: true },
  })

  if (!post || post.authorId !== session.user.id) {
    throw new Error("Forbidden")
  }

  // Delete the image file if it exists
  if (post.image) {
    const imagePath = path.join(process.cwd(), "public", post.image)
    try {
      await fs.unlink(imagePath)
    } catch (error) {
      console.error(`Failed to delete image file: ${imagePath}`, error)
      // We can decide whether to stop the process or just log the error
      // For now, we'll log and continue to delete the DB record
    }
  }

  // Delete the post from the database
  await prisma.post.delete({
    where: { id: postId },
  })

  // Revalidate the forum page to show the post is gone
  revalidatePath("/forum")
  // Redirect to the forum index page
  redirect("/forum")
}

export async function createComment(postId: string, formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const text = formData.get("comment") as string
  if (!text || text.trim().length === 0) {
    throw new Error("Comment cannot be empty")
  }

  await prisma.comment.create({
    data: {
      text,
      postId,
      authorId: session.user.id,
    },
  })

  revalidatePath(`/forum/${postId}`)
}

export async function toggleLikePost(postId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const userId = session.user.id

  const existingLike = await prisma.like.findUnique({
    where: {
      postId_userId: {
        postId,
        userId,
      },
    },
  })

  if (existingLike) {
    await prisma.like.delete({
      where: {
        id: existingLike.id,
      },
    })
  } else {
    await prisma.like.create({
      data: {
        postId,
        userId,
      },
    })
  }

  revalidatePath(`/forum/${postId}`)
  revalidatePath(`/forum`)
} 