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
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useSystem } from "@/context/SystemContext"

export default function NewItemPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { system } = useSystem()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [address, setAddress] = useState("")
  const [rent, setRent] = useState("")
  const [type, setType] = useState("")
  const [images, setImages] = useState<File[]>([])

  // System-specific UI labels
  const uiLabels = {
    rental: {
      pageTitle: "发布新房源",
      titleLabel: "标题",
      titlePlaceholder: "输入房源标题",
      descriptionLabel: "描述",
      descriptionPlaceholder: "详细描述房源情况",
      addressLabel: "地址",
      addressPlaceholder: "输入详细地址",
      rentLabel: "租金 (每月)",
      rentPlaceholder: "输入月租金",
      imagesLabel: "上传图片",
      typeLabel: "房屋类型",
      typePlaceholder: "选择房屋类型",
      types: [
        { value: "Apartment", label: "公寓" },
        { value: "House", label: "独栋" },
        { value: "Room", label: "单间" }
      ],
      submitButton: "发布房源"
    },
    book: {
      pageTitle: "添加新图书",
      titleLabel: "书名",
      titlePlaceholder: "输入书名",
      descriptionLabel: "简介",
      descriptionPlaceholder: "书籍简介",
      addressLabel: "馆藏位置",
      addressPlaceholder: "输入馆藏位置",
      rentLabel: "借阅费用",
      rentPlaceholder: "输入借阅费用",
      imagesLabel: "上传封面",
      typeLabel: "图书类型",
      typePlaceholder: "选择图书类型",
      types: [
        { value: "Fiction", label: "小说" },
        { value: "NonFiction", label: "非小说" },
        { value: "Reference", label: "参考资料" }
      ],
      submitButton: "添加图书"
    },
    teacher: {
      pageTitle: "登记新教师",
      titleLabel: "姓名",
      titlePlaceholder: "输入教师姓名",
      descriptionLabel: "专业背景",
      descriptionPlaceholder: "教师专业背景描述",
      addressLabel: "办公室",
      addressPlaceholder: "输入办公室位置",
      rentLabel: "课时费",
      rentPlaceholder: "输入课时费",
      imagesLabel: "上传照片",
      typeLabel: "职称",
      typePlaceholder: "选择职称",
      types: [
        { value: "Professor", label: "教授" },
        { value: "AssociateProfessor", label: "副教授" },
        { value: "Lecturer", label: "讲师" }
      ],
      submitButton: "登记教师"
    }
  }[system || "rental"]

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    let imageUrls: string[] = []
    if (images.length > 0) {
      const formData = new FormData()
      images.forEach((image) => {
        formData.append("files", image)
      })

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (uploadResponse.ok) {
        const uploadResult = await uploadResponse.json()
        imageUrls = uploadResult.filenames
      } else {
        console.error("Failed to upload images")
        // Optionally, show an error to the user
        return
      }
    }

    const response = await fetch("/api/houses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        address,
        rent: parseFloat(rent),
        type,
        images: imageUrls,
        systemType: system
      }),
    })

    if (response.ok) {
      router.push("/my-houses")
    } else {
      console.error("Failed to create item")
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>{uiLabels.pageTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">{uiLabels.titleLabel}</Label>
              <Input
                id="title"
                placeholder={uiLabels.titlePlaceholder}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">{uiLabels.descriptionLabel}</Label>
              <Textarea
                id="description"
                placeholder={uiLabels.descriptionPlaceholder}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="address">{uiLabels.addressLabel}</Label>
              <Input
                id="address"
                placeholder={uiLabels.addressPlaceholder}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="rent">{uiLabels.rentLabel}</Label>
              <Input
                id="rent"
                type="number"
                placeholder={uiLabels.rentPlaceholder}
                value={rent}
                onChange={(e) => setRent(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="images">{uiLabels.imagesLabel}</Label>
              <Input
                id="images"
                type="file"
                multiple
                onChange={handleImageChange}
              />
            </div>
            <div>
              <Label>{uiLabels.typeLabel}</Label>
              <Select onValueChange={setType} required>
                <SelectTrigger>
                  <SelectValue placeholder={uiLabels.typePlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  {uiLabels.types.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit">{uiLabels.submitButton}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 