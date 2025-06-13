"use client"
/*eslint-disable*/
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
import Link from "next/link"

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
                <Link href={`/houses/${house.id}`} key={house.id}>
                  <Card className="flex flex-col justify-between h-full hover:shadow-lg transition-shadow duration-300">
                    <div>
                      <CardHeader>
                        <CardTitle>{house.title}</CardTitle>
                        <CardDescription>{house.type}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-1">
                          <p className="text-xs font-semibold uppercase text-muted-foreground">
                            描述
                          </p>
                          <p className="text-sm line-clamp-3">
                            {house.description}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-semibold uppercase text-muted-foreground">
                            租金
                          </p>
                          <p className="font-semibold text-lg">
                            ${house.rent}/月
                          </p>
                        </div>
                      </CardContent>
                    </div>
                    <CardFooter>
                      <div className="w-full space-y-1">
                        <p className="text-xs font-semibold uppercase text-muted-foreground">
                          地址
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {house.address}
                        </p>
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
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
