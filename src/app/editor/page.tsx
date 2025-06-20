"use client"

import { useSearchParams } from "next/navigation"
import { Suspense, useRef, useEffect, useState } from "react"
import { PageEditorProvider, usePageEditor } from "@/context/PageEditorContext"
import { Button } from "@/components/ui/button"
import { Save, Code, Layout } from "lucide-react"
import { EditorOverlay } from "@/components/EditorOverlay"

function Editor() {
  const searchParams = useSearchParams()
  const pageUrl = searchParams.get("page")
  const {
    saveLayout,
    pageLayouts,
    currentPageId,
    setCurrentPageId,
    isEditMode,
    toggleEditMode,
    detectPageElements,
    applyLayout
  } = usePageEditor()
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const [isDetecting, setIsDetecting] = useState(false)

  // Set the current page ID when the component mounts
  useEffect(() => {
    if (pageUrl) {
      setCurrentPageId(pageUrl)
    }
  }, [pageUrl, setCurrentPageId])

  // Handle iframe load event
  const handleIframeLoad = () => {
    setIframeLoaded(true)

    // Access iframe document
    if (iframeRef.current?.contentDocument) {
      const iframeDoc = iframeRef.current.contentDocument

      // Detect elements in the iframe if needed
      if (!isDetecting && pageUrl && !pageLayouts[pageUrl]) {
        setIsDetecting(true)
        detectPageElements(iframeDoc)
        setIsDetecting(false)
      }

      // Apply existing layout if available
      if (pageUrl && pageLayouts[pageUrl]) {
        applyLayout(pageUrl, iframeDoc)
      }
    }
  }

  const handleSave = () => {
    if (currentPageId && pageLayouts[currentPageId]) {
      // Save to iframe document if it's loaded
      if (iframeRef.current?.contentDocument) {
        applyLayout(currentPageId, iframeRef.current.contentDocument, true)
      }

      // Persist to localStorage
      try {
        localStorage.setItem("pageLayouts", JSON.stringify(pageLayouts));
        alert("Layout saved successfully!");
      } catch (e) {
        console.error("Failed to save page layout:", e);
        alert("Failed to save layout.");
      }
    }
  };

  if (!pageUrl) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            No Page Specified
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Please go back and select a page to edit.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen font-sans">
      <header className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 p-3 flex items-center justify-between z-10 shadow-sm">
        <h1 className="text-lg font-bold">Low-Code Editor</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
            Editing:{" "}
            <strong className="font-semibold text-blue-600 dark:text-blue-400">
              {pageUrl}
            </strong>
          </div>
          <Button
            onClick={toggleEditMode}
            size="sm"
            variant={isEditMode ? "default" : "outline"}
            className="flex items-center gap-2"
          >
            {isEditMode ? (
              <>
                <Layout className="h-4 w-4" />
                <span>Exit Edit Mode</span>
              </>
            ) : (
              <>
                <Code className="h-4 w-4" />
                <span>Edit Layout</span>
              </>
            )}
          </Button>
          {isEditMode && (
            <Button onClick={handleSave} size="sm" className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save Layout
            </Button>
          )}
        </div>
      </header>
      <div className="flex-1 relative bg-gray-200 dark:bg-gray-900 overflow-hidden">
        {pageUrl ? (
          <>
            {!iframeLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 bg-opacity-80 z-10">
                <div className="text-center p-6 rounded-lg">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-800 dark:text-gray-200 font-medium">
                    Loading page content...
                  </p>
                </div>
              </div>
            )}
            <iframe
              ref={iframeRef}
              src={pageUrl}
              className="w-full h-full border-0"
              onLoad={handleIframeLoad}
              // Allow script execution and same-origin policies to ensure context preservation
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
            />
            {isEditMode && iframeLoaded && (
              <EditorOverlay iframeRef={iframeRef} />
            )}
            {!isEditMode && iframeLoaded && (
              <div className="pointer-events-none absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium">
                Page loaded with all functionality preserved
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                No Page URL Provided
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Please specify a page URL to edit.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


export default function EditorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          Loading Editor...
        </div>
      }
    >
      <PageEditorProvider>
        <Editor />
      </PageEditorProvider>
    </Suspense>
  )
} 