"use client"

import { useState } from "react"
import Image from "next/image"
import Lightbox from "yet-another-react-lightbox"
import "yet-another-react-lightbox/styles.css"

interface PostImage {
  id: string
  url: string
}

interface PostImageGridProps {
  images: PostImage[]
  postTitle: string
}

export function PostImageGrid({ images, postTitle }: PostImageGridProps) {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)

  const openLightbox = (imageIndex: number) => {
    setIndex(imageIndex)
    setOpen(true)
  }

  const slides = images.map(image => ({ src: image.url }))
  const visibleImages = images.slice(0, 8)

  return (
    <>
      <div className="grid grid-cols-4 gap-2">
        {visibleImages.map((image, idx) => (
          <button
            key={image.id}
            onClick={() => openLightbox(idx)}
            className="relative aspect-square focus:outline-none"
          >
            <Image
              src={image.url}
              alt={`Image ${idx + 1} for post ${postTitle}`}
              fill
              className="object-cover rounded-md"
            />
            {idx === 7 && images.length > 8 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-2xl font-bold">
                +{images.length - 8}
              </div>
            )}
          </button>
        ))}
      </div>

      <Lightbox
        open={open}
        close={() => setOpen(false)}
        slides={slides}
        index={index}
      />
    </>
  )
} 