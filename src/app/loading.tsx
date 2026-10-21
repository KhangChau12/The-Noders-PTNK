import { LoadBar } from '@/components/Loading'

export default function LoadingPage() {
  return (
    <div aria-busy="true" className="min-h-[60vh]">
      <LoadBar />
      <span className="sr-only" role="status">Loading</span>
    </div>
  )
}
