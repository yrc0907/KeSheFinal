import { getServerSession } from "next-auth/next"

import { PrismaClient } from "@/generated/prisma"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"

const prisma = new PrismaClient()

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  const id = context.params.id
  const house = await prisma.house.findUnique({
    where: {
      id: id,
    },
    include: {
      owner: {
        select: {
          name: true,
          email: true,
        },
      },
      images: true,
    },
  })

  if (!house) {
    return new NextResponse("House not found", { status: 404 })
  }

  return NextResponse.json(house)
}

export async function PUT(
  request: Request,
  context: { params: { id: string } }
) {
  const id = context.params.id
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const houseToUpdate = await prisma.house.findUnique({
    where: { id: id },
  })

  if (!houseToUpdate || houseToUpdate.ownerId !== session.user.id) {
    return new NextResponse("Forbidden", { status: 403 })
  }

  const body = await request.json()
  const { title, description, address, rent, type, images, imagesToDelete } = body

  if (imagesToDelete && imagesToDelete.length > 0) {
    await prisma.houseImage.deleteMany({
      where: {
        id: {
          in: imagesToDelete,
        },
        // Make sure user can only delete images from their own house
        house: {
          id: id,
          ownerId: session.user.id,
        },
      },
    })
  }

  const updatedHouse = await prisma.house.update({
    where: {
      id: id,
    },
    data: {
      title,
      description,
      address,
      rent,
      type,
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

  return NextResponse.json(updatedHouse)
}

export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  const id = context.params.id
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const houseToDelete = await prisma.house.findUnique({
    where: { id: id },
  })

  if (!houseToDelete || houseToDelete.ownerId !== session.user.id) {
    return new NextResponse("Forbidden", { status: 403 })
  }

  await prisma.house.delete({
    where: {
      id: id,
    },
  })

  return new NextResponse(null, { status: 204 })
} 