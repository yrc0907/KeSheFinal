"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Mail, MapPin, Building, DollarSign, Info } from "lucide-react"
import Image from "next/image"
import { CommentSection } from "./CommentSection"

interface HouseDetail {
  id: string
  title: string
  description: string
  address: string
  rent: number
  type: string
  createdAt: string
  owner: {
    name: string | null
    email: string | null
  }
  images: {
    id: string
    url: string
  }[]
}

export default function HouseDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [house, setHouse] = useState<HouseDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (id) {
      const fetchHouseDetail = async () => {
        setIsLoading(true)
        try {
          const response = await fetch(`/api/houses/${id}`)
          if (response.ok) {
            const data = await response.json()
            setHouse(data)
          } else {
            setHouse(null)
          }
        } catch (error) {
          console.error("Failed to fetch house details:", error)
          setHouse(null)
        } finally {
          setIsLoading(false)
        }
      }
      fetchHouseDetail()
    }
  }, [id])

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 text-center">
        <p>正在加载房源详情...</p>
      </div>
    )
  }

  if (!house) {
    return (
      <div className="container mx-auto py-10 text-center">
        <h2 className="text-2xl font-semibold">无法找到该房源</h2>
        <p className="text-muted-foreground mt-2">
          该房源可能已被删除或链接不正确。
        </p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <Card>
        <CardHeader>
          <p className="text-base font-semibold text-primary">{house.type}</p>
          <CardTitle className="text-4xl font-bold">{house.title}</CardTitle>
          <div className="flex items-center pt-2">
            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
            <CardDescription>{house.address}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Separator />
          <div className="flex items-center text-3xl font-bold text-primary">
            <DollarSign className="h-8 w-8 mr-2" />
            <span>
              {house.rent}
              <span className="text-xl font-medium text-muted-foreground">/月</span>
            </span>
          </div>
          <Separator />
          <div>
            <h4 className="font-semibold text-lg mb-2 flex items-center">
              <Info className="h-5 w-5 mr-2" />
              详细描述
            </h4>
            <p className="whitespace-pre-wrap text-muted-foreground">
              {house.description}
            </p>
          </div>
          <Separator />
          <div>
            <h4 className="font-semibold text-lg mb-2">房东信息</h4>
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarImage />
                <AvatarFallback>
                  {house.owner.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{house.owner.name}</p>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 mr-2" />
                  <a
                    href={`mailto:${house.owner.email}`}
                    className="hover:underline"
                  >
                    {house.owner.email}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {house.images && house.images.length > 0 && (
        <div className="mt-8">
          <h3 className="text-2xl font-bold mb-4">房屋图片</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {house.images.map((image) => (
              <div key={image.id} className="relative aspect-video">
                <Image
                  src={image.url}
                  alt={house.title}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <CommentSection houseId={house.id} />
      </div>
    </div>
  )
} 