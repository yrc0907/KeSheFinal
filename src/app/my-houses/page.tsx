"use client"

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface House {
  id: string
  title: string
  address: string
  rent: number
  type: string
}

export default function MyHousesPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [houses, setHouses] = useState<House[]>([])

  useEffect(() => {
    const fetchHouses = async () => {
      if (session) {
        const response = await fetch("/api/my-houses")
        if (response.ok) {
          const data = await response.json()
          setHouses(data)
        }
      }
    }
    fetchHouses()
  }, [session])

  const deleteHouse = async (id: string) => {
    const response = await fetch(`/api/houses/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      setHouses(houses.filter((house) => house.id !== id));
    } else {
      console.error("Failed to delete house");
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Houses</h1>
        <Button onClick={() => router.push("/houses/new")}>
          Add New House
        </Button>
      </div>
      <Table>
        <TableCaption>A list of your published houses.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Rent</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {houses.map((house) => (
            <TableRow key={house.id}>
              <TableCell className="font-medium">{house.title}</TableCell>
              <TableCell>{house.type}</TableCell>
              <TableCell>{house.address}</TableCell>
              <TableCell>${house.rent}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button variant="outline" size="sm" onClick={() => router.push(`/houses/edit/${house.id}`)}>Edit</Button>
                <Button variant="destructive" size="sm" onClick={() => deleteHouse(house.id)}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 