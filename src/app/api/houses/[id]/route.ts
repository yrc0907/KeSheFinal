import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { PrismaClient } from "@/generated/prisma"
import { NextResponse } from "next/server"

const prisma = new PrismaClient()

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const house = await prisma.house.findUnique({
    where: {
      id: params.id,
    },
  })

  if (!house) {
    return new NextResponse("House not found", { status: 404 })
  }

  return NextResponse.json(house)
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const house = await prisma.house.findUnique({
    where: {
      id: params.id,
    },
  })

  if (!house || house.ownerId !== session.user.id) {
    return new NextResponse("Forbidden", { status: 403 })
  }

  const body = await request.json()
  const { title, description, address, rent, type } = body

  const updatedHouse = await prisma.house.update({
    where: {
      id: params.id,
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
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const house = await prisma.house.findUnique({
    where: {
      id: params.id,
    },
  })

  if (!house || house.ownerId !== session.user.id) {
    return new NextResponse("Forbidden", { status: 403 })
  }

  await prisma.house.delete({
    where: {
      id: params.id,
    },
  })

  return new NextResponse(null, { status: 204 })
} 