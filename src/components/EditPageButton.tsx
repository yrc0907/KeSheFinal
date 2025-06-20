"use client"

import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"
import { useEffect, useState } from "react"

export function EditPageButton() {
  const router = useRouter()
  const pathname = usePathname()
  const [isInIframe, setIsInIframe] = useState(false)

  useEffect(() => {
    // Check if the window is inside an iframe
    if (window.self !== window.top) {
      setIsInIframe(true)
    }
  }, [])

  // Do not show the button on the editor page itself, on auth pages, or inside an iframe
  if (
    isInIframe ||
    pathname.startsWith("/editor") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/system-select")
  ) {
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