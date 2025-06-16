"use client"

import * as React from "react"

import {
  useTheme
}

  from "next-themes"

import {
  useColorScheme
}

  from "@/context/ColorSchemeContext"

import {
  Moon,
  Sun,
  Laptop,
  Check
}

  from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
}

  from "@/components/ui/card"

import {
  Button
}

  from "@/components/ui/button"

import {
  RadioGroup,
  RadioGroupItem
}

  from "@/components/ui/radio-group"

import {
  Label
}

  from "@/components/ui/label"

export function ThemePanel() {
  const {
    theme,
    setTheme
  }

    = useTheme()
  const {
    colorScheme,
    setColorScheme,
    schemeNames
  }

    = useColorScheme()
  return (<Card className="w-full"> <CardHeader> <CardTitle>个性化主题设置</CardTitle> <CardDescription>选择您喜欢的明暗模式和颜色主题</CardDescription> </CardHeader> <CardContent className="space-y-6"> <div> <h3 className="text-lg font-medium mb-3">明暗模式</h3> <div className="flex flex-wrap gap-3"> <Button onClick={
    () => setTheme("light")
  }

    variant={
      theme === "light" ? "default" : "outline"
    }

    className="flex gap-2"

  > <Sun className="h-4 w-4" /> <span>浅色</span> </Button> <Button onClick={
    () => setTheme("dark")
  }

    variant={
      theme === "dark" ? "default" : "outline"
    }

    className="flex gap-2"

  > <Moon className="h-4 w-4" /> <span>深色</span> </Button> <Button onClick={
    () => setTheme("system")
  }

    variant={
      theme === "system" ? "default" : "outline"
    }

    className="flex gap-2"

  > <Laptop className="h-4 w-4" /> <span>系统</span> </Button> </div> </div> <div> <h3 className="text-lg font-medium mb-3">颜色主题</h3> <RadioGroup value={
    colorScheme
  }

    onValueChange={
      (value) => setColorScheme(value as any)
    }

    className="grid grid-cols-2 md:grid-cols-5 gap-4"

  > {
      (Object.keys(schemeNames) as Array<keyof typeof schemeNames>).map((scheme) => {

        // 定义颜色预览样式
        const colorPreviews = {
          default: "bg-primary",
          blue: "bg-blue-500",
          green: "bg-green-500",
          purple: "bg-purple-500",
          orange: "bg-orange-500"
        }

        return (<div key={
          scheme
        }

          className="flex items-center space-x-2"> <RadioGroupItem value={
            scheme
          }

            id={
              `scheme-$ {
                scheme
              }

              `
            }

          /> <Label htmlFor={
            `scheme-$ {
                scheme
              }

              `
          }

            className="flex items-center gap-2 cursor-pointer"

          > <div className={
            `h-4 w-4 rounded-full $ {
                colorPreviews[scheme]
              }

              `
          }

            /> {
              schemeNames[scheme]
            }

          </Label> </div>)
      }

      )
    }

  </RadioGroup> </div> </CardContent> </Card>)
}