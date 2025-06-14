import { getServerSession } from "next-auth"
import { notFound, redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PostEditForm } from "./PostEditForm"

export const dynamic = 'force-dynamic'

interface PostEditPageProps {
  params: {
    id: string
  }
}

export default async function PostEditPage({ params }: PostEditPageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect("/login")
  }

  const post = await prisma.post.findUnique({
    where: {
      id: params.id,
    },
    include: {
      images: true,
    },
  })

  if (!post) {
    notFound()
  }

  if (post.authorId !== session.user.id) {
    // Or show a "Forbidden" page
    redirect("/forum")
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">修改帖子</h1>
      <PostEditForm post={post} />
    </div>
  )
} 