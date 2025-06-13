import { getServerSession } from "next-auth/next"

import { NextResponse } from "next/server"

import bcrypt from "bcryptjs"
import { PrismaClient } from "@/generated/prisma"
import { authOptions } from "@/lib/auth"

export async function PUT(req: Request) {
  const prisma = new PrismaClient()
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { currentPassword, newPassword } = await req.json()
  const userId = session.user.id

  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { error: "Current password and new password are required" },
      { status: 400 }
    )
  }

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || !user.hashedPassword) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const isPasswordValid = await bcrypt.compare(
    currentPassword,
    user.hashedPassword
  )

  if (!isPasswordValid) {
    return NextResponse.json({ error: "Invalid current password" }, { status: 403 })
  }

  const newHashedPassword = await bcrypt.hash(newPassword, 10)

  await prisma.user.update({
    where: { id: userId },
    data: { hashedPassword: newHashedPassword },
  })

  return NextResponse.json({ message: "Password updated successfully" })
} 