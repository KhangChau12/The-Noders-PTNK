export default function Loading() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-6 w-40 rounded bg-dark-border" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="h-[420px] rounded-2xl bg-dark-surface border border-dark-border" />
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 rounded-2xl bg-dark-surface border border-dark-border" />
              <div className="h-56 rounded-2xl bg-dark-surface border border-dark-border" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
