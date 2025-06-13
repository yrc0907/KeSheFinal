import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import Image from "next/image"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { deletePost } from "./actions"
import { Separator } from "@/components/ui/separator"
import { CommentSection } from "./CommentSection"
import { LikeButton } from "./LikeButton"

export const dynamic = 'force-dynamic'

interface PostPageProps {
  params: {
    id: string
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const session = await getServerSession(authOptions)
  const post = await prisma.post.findUnique({
    where: {
      id: params.id,
    },
    include: {
      author: true,
      images: true,
      comments: {
        include: {
          author: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
      likes: {
        where: {
          userId: session?.user?.id || "",
        },
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      }
    },
  })

  if (!post) {
    notFound()
  }

  const isAuthor = session?.user?.id === post.authorId

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl font-bold">{post.title}</CardTitle>
              <CardDescription>
                由 {post.author.name} 发布于{" "}
                {new Date(post.createdAt).toLocaleString()}
              </CardDescription>
            </div>
            {isAuthor && (
              <div className="flex gap-2">
                <Button asChild variant="outline">
                  <Link href={`/forum/${post.id}/edit`}>修改</Link>
                </Button>
                <form action={deletePost.bind(null, post.id)}>
                  <Button type="submit" variant="destructive">
                    删除
                  </Button>
                </form>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {post.images && post.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {post.images.map(image => (
                <div key={image.id} className="relative aspect-square">
                  <Image
                    src={image.url}
                    alt={`Image for post: ${post.title}`}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
              ))}
            </div>
          )}
          <p className="text-lg whitespace-pre-wrap">{post.content}</p>
        </CardContent>
        <CardFooter>
          <LikeButton
            postId={post.id}
            initialLikes={post._count.likes}
            isInitiallyLiked={post.likes.length > 0}
          />
        </CardFooter>
      </Card>

      <Separator />

      <CommentSection postId={post.id} initialComments={post.comments} />
    </div>
  )
} 