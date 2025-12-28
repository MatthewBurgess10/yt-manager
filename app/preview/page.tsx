import { Suspense } from "react"
import PreviewContent from "./preview-content"

export default function PreviewPage() {
  return (
    <Suspense fallback={null}>
      <PreviewContent />
    </Suspense>
  )
}
