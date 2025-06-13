import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { deletePost } from "../forum/[id]/actions" // Re-using the delete action

export const dynamic = 'force-dynamic'

export default async function MyPostsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/login")
  }

  const posts = await prisma.post.findMany({
    where: {
      authorId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">我的帖子</h1>
      <div className="space-y-4">
        {posts.length === 0 ? (
          <p>
            您还没有发布任何帖子。{" "}
            <Link href="/forum/new-post" className="text-blue-500 hover:underline">
              去发布第一篇
            </Link>
          </p>
        ) : (
          posts.map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <CardTitle>{post.title}</CardTitle>
                <CardDescription>
                  发布于 {new Date(post.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="truncate">{post.content.substring(0, 300)}...</p>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button asChild variant="outline">
                  <Link href={`/forum/${post.id}/edit`}>修改</Link>
                </Button>
                <form action={deletePost.bind(null, post.id)}>
                  <Button type="submit" variant="destructive">
                    删除
                  </Button>
                </form>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  )
} 