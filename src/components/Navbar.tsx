"use client"
/*eslint-disable*/
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "./ThemeToggle"
import { useRouter } from "next/navigation"
import { useSystem } from "@/context/SystemContext"

export default function Navbar() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { system, systemName } = useSystem()
  
  // System-specific navigation items
  const navItems = {
    rental: [
      { name: "房源", href: "/houses" },
      { name: "论坛", href: "/forum" },
    ],
    book: [
      { name: "图书", href: "/houses" }, // Reusing houses route for books
      { name: "读者论坛", href: "/forum" },
    ],
    teacher: [
      { name: "教师", href: "/houses" }, // Reusing houses route for teachers
      { name: "教师论坛", href: "/forum" },
    ],
  }[system]
  
  // System-specific dropdown items
  const dropdownItems = {
    rental: [
      { name: "仪表盘", href: "/dashboard" },
      { name: "我的房源", href: "/my-houses" },
      { name: "我的帖子", href: "/my-posts" },
    ],
    book: [
      { name: "仪表盘", href: "/dashboard" },
      { name: "我的图书", href: "/my-houses" }, // Reusing my-houses route
      { name: "我的评论", href: "/my-posts" }, // Reusing my-posts route
    ],
    teacher: [
      { name: "仪表盘", href: "/dashboard" },
      { name: "我的课程", href: "/my-houses" }, // Reusing my-houses route
      { name: "我的评价", href: "/my-posts" }, // Reusing my-posts route
    ],
  }[system]

  return (
    <nav className="bg-background shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="font-bold text-lg">
              {systemName || "管理系统"}
            </Link>
            <div className="hidden md:flex items-baseline space-x-4">
              {navItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {status === "loading" ? (
              <div className="h-8 w-20 bg-muted rounded-md animate-pulse"></div>
            ) : session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session.user.image || undefined} alt={session.user.name || "User"} />
                      <AvatarFallback>
                        {session.user.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{session.user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session.user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {dropdownItems.map((item, index) => (
                    <DropdownMenuItem key={index} onClick={() => router.push(item.href)}>
                      {item.name}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuItem>
                    <Link href="/settings" className="w-full">
                      设置
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    登出
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => router.push("/login")}>登录/注册</Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
} 