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

                ### Critical Rules for Self-Sufficiency
                Your generated code MUST be immediately renderable without needing manual fixes. To achieve this, follow these rules:

                1.  **Mock Data Generation**: If your new design requires data that doesn't exist (e.g., a list of items, user activity), you MUST create realistic mock data directly in the component. Use \`useState\` or \`const\` arrays.

                2.  **Image Placeholders**: If your design needs images (e.g., avatars, banners), you MUST use a placeholder service. Use URLs like \`https://via.placeholder.com/400x200\` for generic placeholders. Do NOT use local paths like \`/img.png\`.

                3.  **Icon Integration**: If your design requires icons, you MUST use the \`lucide-react\` library.
                    *   Assume \`lucide-react\` is installed.
                    *   Import necessary icons at the top, e.g., \`import { User, Settings } from 'lucide-react';\`.
                    *   Use them in JSX: \`<User className="w-5 h-5" />\`.

                4.  **Chart Implementation**: If the user requests charts or graphs, you MUST use the \`recharts\` library.
                    *   Assume \`recharts\` is installed.
                    *   Import necessary components, e.g., \`LineChart\`, \`BarChart\`, \`XAxis\`, \`YAxis\`, \`CartesianGrid\`, \`Tooltip\`, \`Legend\`, \`Line\`, \`Bar\`.
                    *   You MUST provide mock data suitable for the chart.

                ### General Guidelines
                *   Your entire output must be only the raw, valid \`.tsx\` code. Do not include any explanations or markdown.
                *   The component is a "use client" component. Keep that directive.
                *   The project uses Tailwind CSS and shadcn/ui. Leverage these for styling.
                *   Preserve all existing functionality (state, event handlers) that is not directly related to the new layout request.
                `,
        },
        {
          role: "user",
          content: `Here is the user's prompt: "${prompt}". And here is the current code of the component at ${filePath}:\n\n\`\`\`tsx\n${currentCode}\n\`\`\``,
        },
      ],
    })

    const rawCode = completion.choices[0].message.content

    if (!rawCode) {
      throw new Error("AI did not return any code.")
    }

    // 净化AI的输出：移除潜在的Markdown代码块标记
    const newCode = rawCode.replace(/^```tsx\n|```$/g, "").trim()

    // 3. 返回新旧代码以供预览，而不是直接写入文件
    return NextResponse.json({
      message: "Layout generated successfully for preview.",
      currentCode: currentCode,
      newCode: newCode,
    })

  } catch (error) {
    console.error("Error in /api/design:", error)
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
    return NextResponse.json({ message: `Failed to update layout: ${errorMessage}` }, { status: 500 })
  }
} 