"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { RootComment, CommentWithAuthor } from "@/types"
import { CommentForm } from "./CommentForm"
import Lightbox from "yet-another-react-lightbox"
import "yet-another-react-lightbox/styles.css"

interface CommentItemProps {
  comment: RootComment
  houseId: string
  onReplyPosted: (newReply: CommentWithAuthor, parentId: string) => void
}

export function CommentItem({
  comment,
  houseId,
  onReplyPosted,
}: CommentItemProps) {
  const { data: session } = useSession()
  const [isReplying, setIsReplying] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const handleReply = (newReply: CommentWithAuthor) => {
    onReplyPosted(newReply, comment.id)
    setIsReplying(false)
  }

  return (
    <div>
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
                <button
                  onClick={() => setLightboxOpen(true)}
                  className="mt-2"
                  aria-label="View image in lightbox"
                >
                  <Image
                    src={comment.image}
                    alt="Comment image"
                    width={200}
                    height={200}
                    className="rounded-md object-cover"
                  />
                </button>
                <Lightbox
                  open={lightboxOpen}
                  close={() => setLightboxOpen(false)}
                  slides={[{ src: comment.image }]}
                />
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
                {isReplying ? "取消" : "回复"}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="pl-14">
        {isReplying && (
          <div className="mt-4">
            <CommentForm
              houseId={houseId}
              parentId={comment.id}
              rootId={comment.rootId || comment.id}
              onCommentPosted={handleReply}
              onCancel={() => setIsReplying(false)}
              autoFocus={true}
            />
          </div>
        )}

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 space-y-4 border-l-2 pl-4">
            {comment.replies.map((reply) => (
              <div key={reply.id} className="flex gap-4">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={reply.author.image || undefined} />
                  <AvatarFallback>
                    {reply.author.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm">
                    <p className="font-semibold">{reply.author.name}</p>
                    <p className="text-xs text-muted-foreground ml-auto">
                      {new Date(reply.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-sm">
                    {reply.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 