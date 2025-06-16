import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password, systemType, ...otherFields } = body

    if (!email || !password) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    const exist = await prisma.user.findUnique({
      where: {
        email: email,
      },
    })

    if (exist) {
      return new NextResponse("User already exists", { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name: name || email.split("@")[0], // Use part of email if name not provided
        email,
        hashedPassword: hashedPassword,
        systemType: systemType || "rental", // Default to rental if not specified
        metadata: {
          // Store additional fields in metadata
          ...otherFields
        }
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error(error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 