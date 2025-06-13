"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"

export default function SettingsPage() {
  const router = useRouter()
  const { data: session, status, update } = useSession()

  const [name, setName] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false)
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
    if (session?.user?.name) {
      setName(session.user.name)
    }
  }, [session, status, router])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingProfile(true)
    const response = await fetch("/api/user/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })
    if (response.ok) {
      await update({ name })
      toast.success("用户名修改成功！")
    } else {
      toast.error("用户名修改失败。")
    }
    setIsSubmittingProfile(false)
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingPassword(true)
    const response = await fetch("/api/user/password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    })
    if (response.ok) {
      toast.success("密码修改成功！请重新登录。")
      setCurrentPassword("")
      setNewPassword("")
      await signOut({ callbackUrl: "/login" })
    } else {
      const data = await response.json()
      toast.error(data.error || "密码修改失败。")
    }
    setIsSubmittingPassword(false)
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingAvatar(true)
    const formData = new FormData()
    formData.append("avatar", file)

    const response = await fetch("/api/user/avatar", {
      method: "POST",
      body: formData,
    })

    if (response.ok) {
      const data = await response.json()
      // This update() call is crucial for live UI refresh
      await update({ image: data.filePath })
      toast.success("头像上传成功！")
    } else {
      toast.error("头像上传失败。")
    }
    setIsUploadingAvatar(false)
  }

  if (status === "loading" || !session) {
    return (
      <div className="container mx-auto py-10 text-center">
        <p>加载中...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10 max-w-4xl space-y-8">
      <h1 className="text-3xl font-bold">设置</h1>

      {/* Avatar Card */}
      <Card>
        <CardHeader>
          <CardTitle>头像</CardTitle>
          <CardDescription>点击头像以上传新图片</CardDescription>
        </CardHeader>
        <CardContent>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarUpload}
            className="hidden"
            accept="image/png, image/jpeg, image/gif"
            aria-label="Upload new avatar"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingAvatar}
            className="rounded-full"
            aria-label="Upload new avatar"
          >
            <Avatar className="h-24 w-24">
              <AvatarImage src={session.user.image || undefined} />
              <AvatarFallback>
                {session.user.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </button>
          {isUploadingAvatar && <p className="text-sm mt-2">上传中...</p>}
        </CardContent>
      </Card>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>个人信息</CardTitle>
          <CardDescription>修改您的公开显示名称</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">用户名</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={isSubmittingProfile}>
              {isSubmittingProfile ? "保存中..." : "保存修改"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Password Card */}
      <Card>
        <CardHeader>
          <CardTitle>密码</CardTitle>
          <CardDescription>修改您的登录密码</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">当前密码</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">新密码</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={isSubmittingPassword}>
              {isSubmittingPassword ? "保存中..." : "修改密码"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 