import { getServerSession } from "next-auth/next"

import { PrismaClient } from "@/generated/prisma"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"

const prisma = new PrismaClient()

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const body = await request.json()
  const { title, description, address, rent, type } = body

  if (!title || !description || !address || !rent || !type) {
    return new NextResponse("Missing required fields", { status: 400 })
  }

  try {
    const house = await prisma.house.create({
      data: {
        title,
        description,
        address,
        rent,
        type,
        ownerId: session.user.id,
      },
    })

    return NextResponse.json(house)
  } catch (error) {
    console.error("Failed to create house:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 