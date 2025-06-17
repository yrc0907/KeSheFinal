"use client"

import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"

export function EditPageButton() {
  const router = useRouter()
  const pathname = usePathname()

  // Do not show the button on the editor page itself or on auth pages
  if (pathname.startsWith("/editor") || pathname.startsWith("/login") || pathname.startsWith("/register") || pathname.startsWith("/system-select")) {
    return null
  }

  const handleEditClick = () => {
    router.push(`/editor?page=${pathname}`)
  }

  return (
    <Button
      variant="outline"
      size="icon"
      className="fixed top-4 right-4 z-50"
      onClick={handleEditClick}
    >
      <Pencil className="h-4 w-4" />
    </Button>
  )
} 