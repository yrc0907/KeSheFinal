import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { PostImageGrid } from "./PostImageGrid"
import { MessageSquare, ThumbsUp } from "lucide-react"

export default async function ForumPage() {
  const posts = await prisma.post.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      author: true,
      images: true,
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
  })

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">论坛</h1>
        <Button asChild>
          <Link href="/forum/new-post">发布新帖</Link>
        </Button>
      </div>

      <div className="space-y-4">
        {posts.length === 0 ? (
          <p>还没有帖子，快来发布第一篇吧！</p>
        ) : (
          posts.map((post) => (
            <Card key={post.id} className="flex flex-col">
              <Link href={`/forum/${post.id}`} className="flex-grow">
                <CardHeader>
                  <CardTitle className="hover:underline">{post.title}</CardTitle>
                  <CardDescription>
                    由 {post.author.name} 发布于{" "}
                    {new Date(post.createdAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-3 mb-4">{post.content}</p>
                  {post.images && post.images.length > 0 && (
                    <PostImageGrid images={post.images} postTitle={post.title} />
                  )}
                </CardContent>
              </Link>
              <CardFooter className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <ThumbsUp className="h-4 w-4" />
                  <span>{post._count.likes}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{post._count.comments}</span>
                </div>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  )
} 