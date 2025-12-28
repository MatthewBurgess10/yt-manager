import { Suspense } from "react"
import SaveContent from "./save-content"

export default function SavePage() {
  return (
    <Suspense fallback={null}>
      <SaveContent />
    </Suspense>
  )
}
