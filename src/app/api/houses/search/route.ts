import { PrismaClient } from "@/generated/prisma"
import { NextRequest, NextResponse } from "next/server"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("query")
  const type = searchParams.get("type")
  const minRent = searchParams.get("minRent")
  const maxRent = searchParams.get("maxRent")

  let where: any = {}

  if (query) {
    where.address = {
      contains: query,
      mode: "insensitive",
    }
  }

  if (type && type !== "all") {
    where.type = type
  }

  if (minRent) {
    where.rent = {
      ...where.rent,
      gte: parseFloat(minRent),
    }
  }

  if (maxRent) {
    where.rent = {
      ...where.rent,
      lte: parseFloat(maxRent),
    }
  }

  try {
    const houses = await prisma.house.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    })
    return NextResponse.json(houses)
  } catch (error) {
    console.error(error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 