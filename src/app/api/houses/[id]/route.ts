import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { PrismaClient } from "@/generated/prisma"
import { NextResponse } from "next/server"

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
  const { title, description, address, rent, type } = body

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