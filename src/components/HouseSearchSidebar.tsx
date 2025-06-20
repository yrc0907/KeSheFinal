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

export function HouseSearchSidebar() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { replace } = useRouter()
  const { system } = useSystem()

  const [rentRange, setRentRange] = useState<[number]>([5000])

  // System-specific UI labels
  const uiLabels = {
    rental: {
      title: "发布与查询",
      publishBtn: "发布新房源",
      loginNotice: "发布房源请先登录",
      searchTitle: "查询房源",
      addressLabel: "街道地址",
      addressPlaceholder: "搜索街道...",
      typeLabel: "房屋类型",
      typePlaceholder: "筛选类型",
      allTypesLabel: "所有类型",
      types: [
        { value: "Apartment", label: "公寓" },
        { value: "House", label: "独栋" },
        { value: "Room", label: "单间" }
      ],
      rentLabel: "最高租金",
      rentSymbol: "$"
    },
    book: {
      title: "添加与查询",
      publishBtn: "添加新图书",
      loginNotice: "添加图书请先登录",
      searchTitle: "查询图书",
      addressLabel: "馆藏位置",
      addressPlaceholder: "搜索位置...",
      typeLabel: "图书类型",
      typePlaceholder: "筛选类型",
      allTypesLabel: "所有类型",
      types: [
        { value: "Fiction", label: "小说" },
        { value: "NonFiction", label: "非小说" },
        { value: "Reference", label: "参考资料" }
      ],
      rentLabel: "最高借阅费",
      rentSymbol: "¥"
    },
    teacher: {
      title: "登记与查询",
      publishBtn: "登记新教师",
      loginNotice: "登记教师请先登录",
      searchTitle: "查询教师",
      addressLabel: "办公地点",
      addressPlaceholder: "搜索办公室...",
      typeLabel: "教师类型",
      typePlaceholder: "筛选类型",
      allTypesLabel: "所有类型",
      types: [
        { value: "Professor", label: "教授" },
        { value: "AssociateProfessor", label: "副教授" },
        { value: "Lecturer", label: "讲师" }
      ],
      rentLabel: "最高课时费",
      rentSymbol: "¥"
    }
  }[system || "rental"]

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams)
    if (term) {
      params.set("query", term)
    } else {
      params.delete("query")
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
      router.push("/houses/new")
    } else {
      router.push("/login")
    }
  }

  const getSearchParam = (param: string, fallback: string = "") =>
    searchParams.get(param) || fallback

  return (
    <Card>
      <CardHeader>
        <CardTitle>{uiLabels.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Button onClick={handlePublishClick} className="w-full">
            {uiLabels.publishBtn}
          </Button>
          {status !== "authenticated" && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {uiLabels.loginNotice}
            </p>
          )}
        </div>

        <div className="space-y-4 pt-6 border-t">
          <h3 className="text-lg font-semibold">{uiLabels.searchTitle}</h3>
          <div className="space-y-2">
            <Label htmlFor="search-street">{uiLabels.addressLabel}</Label>
            <Input
              id="search-street"
              placeholder={uiLabels.addressPlaceholder}
              onChange={(e) => handleSearch(e.target.value)}
              defaultValue={getSearchParam("query")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="search-type">{uiLabels.typeLabel}</Label>
            <Select
              onValueChange={handleTypeFilter}
              defaultValue={getSearchParam("type", "all")}
            >
              <SelectTrigger id="search-type">
                <SelectValue placeholder={uiLabels.typePlaceholder} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{uiLabels.allTypesLabel}</SelectItem>
                {uiLabels.types.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="rent-slider">{uiLabels.rentLabel}: {uiLabels.rentSymbol}{rentRange[0]}</Label>
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