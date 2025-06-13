import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { PrismaClient } from "@/generated/prisma"
import { NextResponse } from "next/server"

const prisma = new PrismaClient()

export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  const id = context.params.id
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const body = await request.json()
  const { content } = body

  if (!content) {
    return new NextResponse("Missing content", { status: 400 })
  }

  const reply = await prisma.forumReply.create({
    data: {
      content,
      authorId: session.user.id,
      postId: id,
    },
  })

  return NextResponse.json(reply)
} 