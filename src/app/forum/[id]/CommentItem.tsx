"use client"

import { useState, useTransition } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { RootComment, CommentWithAuthor } from "@/types"
import { CommentForm } from "./CommentForm"
import { getReplies } from "./actions"
import Lightbox from "yet-another-react-lightbox"
import "yet-another-react-lightbox/styles.css"

interface CommentItemProps {
  comment: RootComment
  postId: string
}

function Reply({ reply }: { reply: CommentWithAuthor }) {
  const [lightboxOpen, setLightboxOpen] = useState(false)

  return (
    <div className="flex gap-4">
      <Avatar className="w-8 h-8">
        <AvatarImage src={reply.author.image || undefined} />
        <AvatarFallback>
          {reply.author.name?.charAt(0).toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-2 text-sm">
          <p className="font-semibold">{reply.author.name}</p>
          {reply.parent && reply.parent.author && (
            <>
              <span className="text-muted-foreground">回复</span>
              <p className="font-semibold">{reply.parent.author.name}</p>
            </>
          )}
          <p className="text-xs text-muted-foreground ml-auto">
            {new Date(reply.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="mt-1 space-y-2">
          <p className="whitespace-pre-wrap text-sm">{reply.text}</p>
          {reply.image && (
            <>
              <button onClick={() => setLightboxOpen(true)} className="mt-2" aria-label="View image in lightbox">
                <Image src={reply.image} alt="Reply image" width={150} height={150} className="rounded-md object-cover" />
              </button>
              <Lightbox open={lightboxOpen} close={() => setLightboxOpen(false)} slides={[{ src: reply.image }]} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}


export function CommentItem({ comment, postId }: CommentItemProps) {
  const { data: session } = useSession()
  const [isReplying, setIsReplying] = useState(false)
  const [showReplies, setShowReplies] = useState(false)
  const [replies, setReplies] = useState<CommentWithAuthor[]>([])
  const [isPending, startTransition] = useTransition()
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const handleToggleReplies = () => {
    if (!showReplies && comment._count.replies > 0) {
      startTransition(async () => {
        const fetchedReplies = await getReplies(comment.id)
        setReplies(fetchedReplies)
        setShowReplies(true)
      })
    } else {
      setShowReplies(!showReplies)
    }
  }

  const hasReplies = comment._count.replies > 0;

  return (
    <div className="flex gap-4">
      <Avatar>
        <AvatarImage src={comment.author.image || undefined} />
        <AvatarFallback>
          {comment.author.name?.charAt(0).toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-semibold">{comment.author.name}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(comment.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="mt-2 space-y-2">
          <p className="whitespace-pre-wrap">{comment.text}</p>
          {comment.image && (
            <>
              <button onClick={() => setLightboxOpen(true)} className="mt-2" aria-label="View image in lightbox">
                <Image src={comment.image} alt="Comment image" width={200} height={200} className="rounded-md object-cover" />
              </button>
              <Lightbox open={lightboxOpen} close={() => setLightboxOpen(false)} slides={[{ src: comment.image }]} />
            </>
          )}
        </div>

        <div className="mt-2 flex items-center gap-4">
          {session && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsReplying(!isReplying)}
            >
              回复
            </Button>
          )}
          {hasReplies && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleReplies}
              disabled={isPending}
            >
              {isPending ? "加载中..." : (showReplies ? "收起回复" : `查看 ${comment._count.replies} 条回复`)}
            </Button>
          )}
        </div>

        {isReplying && (
          <div className="mt-4">
            <CommentForm
              postId={postId}
              parentId={comment.id}
              onCommentCreated={() => setIsReplying(false)}
              autoFocus={true}
            />
          </div>
        )}

        {showReplies && replies.length > 0 && (
          <div className="mt-4 space-y-4 border-l-2 pl-4">
            {replies.map(reply => (
              <Reply key={reply.id} reply={reply} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 