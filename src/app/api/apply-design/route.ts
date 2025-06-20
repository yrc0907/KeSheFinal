import { NextRequest, NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

export async function POST(req: NextRequest) {
  try {
    const { newCode, filePath } = await req.json()

    if (!newCode || !filePath) {
      return NextResponse.json({ message: "newCode and filePath are required" }, { status: 400 })
    }

    // 为安全起见，验证文件路径
    const safeFilePath = path.resolve(process.cwd(), filePath)
    if (!safeFilePath.startsWith(process.cwd())) {
      return NextResponse.json({ message: "Invalid file path" }, { status: 400 })
    }

    // 将新代码写入文件
    await fs.writeFile(safeFilePath, newCode, "utf-8")

    return NextResponse.json({ message: "Layout applied successfully" })

  } catch (error) {
    console.error("Error in /api/apply-design:", error)
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
    return NextResponse.json({ message: `Failed to apply layout: ${errorMessage}` }, { status: 500 })
  }
} 