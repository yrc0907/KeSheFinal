"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center text-center container mx-auto py-20">
      <header className="mb-12">
        <h1 className="text-5xl font-extrabold tracking-tight lg:text-6xl">
          欢迎来到房屋租赁平台
        </h1>
        <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto">
          在这里找到您理想的家。我们提供最新、最全的房源信息，助您轻松开启新生活。
        </p>
      </header>
      <div className="space-x-4">
        <Button size="lg" onClick={() => router.push("/houses")}>
          开始浏览房源
        </Button>
        <Button size="lg" variant="outline" onClick={() => router.push("/forum")}>
          进入社区论坛
        </Button>
      </div>
    </div>
  )
}
