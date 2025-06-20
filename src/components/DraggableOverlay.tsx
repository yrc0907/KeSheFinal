"use client"

import { useDraggable } from "@dnd-kit/core"
import { PageElement } from "@/context/PageEditorContext"
import { CSS } from "@dnd-kit/utilities"

interface DraggableOverlayProps {
  element: PageElement
}

export function DraggableOverlay({ element }: DraggableOverlayProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: element.id,
  })

  const style = {
    position: "absolute" as const,
    left: `${element.x}px`,
    top: `${element.y}px`,
    width: `${element.width}px`,
    height: `${element.height}px`,
    border: "2px dashed #3b82f6", // blue-500
    pointerEvents: "auto" as const,
    transform: CSS.Translate.toString(transform),
    transition: "transform 0s", // prevent lagging transition effect
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="flex items-center justify-center bg-blue-500 bg-opacity-10"
    >
      <span className="bg-blue-500 text-white text-xs font-bold p-1 rounded">
        {element.label}
      </span>
    </div>
  )
} 