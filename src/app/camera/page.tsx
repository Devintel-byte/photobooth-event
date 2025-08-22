import { Suspense } from "react"
import { CameraContent } from "./CameraContent"

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-500">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
    </div>
  )
}

export default function CameraPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <CameraContent />
    </Suspense>
  )
}