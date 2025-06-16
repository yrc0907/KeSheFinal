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
  const { title, description, address, rent, type, images, systemType = "rental" } = body

  if (!title || !description || !address || !rent || !type) {
    return new NextResponse("Missing required fields", { status: 400 })
  }

  try {
    // Store additional metadata for different system types
    let metadata = {}

    if (systemType === 'book') {
      metadata = {
        bookType: type, // Fiction, NonFiction, Reference
        author: title.split(' - ')[1] || '', // Optional: Could extract author from title if formatted as "Title - Author"
      }
    } else if (systemType === 'teacher') {
      metadata = {
        teacherTitle: type, // Professor, AssociateProfessor, Lecturer
        department: description.split('\n')[0] || '', // Optional: Could extract department from first line
      }
    }

    const house = await prisma.house.create({
      data: {
        title,
        description,
        address,
        rent,
        type,
        ownerId: session.user.id,
        // Store the system type in the metadata field (as string)
        metadata: JSON.stringify({
          systemType,
          ...metadata
        }),
        ...(images && images.length > 0 && {
          images: {
            create: images.map((url: string) => ({ url })),
          },
        }),
      },
      include: {
        images: true,
      },
    })

    return NextResponse.json(house)
  } catch (error) {
    console.error("Failed to create item:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 