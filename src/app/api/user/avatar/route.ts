import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import path from "path"
import fs from "fs/promises"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id
  const formData = await req.formData()
  const avatar = formData.get("avatar") as File | null

  if (!avatar) {
    return NextResponse.json({ error: "No avatar provided" }, { status: 400 })
  }

  // Use a buffer to handle the file in memory
  const avatarBuffer = Buffer.from(await avatar.arrayBuffer())
  const fileExtension = path.extname(avatar.name)
  const newFileName = `${userId}${fileExtension}`

  // Define the public directory for uploads
  const uploadDir = path.join(process.cwd(), "public", "avatars")
  const filePath = path.join(uploadDir, newFileName)
  const publicPath = `/avatars/${newFileName}`

  try {
    // Ensure the upload directory exists
    await fs.mkdir(uploadDir, { recursive: true })
    // Write the file to the filesystem
    await fs.writeFile(filePath, avatarBuffer)

    // Update the user's record in the database
    await prisma.user.update({
      where: { id: userId },
      data: { image: publicPath },
    })

    // Return the new path to the client
    return NextResponse.json({
      message: "Avatar uploaded successfully",
      filePath: publicPath,
    })
  } catch (error) {
    console.error("Error uploading avatar:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
} 