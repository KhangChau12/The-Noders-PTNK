import { cn } from '@/lib/utils'
import { CONTAINER_CLASS } from '@/components/editorial'

/**
 * Loading, the house way: never a spinner over a blank page. A thin bar runs
 * under the header and the page's own shape appears straight away.
 */
interface LoadingProps {
  className?: string
  text?: string
  size?: 'sm' | 'md' | 'lg'
}

/** Page-level: thin progress bar + a generic skeleton. */
export function Loading({ className, text = 'Loading' }: LoadingProps) {
  return (
    <div aria-busy="true" className={cn('min-h-[60vh]', className)}>
      <LoadBar />
      <span className="sr-only" role="status">{text}</span>
      <DetailSkeleton />
    </div>
  )
}

export function LoadBar() {
  return (
    <div aria-hidden="true" className="relative h-0.5 overflow-hidden bg-rule">
      <span className="absolute inset-y-0 left-0 w-1/3 animate-[loadbar_1.2s_ease-in-out_infinite] bg-link" />
    </div>
  )
}

/** Small inline spinner for buttons and rows. */
export function Spinner({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn('inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent opacity-70', className)} />
}

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-pulse rounded-lg bg-paper', className)} {...props} />
}

/** Navy intro + body, the shape of every detail page. */
export function DetailSkeleton() {
  return (
    <>
      <section className="bg-navy">
        <div className={cn(CONTAINER_CLASS, 'flex flex-wrap items-center gap-x-14 gap-y-8 pb-12 pt-10')}>
          <div className="flex min-w-0 flex-[1_1_480px] flex-col gap-3.5">
            <span className="h-3.5 w-36 animate-pulse rounded bg-white/15" />
            <span className="h-11 w-4/5 animate-pulse rounded-lg bg-white/20" />
            <span className="h-[18px] w-11/12 animate-pulse rounded bg-white/10" />
            <span className="h-[18px] w-3/5 animate-pulse rounded bg-white/10" />
          </div>
          <span className="aspect-[16/10] min-w-0 flex-[1_1_480px] animate-pulse rounded-xl bg-white/10" />
        </div>
      </section>
      <div className={cn(CONTAINER_CLASS, 'flex flex-wrap gap-x-14 gap-y-10 pb-16 pt-12')}>
        <div className="flex min-w-0 flex-[1_1_640px] flex-col gap-3">
          <Skeleton className="h-[26px] w-56" />
          <Skeleton className="h-4" />
          <Skeleton className="h-4" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="mt-4 h-[26px] w-44" />
          <Skeleton className="h-4" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="flex min-w-0 flex-[0_1_380px] flex-col gap-3">
          <Skeleton className="aspect-video" />
          <Skeleton className="h-28" />
        </div>
      </div>
    </>
  )
}
