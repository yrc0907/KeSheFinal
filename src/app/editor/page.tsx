"use client"

import { useSearchParams } from "next/navigation"

export default function EditorPage() {
  const searchParams = useSearchParams()
  const page = searchParams.get("page")

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Low-code Editor</h1>
      <p className="mt-4">
        Editing page: <strong>{page}</strong>
      </p>
      <p className="mt-2">
        (This is a placeholder for the low-code editor. The full editor experience will be built here.)
      </p>
    </div>
  )
} 