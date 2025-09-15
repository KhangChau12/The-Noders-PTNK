import { Card, CardContent, CardHeader } from '@/components/Card'

export default function MemberProfileLoading() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        {/* Back Navigation Skeleton */}
        <div className="mb-8">
          <div className="h-4 bg-dark-border rounded w-32 animate-pulse" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Sidebar Skeleton */}
          <div className="space-y-6">
            <Card>
              <CardContent className="text-center p-8">
                {/* Avatar Skeleton */}
                <div className="w-32 h-32 bg-dark-border rounded-full mx-auto mb-6 animate-pulse" />

                {/* Name and Info Skeleton */}
                <div className="h-6 bg-dark-border rounded w-3/4 mx-auto mb-2 animate-pulse" />
                <div className="h-4 bg-dark-border rounded w-1/2 mx-auto mb-1 animate-pulse" />
                <div className="h-6 bg-dark-border rounded-full w-16 mx-auto mb-4 animate-pulse" />

                {/* Bio Skeleton */}
                <div className="space-y-2 mb-6">
                  <div className="h-3 bg-dark-border rounded w-full animate-pulse" />
                  <div className="h-3 bg-dark-border rounded w-3/4 mx-auto animate-pulse" />
                </div>

                {/* Stats Skeleton */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center">
                    <div className="h-6 bg-dark-border rounded w-8 mx-auto mb-1 animate-pulse" />
                    <div className="h-3 bg-dark-border rounded w-12 mx-auto animate-pulse" />
                  </div>
                  <div className="text-center">
                    <div className="h-6 bg-dark-border rounded w-8 mx-auto mb-1 animate-pulse" />
                    <div className="h-3 bg-dark-border rounded w-12 mx-auto animate-pulse" />
                  </div>
                </div>

                {/* Join Date Skeleton */}
                <div className="h-4 bg-dark-border rounded w-32 mx-auto mb-6 animate-pulse" />

                {/* Social Links Skeleton */}
                <div className="flex justify-center space-x-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-5 h-5 bg-dark-border rounded animate-pulse" />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Skills Skeleton */}
            <Card>
              <CardHeader>
                <div className="h-6 bg-dark-border rounded w-32 animate-pulse" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-6 bg-dark-border rounded-full w-16 animate-pulse" />
                      <div className="h-3 bg-dark-border rounded w-12 animate-pulse" />
                    </div>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, j) => (
                        <div key={j} className="w-4 h-4 bg-dark-border rounded animate-pulse" />
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Stats Skeleton */}
            <Card>
              <CardHeader>
                <div className="h-6 bg-dark-border rounded w-24 animate-pulse" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="h-4 bg-dark-border rounded w-24 animate-pulse" />
                    <div className="h-4 bg-dark-border rounded w-8 animate-pulse" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content Skeleton */}
          <div className="lg:col-span-2 space-y-8">
            {/* Project Portfolio Skeleton */}
            <Card>
              <CardHeader>
                <div className="h-6 bg-dark-border rounded w-40 animate-pulse" />
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Section Header Skeleton */}
                <div className="h-5 bg-dark-border rounded w-48 animate-pulse" />

                {/* Project Items Skeleton */}
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="p-4 rounded-lg bg-dark-surface">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="h-5 bg-dark-border rounded w-3/4 mb-2 animate-pulse" />
                          <div className="space-y-1 mb-2">
                            <div className="h-4 bg-dark-border rounded w-full animate-pulse" />
                            <div className="h-4 bg-dark-border rounded w-2/3 animate-pulse" />
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="h-3 bg-dark-border rounded w-20 animate-pulse" />
                            <div className="h-3 bg-dark-border rounded w-16 animate-pulse" />
                            <div className="h-5 bg-dark-border rounded-full w-12 animate-pulse" />
                          </div>
                        </div>
                        <div className="w-16 h-12 bg-dark-border rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Activity Timeline Skeleton */}
            <Card>
              <CardHeader>
                <div className="h-6 bg-dark-border rounded w-36 animate-pulse" />
              </CardHeader>
              <CardContent className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-10 h-10 bg-dark-border rounded-full animate-pulse" />
                    <div className="flex-1">
                      <div className="h-4 bg-dark-border rounded w-3/4 mb-1 animate-pulse" />
                      <div className="h-3 bg-dark-border rounded w-full mb-1 animate-pulse" />
                      <div className="h-3 bg-dark-border rounded w-24 animate-pulse" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Contact Section Skeleton */}
            <Card>
              <CardContent className="text-center p-8">
                <div className="h-6 bg-dark-border rounded w-32 mx-auto mb-4 animate-pulse" />
                <div className="h-4 bg-dark-border rounded w-3/4 mx-auto mb-6 animate-pulse" />
                <div className="flex gap-4 justify-center">
                  <div className="h-10 bg-dark-border rounded w-24 animate-pulse" />
                  <div className="h-10 bg-dark-border rounded w-24 animate-pulse" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}