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
import { Slider } from "@/components/ui/slider"
import { useSession } from "next-auth/react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useDebouncedCallback } from "use-debounce"
import { useSystem } from "@/context/SystemContext"

export function SearchSidebar() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { replace } = useRouter()
  const { config, system } = useSystem()

  const [rentRange, setRentRange] = useState<[number]>([5000])

  const handleSearch = useDebouncedCallback((term: string, field: string) => {
    const params = new URLSearchParams(searchParams)
    if (term) {
      params.set(field, term)
    } else {
      params.delete(field)
    }
    replace(`${pathname}?${params.toString()}`)
  }, 300)

  const handleTypeFilter = (type: string) => {
    const params = new URLSearchParams(searchParams)
    if (type && type !== "all") {
      params.set("type", type)
    } else {
      params.delete("type")
    }
    replace(`${pathname}?${params.toString()}`)
  }

  const handleRentChange = useDebouncedCallback((value: [number]) => {
    const params = new URLSearchParams(searchParams);
    params.set('maxRent', value[0].toString());
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  useEffect(() => {
    const maxRent = searchParams.get("maxRent")
    if (maxRent) {
      setRentRange([parseInt(maxRent, 10)])
    } else {
      setRentRange([5000])
    }
  }, [searchParams])

  const handlePublishClick = () => {
    if (status === "authenticated") {
      router.push(`/${system}/new`)
    } else {
      router.push("/login")
    }
  }

  const getSearchParam = (param: string, fallback: string = "") =>
    searchParams.get(param) || fallback

  return (
    <Card>
      <CardHeader>
        <CardTitle>发布与查询</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Button onClick={handlePublishClick} className="w-full">
            发布新{config.entity}
          </Button>
          {status !== "authenticated" && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              发布{config.entity}请先登录
            </p>
          )}
        </div>

        <div className="space-y-4 pt-6 border-t">
          <h3 className="text-lg font-semibold">查询{config.entities}</h3>
          {Object.entries(config.fields).map(([key, label]) => (
            <div className="space-y-2" key={key}>
              <Label htmlFor={`search-${key}`}>{label}</Label>
              <Input
                id={`search-${key}`}
                placeholder={`搜索${label}...`}
                onChange={(e) => handleSearch(e.target.value, key)}
                defaultValue={getSearchParam(key)}
              />
            </div>
          ))}
          <div className="space-y-2">
            <Label htmlFor="search-type">房屋类型</Label>
            <Select
              onValueChange={handleTypeFilter}
              defaultValue={getSearchParam("type", "all")}
            >
              <SelectTrigger id="search-type">
                <SelectValue placeholder="筛选类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有类型</SelectItem>
                <SelectItem value="Apartment">公寓</SelectItem>
                <SelectItem value="House">独栋</SelectItem>
                <SelectItem value="Room">单间</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="rent-slider">最高租金: ${rentRange[0]}</Label>
            <Slider
              id="rent-slider"
              max={5000}
              step={100}
              value={rentRange}
              onValueChange={(value) => {
                setRentRange(value as [number]);
                handleRentChange(value as [number]);
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 