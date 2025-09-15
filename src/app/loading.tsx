import { Loading } from '@/components/Loading'

export default function LoadingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loading />
        <p className="text-text-secondary mt-4">Loading AI Agent Club...</p>
      </div>
    </div>
  )
}