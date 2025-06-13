import { PrismaClient } from "@/generated/prisma"
import { NextResponse } from "next/server"

const prisma = new PrismaClient()

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  const id = context.params.id;
  const post = await prisma.forumPost.findUnique({
    where: { id: id },
    include: {
      author: {
        select: { name: true, image: true },
      },
      replies: {
        include: {
          author: {
            select: { name: true, image: true },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  })

  if (!post) {
    return new NextResponse("Post not found", { status: 404 })
  }

  return NextResponse.json(post)
} 