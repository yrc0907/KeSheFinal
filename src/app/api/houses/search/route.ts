import { PrismaClient } from "@/generated/prisma"
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("query")
  const type = searchParams.get("type")
  const minRent = searchParams.get("minRent")
  const maxRent = searchParams.get("maxRent")
  let systemType = searchParams.get("systemType") || null

  // Try to get system type from session if not provided in query
  if (!systemType) {
    try {
      const session = await getServerSession(authOptions)
      if (session?.user?.systemType) {
        // Use the system type from the session
        const userSystemType = session.user.systemType
        if (userSystemType) {
          // Will be added to the where clause below
          systemType = userSystemType
        }
      }
    } catch (e) {
      console.error("Failed to get session:", e)
      // Continue without system type filter
    }
  }

  let where: any = {}

  // Filter by address/location
  if (query) {
    where.address = {
      contains: query,
    }
  }

  // Filter by type
  if (type && type !== "all") {
    where.type = type
  }

  // Filter by minimum rent
  if (minRent) {
    where.rent = {
      ...where.rent,
      gte: parseFloat(minRent),
    }
  }

  // Filter by maximum rent
  if (maxRent) {
    where.rent = {
      ...where.rent,
      lte: parseFloat(maxRent),
    }
  }

  // Filter by system type
  if (systemType) {
    // Use string contains to search in the metadata JSON field
    where.metadata = {
      contains: `"systemType":"${systemType}"`,
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