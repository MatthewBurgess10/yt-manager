import { Suspense } from "react"
import ResultsContent from "./results-content"

export default function ResultsPage() {
  return (
    <Suspense fallback={null}>
      <ResultsContent />
    </Suspense>
  )
}
