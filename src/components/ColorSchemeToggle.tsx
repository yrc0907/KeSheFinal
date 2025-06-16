"use client"

import * as React from "react"
import { Palette, Check } from "lucide-react"
import { useColorScheme } from "@/context/ColorSchemeContext"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ColorSchemeToggle() {
  const { colorScheme, setColorScheme, schemeNames } = useColorScheme()

  // 定义颜色预览样式
  const colorPreviews = {
    default: "bg-primary",
    blue: "bg-blue-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
    orange: "bg-orange-500"
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Palette className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">选择颜色主题</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {(Object.keys(schemeNames) as Array<keyof typeof schemeNames>).map((scheme) => (
          <DropdownMenuItem
            key={scheme}
            onClick={() => setColorScheme(scheme)}
            className="flex items-center justify-between"
          >
            <div className="flex items-center">
              <div className={`mr-2 h-4 w-4 rounded-full ${colorPreviews[scheme]}`} />
              <span>{schemeNames[scheme]}</span>
            </div>
            {colorScheme === scheme && (
              <Check className="ml-2 h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 