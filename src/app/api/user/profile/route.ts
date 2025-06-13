import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { PrismaClient } from "@/generated/prisma"
import { authOptions } from "@/lib/auth"

export async function PUT(req: Request) {
  const prisma = new PrismaClient()
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { name } = await req.json()
  const userId = session.user.id

  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "Invalid name" }, { status: 400 })
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name },
    })
    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
} 