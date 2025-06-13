"use client"

import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <div className="text-center">
          <h1 className="text-4xl font-bold">Welcome, {session.user?.name}</h1>
          <p className="mt-3 text-lg">You are signed in as {session.user?.email}</p>
        </div>
        <div className="mt-5 space-x-2">
          <Button onClick={() => router.push('/houses')}>Browse Houses</Button>
          <Button variant="secondary" onClick={() => router.push('/my-houses')}>My Houses</Button>
          <Button variant="secondary" onClick={() => router.push('/forum')}>Forum</Button>
          <Button onClick={() => signOut()}>Logout</Button>
        </div>
      </div>
    )
  }

  return null
} 