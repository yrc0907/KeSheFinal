import { NextRequest, NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"
import OpenAI from "openai"

// 建议将您的 API 密钥存储在 .env.local 文件中，以保证安全
// OPENAI_API_KEY=your_secret_api_key
const openai = new OpenAI({
  baseURL: "https://api.302.ai/v1",
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { prompt, filePath } = await req.json()

    if (!prompt || !filePath) {
      return NextResponse.json({ message: "Prompt and filePath are required" }, { status: 400 })
    }

    // 为安全起见，验证文件路径
    const safeFilePath = path.resolve(process.cwd(), filePath)
    if (!safeFilePath.startsWith(process.cwd())) {
      return NextResponse.json({ message: "Invalid file path" }, { status: 400 })
    }

    // 1. 读取当前文件内容
    const currentCode = await fs.readFile(safeFilePath, "utf-8")

    // 2. 调用 AI 模型生成新代码
    // 这里我们使用 OpenAI 的 gpt-4-turbo 模型。
    // 您可以根据需要替换为其他模型。
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert React/Next.js developer. A user wants to modify the layout of their page.
                Your task is to take the user's prompt and the current page component code, and return the full, updated code for the component.
                Only return the code, nothing else. Do not wrap it in markdown.
                Ensure the new code is valid and maintains the existing functionality that is not related to the user's layout prompt.
                The component is a "use client" component. Keep that directive.
                The code uses Tailwind CSS for styling and components from shadcn/ui.
                `,
        },
        {
          role: "user",
          content: `Here is the user's prompt: "${prompt}". And here is the current code of the component at ${filePath}:\n\n\`\`\`tsx\n${currentCode}\n\`\`\``,
        },
      ],
    })

    const newCode = completion.choices[0].message.content

    if (!newCode) {
      throw new Error("AI did not return any code.")
    }

    // 3. 将新代码写回文件
    await fs.writeFile(safeFilePath, newCode, "utf-8")

    return NextResponse.json({ message: "Layout updated successfully" })

  } catch (error) {
    console.error("Error in /api/design:", error)
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
    return NextResponse.json({ message: `Failed to update layout: ${errorMessage}` }, { status: 500 })
  }
} 