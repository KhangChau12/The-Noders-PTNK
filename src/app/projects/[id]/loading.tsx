import { Card, CardContent, CardHeader } from '@/components/Card'

export default function ProjectDetailLoading() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        {/* Back Navigation Skeleton */}
        <div className="mb-8">
          <div className="h-4 bg-dark-border rounded w-32 animate-pulse" />
        </div>

        {/* Header Skeleton */}
        <div className="mb-12">
          <div className="flex items-start justify-between gap-6 mb-6">
            <div className="flex-1">
              <div className="h-12 bg-dark-border rounded-lg w-3/4 mb-4 animate-pulse" />
              <div className="h-6 bg-dark-border rounded w-full mb-2 animate-pulse" />
              <div className="h-6 bg-dark-border rounded w-2/3 animate-pulse" />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="h-10 bg-dark-border rounded w-32 animate-pulse" />
            <div className="h-10 bg-dark-border rounded w-32 animate-pulse" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Skeleton */}
          <div className="lg:col-span-2 space-y-8">
            {/* Video/Image Skeleton */}
            <div className="aspect-video bg-dark-border rounded-lg animate-pulse" />

            {/* Content Cards Skeleton */}
            <Card>
              <CardHeader>
                <div className="h-6 bg-dark-border rounded w-48 animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-6 bg-dark-border rounded-full w-16 animate-pulse" />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="h-6 bg-dark-border rounded w-40 animate-pulse" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="h-4 bg-dark-border rounded w-full animate-pulse" />
                  <div className="h-4 bg-dark-border rounded w-full animate-pulse" />
                  <div className="h-4 bg-dark-border rounded w-3/4 animate-pulse" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Skeleton */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="h-6 bg-dark-border rounded w-36 animate-pulse" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-dark-border rounded animate-pulse" />
                    <div className="flex-1">
                      <div className="h-4 bg-dark-border rounded w-20 mb-1 animate-pulse" />
                      <div className="h-4 bg-dark-border rounded w-16 animate-pulse" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="h-6 bg-dark-border rounded w-32 animate-pulse" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-dark-border rounded-full animate-pulse" />
                    <div className="flex-1">
                      <div className="h-4 bg-dark-border rounded w-full mb-1 animate-pulse" />
                      <div className="h-3 bg-dark-border rounded w-2/3 animate-pulse" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}