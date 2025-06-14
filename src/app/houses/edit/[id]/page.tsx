"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import Image from "next/image"

interface HouseImage {
  id: string
  url: string
}

export default function EditHousePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [address, setAddress] = useState("")
  const [rent, setRent] = useState("")
  const [type, setType] = useState("")
  const [images, setImages] = useState<HouseImage[]>([])
  const [newImages, setNewImages] = useState<File[]>([])
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([])

  useEffect(() => {
    if (id) {
      const fetchHouse = async () => {
        const response = await fetch(`/api/houses/${id}`)
        if (response.ok) {
          const data = await response.json()
          setTitle(data.title)
          setDescription(data.description)
          setAddress(data.address)
          setRent(data.rent.toString())
          setType(data.type)
          setImages(data.images || [])
        }
      }
      fetchHouse()
    }
  }, [id])

  const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewImages(Array.from(e.target.files))
    }
  }

  const handleDeleteImage = (imageId: string) => {
    setImagesToDelete([...imagesToDelete, imageId])
    setImages(images.filter((img) => img.id !== imageId))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    let newImageUrls: string[] = []
    if (newImages.length > 0) {
      const formData = new FormData()
      newImages.forEach((image) => {
        formData.append("files", image)
      })

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (uploadResponse.ok) {
        const uploadResult = await uploadResponse.json()
        newImageUrls = uploadResult.filenames
      } else {
        console.error("Failed to upload new images")
        return
      }
    }

    const response = await fetch(`/api/houses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        address,
        rent: parseFloat(rent),
        type,
        images: newImageUrls,
        imagesToDelete,
      }),
    })

    if (response.ok) {
      router.push("/my-houses")
    } else {
      console.error("Failed to update house listing")
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen py-10">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Edit House</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Label>Existing Images</Label>
            <div className="grid grid-cols-3 gap-4 mt-2">
              {images.map((image) => (
                <div key={image.id} className="relative">
                  <Image
                    src={image.url}
                    alt={title}
                    width={200}
                    height={200}
                    className="object-cover rounded-md"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1"
                    onClick={() => handleDeleteImage(image.id)}
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="new-images">Upload New Images</Label>
              <Input
                id="new-images"
                type="file"
                multiple
                onChange={handleNewImageChange}
              />
            </div>
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="rent">Rent (per month)</Label>
              <Input
                id="rent"
                type="number"
                value={rent}
                onChange={(e) => setRent(e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Type</Label>
              <Select value={type} onValueChange={setType} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a house type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Apartment">Apartment</SelectItem>
                  <SelectItem value="House">House</SelectItem>
                  <SelectItem value="Room">Room</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit">Update</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 