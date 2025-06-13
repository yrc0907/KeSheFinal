"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { HouseSearchSidebar } from "@/components/HouseSearchSidebar"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"

interface House {
  id: string
  title: string
  address: string
  rent: number
  type: string
  description: string
}

export default function HousesPage() {
  const [houses, setHouses] = useState<House[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const searchParams = useSearchParams()

  useEffect(() => {
    const fetchHouses = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(
          `/api/houses/search?${searchParams.toString()}`
        )
        if (response.ok) {
          const data = await response.json()
          setHouses(data)
        } else {
          setHouses([])
        }
      } catch (error) {
        console.error("Failed to fetch houses:", error)
        setHouses([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchHouses()
  }, [searchParams])

  return (
    <div className="container mx-auto py-10">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
        <aside className="md:col-span-1 sticky top-20">
          <HouseSearchSidebar />
        </aside>
        <main className="md:col-span-3">
          {isLoading ? (
            <div className="text-center py-10">
              <p>加载房源中...</p>
            </div>
          ) : houses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {houses.map((house) => (
                <Card key={house.id}>
                  <CardHeader>
                    <CardTitle>{house.title}</CardTitle>
                    <CardDescription>{house.type}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-3 h-[60px]">{house.description}</p>
                    <p className="mt-4 font-semibold text-lg">
                      ${house.rent}/月
                    </p>
                  </CardContent>
                  <CardFooter>
                    <p className="text-sm text-muted-foreground truncate">
                      {house.address}
                    </p>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-muted rounded-lg">
              <h2 className="text-2xl font-semibold">未找到相关房源</h2>
              <p className="text-muted-foreground mt-2">
                请尝试调整您的搜索条件
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
