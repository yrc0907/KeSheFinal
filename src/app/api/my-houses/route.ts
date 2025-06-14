import { getServerSession } from "next-auth/next"

import { PrismaClient } from "@/generated/prisma"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"

const prisma = new PrismaClient()

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const houses = await prisma.house.findMany({
    where: {
      ownerId: session.user.id,
    },
    include: {
      images: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return NextResponse.json(houses)
} 