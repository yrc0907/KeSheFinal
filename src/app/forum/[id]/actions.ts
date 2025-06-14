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
    include: { images: true },
  })

  if (!post || post.authorId !== session.user.id) {
    throw new Error("Forbidden")
  }

  // Delete all image files associated with the post
  if (post.images && post.images.length > 0) {
    for (const image of post.images) {
      const imagePath = path.join(process.cwd(), "public", image.url)
      await fs.unlink(imagePath).catch(err => console.error("Failed to delete post image file:", err))
    }
  }

  await prisma.post.delete({
    where: { id: postId },
  })

  revalidatePath("/forum")
  redirect("/forum")
}

async function saveCommentImage(imageFile: File, userId: string): Promise<string> {
  const imageBuffer = Buffer.from(await imageFile.arrayBuffer())
  const fileExtension = path.extname(imageFile.name)
  const newFileName = `comment-${Date.now()}-${userId}${fileExtension}`

  const uploadDir = path.join(process.cwd(), "public", "comment_images")
  await fs.mkdir(uploadDir, { recursive: true })

  const filePath = path.join(uploadDir, newFileName)
  await fs.writeFile(filePath, imageBuffer)

  return `/comment_images/${newFileName}`
}

export async function createComment(postId: string, formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const text = formData.get("comment") as string
  const parentId = formData.get("parentId") as string | null
  const imageFile = formData.get("image") as File | null

  if (!text || text.trim().length === 0) {
    throw new Error("Comment cannot be empty")
  }

  let imageUrl: string | undefined = undefined
  if (imageFile && imageFile.size > 0) {
    imageUrl = await saveCommentImage(imageFile, session.user.id)
  }

  let rootId: string | null = null;
  if (parentId) {
    const parentComment = await prisma.comment.findUnique({
      where: { id: parentId },
      select: { rootId: true, id: true }
    });
    // If parent is a root comment, its rootId is null. In that case, its own id is the root.
    // If parent is a reply, it has a rootId which we'll use.
    rootId = parentComment?.rootId || parentComment?.id || null;
  }

  await prisma.comment.create({
    data: {
      text,
      image: imageUrl,
      postId,
      authorId: session.user.id,
      parentId: parentId || null,
      rootId: rootId
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

export async function getMoreComments(postId: string, cursor?: string) {
  const comments = await prisma.comment.findMany({
    take: 10,
    ...(cursor && {
      skip: 1, // Skip the cursor itself
      cursor: {
        id: cursor,
      },
    }),
    where: {
      postId: postId,
      parentId: null, // Only fetch top-level comments
    },
    include: {
      author: true,
      _count: {
        select: { replies: true } // Count all direct replies
      }
    },
    orderBy: {
      createdAt: 'asc',
    },
  });
  return comments;
}

export async function getReplies(commentId: string) {
  const replies = await prisma.comment.findMany({
    where: {
      rootId: commentId
    },
    include: {
      author: true,
      parent: { // To show "replying to X"
        include: {
          author: true
        }
      }
    },
    orderBy: {
      createdAt: 'asc'
    }
  });
  return replies;
} 