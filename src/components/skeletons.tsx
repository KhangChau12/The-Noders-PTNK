import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { CONTAINER_CLASS } from '@/components/editorial'
import { LoadBar } from '@/components/Loading'

/**
 * One loading skeleton per page, each matching that page's first screen
 * (canvas row v13). Bars on the navy band are translucent white; bars on the
 * dark body are paper, so nothing changes colour when the real page arrives.
 */

type W = string | number
const px = (v: W) => (typeof v === 'number' ? `${v}px` : v)

/** Bar on the navy band */
function N({ w, h, r = 6, className }: { w: W; h: number; r?: number; className?: string }) {
  return <span className={cn('block max-w-full animate-pulse bg-white/[0.13] motion-reduce:animate-none', className)} style={{ width: px(w), height: h, borderRadius: r }} />
}
/** Bar on the dark body */
function B({ w, h, r = 6, className }: { w: W; h: number; r?: number; className?: string }) {
  return <span className={cn('block max-w-full animate-pulse bg-paper motion-reduce:animate-none', className)} style={{ width: px(w), height: h, borderRadius: r }} />
}
const Col = ({ gap, className, children }: { gap: number; className?: string; children: ReactNode }) => (
  <div className={cn('flex min-w-0 flex-col', className)} style={{ gap }}>{children}</div>
)
const Lines = ({ ws, h = 16, gap = 10, navy }: { ws: W[]; h?: number; gap?: number; navy?: boolean }) => (
  <Col gap={gap}>{ws.map((w, i) => (navy ? <N key={i} w={w} h={h} /> : <B key={i} w={w} h={h} />))}</Col>
)
const Card = ({ className, children }: { className?: string; children: ReactNode }) => <div className={cn('rounded-[14px] bg-paper/60 p-[22px]', className)}>{children}</div>

function Shell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div aria-busy="true" className="min-h-[70vh] w-full">
      <LoadBar />
      <span className="sr-only" role="status">{label}</span>
      {children}
    </div>
  )
}
const Navy = ({ className, children }: { className?: string; children: ReactNode }) => (
  <section className="bg-navy">
    <div className={cn(CONTAINER_CLASS, 'pb-14 pt-14', className)}>{children}</div>
  </section>
)
const Body = ({ className, children }: { className?: string; children: ReactNode }) => <div className={cn(CONTAINER_CLASS, 'pb-16 pt-14', className)}>{children}</div>
const Stats = ({ n }: { n: number }) => (
  <div className="mt-12 grid grid-cols-2 gap-y-6 border-t border-white/[0.22] pt-[22px] sm:grid-cols-3 lg:grid-cols-[repeat(var(--n),1fr)]" style={{ ['--n' as string]: n }}>
    {Array.from({ length: n }, (_, i) => (
      <Col key={i} gap={10}>
        <N w={64} h={28} />
        <N w={110} h={13} />
      </Col>
    ))}
  </div>
)
const Crumbs = () => <N w={180} h={13} className="mb-8" />

/** Shared intro of the list pages: eyebrow, two-line title, two lines, optional aside. */
function PageHero({ aside }: { aside?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end gap-x-16 gap-y-8">
      <Col gap={18} className="flex-[1_1_520px]">
        <N w={90} h={14} />
        <N w={560} h={44} r={8} />
        <N w={420} h={44} r={8} />
        <Lines navy ws={[520, 380]} />
      </Col>
      {aside && <div className="min-w-0 flex-[0_1_380px]">{aside}</div>}
    </div>
  )
}
const SearchAside = () => (
  <Col gap={8}>
    <N w={110} h={13} />
    <N w="100%" h={48} />
  </Col>
)
const StatusCard = () => (
  <div className="rounded-xl border border-white/25 p-6">
    <Col gap={12}>
      <N w={170} h={12} />
      <N w={260} h={20} />
      <N w={210} h={20} />
      <N w={190} h={14} className="mt-2" />
    </Col>
  </div>
)
const ThreeColumns = () => (
  <div className="mt-10 grid gap-10 md:grid-cols-3 md:gap-12">
    {Array.from({ length: 3 }, (_, i) => (
      <div key={i} className="border-t-2 border-rule pt-[22px]">
        <Col gap={12}>
          <B w={120} h={14} />
          <B w={230} h={22} />
          <Lines ws={['100%', '90%', '70%']} h={15} />
        </Col>
      </div>
    ))}
  </div>
)

/* ------------------------------------------------------------------ pages */

export function HomeSkeleton() {
  return (
    <Shell label="Loading">
      <Navy>
        <div className="flex flex-wrap items-center gap-x-16 gap-y-10">
          <Col gap={18} className="flex-[1_1_520px]">
            <N w={200} h={14} />
            <N w={560} h={52} r={8} />
            <N w={600} h={52} r={8} />
            <N w={500} h={52} r={8} />
            <Lines navy ws={[560, 540, 460]} h={17} gap={11} />
            <div className="mt-3 flex gap-3">
              <N w={230} h={50} r={8} />
              <N w={135} h={50} r={8} />
            </div>
          </Col>
          <div className="min-w-0 flex-[1_1_480px]">
            <N w="100%" h={340} r={12} />
            <N w="70%" h={15} className="mt-3.5" />
          </div>
        </div>
        <Stats n={5} />
      </Navy>
      <Body className="pt-20 sm:pt-28">
        <Col gap={14}>
          <B w={560} h={40} r={8} />
          <B w={320} h={40} r={8} />
        </Col>
        <ThreeColumns />
      </Body>
    </Shell>
  )
}

export function ProductsSkeleton() {
  return (
    <Shell label="Loading products">
      <Navy>
        <PageHero
          aside={
            <Col gap={18}>
              <div className="flex gap-7">
                {Array.from({ length: 4 }, (_, i) => (
                  <Col key={i} gap={6}>
                    <N w={28} h={26} />
                    <N w={64} h={12} />
                  </Col>
                ))}
              </div>
              <SearchAside />
            </Col>
          }
        />
      </Navy>
      <Body className="pt-16">
        <div className="grid items-center gap-x-12 gap-y-7 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <B w="100%" h={400} r={12} />
          <Col gap={14}>
            <B w={240} h={14} />
            <B w="90%" h={44} r={8} />
            <B w="70%" h={44} r={8} />
            <Lines ws={['100%', '95%', '70%']} h={17} />
            <div className="mt-3 flex gap-2.5">
              <B w={190} h={46} r={8} />
              <B w={120} h={46} r={8} />
            </div>
          </Col>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:gap-8">
          {Array.from({ length: 2 }, (_, i) => (
            <Card key={i} className="grid gap-5 p-[18px] sm:grid-cols-2">
              <B w="100%" h={160} r={8} />
              <Col gap={10}>
                <B w={120} h={12} />
                <B w="80%" h={22} />
                <Lines ws={['100%', '95%', '80%']} h={14} />
              </Col>
            </Card>
          ))}
        </div>
      </Body>
    </Shell>
  )
}

export function ProductSkeleton() {
  return (
    <Shell label="Loading product">
      <Navy className="pb-16 pt-11">
        <Crumbs />
        <div className="flex flex-wrap items-center gap-x-16 gap-y-12">
          <Col gap={16} className="flex-[1_1_420px]">
            <N w={150} h={14} />
            <N w={420} h={58} r={8} />
            <Lines navy ws={[470, 450, 460, 300]} h={18} gap={12} />
            <N w={230} h={48} r={8} className="mt-4" />
            <N w={360} h={14} />
          </Col>
          <div className="min-w-0 flex-[1_1_560px]">
            <N w="100%" h={390} r={12} />
          </div>
        </div>
      </Navy>
      <Body className="pt-20">
        <div className="flex flex-wrap items-start gap-x-16 gap-y-12">
          <Col gap={14} className="flex-[1_1_600px]">
            <B w={360} h={34} r={8} />
            <Lines ws={['100%', '96%', '60%']} h={17} gap={12} />
            <B w={240} h={24} className="mt-5" />
            <Lines ws={['95%', '90%', '93%', '85%', '70%']} h={17} gap={12} />
          </Col>
          <Col gap={22} className="flex-[0_1_380px]">
            <B w="100%" h={214} r={12} />
            <Card>
              <Col gap={14}>
                <B w={80} h={14} />
                <div className="flex items-center gap-3">
                  <B w={44} h={44} r={22} />
                  <Col gap={8}>
                    <B w={140} h={15} />
                    <B w={80} h={12} />
                  </Col>
                </div>
              </Col>
            </Card>
          </Col>
        </div>
      </Body>
    </Shell>
  )
}

export function PostsSkeleton() {
  return (
    <Shell label="Loading posts">
      <Navy>
        <PageHero aside={<SearchAside />} />
      </Navy>
      <Body className="pt-[72px]">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)]">
          <Col gap={14}>
            <B w="100%" h={410} r={12} />
            <B w={160} h={14} className="mt-2" />
            <B w="92%" h={30} r={8} />
            <B w="70%" h={30} r={8} />
            <Lines ws={['85%', '60%']} />
          </Col>
          <Col gap={40}>
            {Array.from({ length: 2 }, (_, i) => (
              <Col key={i} gap={12}>
                <B w="100%" h={228} r={12} />
                <B w={150} h={14} />
                <B w="95%" h={20} />
                <B w="70%" h={20} />
              </Col>
            ))}
          </Col>
        </div>
      </Body>
    </Shell>
  )
}

export function PostSkeleton() {
  return (
    <Shell label="Loading post">
      <section className="bg-navy">
        <div className={cn(CONTAINER_CLASS, 'pt-10')}>
          <div className="mx-auto max-w-[760px]">
            <div className="flex items-center justify-between">
              <N w={90} h={14} />
              <div className="flex gap-2">
                <N w={40} h={30} />
                <N w={40} h={30} />
              </div>
            </div>
            <Col gap={14} className="mt-6">
              <N w="95%" h={48} r={8} />
              <N w="60%" h={48} r={8} />
              <Lines navy ws={['100%', '70%']} h={18} gap={12} />
              <div className="mt-3 flex flex-wrap items-center gap-3.5">
                <N w={32} h={32} r={16} />
                <N w={130} h={14} />
                <N w={90} h={14} />
                <N w={70} h={14} />
              </div>
            </Col>
          </div>
        </div>
        <div className="h-[190px]" />
      </section>
      <div className={cn(CONTAINER_CLASS, '-mt-[150px]')}>
        <span className="mx-auto block aspect-[16/9] max-w-[1000px] animate-pulse rounded-xl bg-[#20242E] motion-reduce:animate-none" />
      </div>
      <Body className="pt-10">
        <div className="mx-auto max-w-[680px]">
          <Col gap={14}>
            <Lines ws={['100%', '97%', '94%', '60%']} h={18} gap={14} />
            <B w={160} h={24} className="mt-5" />
            <Lines ws={['100%', '95%', '80%']} h={18} gap={14} />
          </Col>
        </div>
      </Body>
    </Shell>
  )
}

export function MembersSkeleton() {
  return (
    <Shell label="Loading members">
      <Navy>
        <PageHero
          aside={
            <Col gap={8}>
              <N w={80} h={13} />
              <N w="100%" h={48} r={8} />
              <N w="100%" h={48} r={8} />
            </Col>
          }
        />
        <Stats n={4} />
      </Navy>
      <Body>
        <Card className="flex items-center gap-[18px]">
          <B w={72} h={72} r={14} />
          <Col gap={10}>
            <B w={150} h={13} />
            <B w={200} h={22} />
          </Col>
        </Card>
        <B w={330} h={36} r={8} className="mt-14" />
        <B w={520} h={16} className="mt-3.5" />
        <div className="mt-7 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Card key={i} className="flex items-center gap-3.5">
              <B w={56} h={56} r={28} />
              <Col gap={8}>
                <B w={90} h={12} />
                <B w={170} h={18} />
                <B w={110} h={13} />
              </Col>
            </Card>
          ))}
        </div>
      </Body>
    </Shell>
  )
}

export function MemberSkeleton() {
  return (
    <Shell label="Loading profile">
      <Navy className="pb-8 pt-11">
        <Crumbs />
        <div className="flex flex-wrap items-end gap-x-10 gap-y-7">
          <N w={144} h={144} r={18} />
          <Col gap={14} className="flex-[1_1_440px]">
            <N w={120} h={14} />
            <N w={420} h={50} r={8} />
            <N w={360} h={18} />
            <N w={320} h={18} />
          </Col>
          <div className="flex gap-2.5">
            <N w={150} h={44} r={8} />
            <N w={96} h={44} r={8} />
            <N w={110} h={44} r={8} />
          </div>
        </div>
        <div className="mt-8 flex gap-6 border-t border-white/[0.22] pt-5">
          <N w={100} h={14} />
          <N w={70} h={14} />
          <N w={110} h={14} />
        </div>
        <Stats n={4} />
      </Navy>
      <Body className="pt-16">
        <div className="flex flex-wrap items-start gap-x-16 gap-y-12">
          <div className="min-w-0 flex-[1_1_600px]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <B w={120} h={38} r={8} />
              <div className="flex gap-2">
                <B w={60} h={38} r={8} />
                <B w={90} h={38} r={8} />
                <B w={76} h={38} r={8} />
              </div>
            </div>
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="mt-7 grid grid-cols-[100px_14px_1fr] gap-4">
                <B w={70} h={13} />
                <B w={9} h={9} r={5} className="mt-1" />
                <Col gap={8}>
                  <B w={60} h={12} />
                  <B w="80%" h={18} />
                  <B w={90} h={12} />
                </Col>
              </div>
            ))}
          </div>
          <Col gap={20} className="flex-[0_1_340px]">
            <Card>
              <Col gap={12}>
                <B w={120} h={20} />
                <Lines ws={['100%', '70%']} h={13} />
                <B w="85%" h={18} className="mt-3" />
                <B w={70} h={24} />
              </Col>
            </Card>
            <Card>
              <Col gap={14}>
                <B w={130} h={20} />
                <B w="100%" h={14} />
                <B w="100%" h={14} />
              </Col>
            </Card>
          </Col>
        </div>
      </Body>
    </Shell>
  )
}

export function ContestsSkeleton() {
  return (
    <Shell label="Loading contests">
      <Navy>
        <PageHero aside={<StatusCard />} />
      </Navy>
      <Body className="pt-20">
        <B w={380} h={34} r={8} />
        <ThreeColumns />
        <B w={200} h={38} r={8} className="mt-24" />
        <B w={360} h={16} className="mt-3.5" />
        <Card className="mt-10 grid gap-14 p-10 md:grid-cols-[240px_1fr]">
          <Col gap={14}>
            <B w={120} h={46} r={8} />
            <B w={110} h={14} />
            {Array.from({ length: 5 }, (_, i) => <B key={i} w="100%" h={14} />)}
          </Col>
          <Col gap={14}>
            <B w="60%" h={36} r={8} />
            <Lines ws={['95%', '80%']} />
            {Array.from({ length: 4 }, (_, i) => <B key={i} w="100%" h={30} className={i ? '' : 'mt-3'} />)}
          </Col>
        </Card>
      </Body>
    </Shell>
  )
}

export function ContestSkeleton() {
  return (
    <Shell label="Loading contest">
      <Navy className="pb-6 pt-11">
        <Crumbs />
        <div className="flex flex-wrap items-start gap-x-12 gap-y-10">
          <Col gap={16} className="flex-[1_1_520px]">
            <N w={210} h={14} />
            <N w={620} h={54} r={8} />
            <Lines navy ws={[520, 520, 360]} h={18} gap={12} />
            <div className="mt-10 flex gap-3">
              <N w={180} h={48} r={8} />
              <N w={160} h={48} r={8} />
            </div>
          </Col>
          <Col gap={10} className="flex-[0_1_460px]">
            <N w="100%" h={88} r={10} />
            <N w="100%" h={74} r={10} />
            <N w="100%" h={98} r={10} />
          </Col>
        </div>
        <Stats n={5} />
      </Navy>
      <div className="border-b border-rule">
        <div className={cn(CONTAINER_CLASS, 'flex gap-7 py-4')}>
          {[90, 120, 100, 110, 80].map((w, i) => <B key={i} w={w} h={15} />)}
        </div>
      </div>
      <Body className="pt-[72px]">
        <div className="flex flex-wrap items-start gap-x-[72px] gap-y-12">
          <Col gap={16} className="flex-[1_1_560px]">
            <B w={260} h={40} r={8} />
            <Lines ws={['95%', '70%']} h={18} gap={12} />
            <Lines ws={['100%', '95%', '40%']} gap={12} />
            <B w={180} h={15} className="mt-6" />
            {Array.from({ length: 5 }, (_, i) => <B key={i} w="100%" h={30} />)}
          </Col>
          <Card className="flex-[0_1_440px] p-7">
            <Col gap={14}>
              <B w={60} h={12} />
              <B w="85%" h={18} />
              <B w={60} h={12} className="mt-2.5" />
              <B w="75%" h={18} />
              <B w="100%" h={56} r={8} className="mt-2.5" />
            </Col>
          </Card>
        </div>
      </Body>
    </Shell>
  )
}

export function EducationSkeleton() {
  return (
    <Shell label="Loading courses">
      <Navy>
        <PageHero aside={<StatusCard />} />
      </Navy>
      <Body className="pt-20">
        <B w={260} h={40} r={8} />
        <Card className="mt-8 grid items-center gap-14 p-6 sm:p-10 lg:grid-cols-2">
          <span className="block aspect-video w-full animate-pulse rounded-lg bg-[#20242E] motion-reduce:animate-none" />
          <Col gap={14}>
            <B w={260} h={14} />
            <B w="90%" h={34} r={8} />
            <B w="70%" h={34} r={8} />
            <Lines ws={['95%', '75%']} />
            <div className="mt-2.5 grid grid-cols-3 gap-6 border-y border-[#2A2E37] py-[18px]">
              {Array.from({ length: 3 }, (_, i) => (
                <Col key={i} gap={8}>
                  <B w={50} h={12} />
                  <B w={90} h={18} />
                </Col>
              ))}
            </div>
          </Col>
        </Card>
      </Body>
    </Shell>
  )
}

export function CourseSkeleton() {
  return (
    <Shell label="Loading course">
      <Navy className="pt-11">
        <Crumbs />
        <div className="flex flex-wrap items-end gap-x-12 gap-y-8">
          <Col gap={16} className="flex-[1_1_560px]">
            <N w={360} h={14} />
            <N w={620} h={50} r={8} />
            <N w={520} h={50} r={8} />
            <Lines navy ws={[520, 500, 330]} h={18} gap={12} />
          </Col>
          <Col gap={12} className="flex-[0_1_380px]">
            <N w="100%" h={52} r={8} />
            <N w="90%" h={14} />
          </Col>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-6 border-t border-white/[0.22] pt-6 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Col key={i} gap={10}>
              <N w={120} h={13} />
              <N w={110} h={22} />
              <N w={140} h={14} />
            </Col>
          ))}
        </div>
      </Navy>
      <Body className="pt-[72px]">
        <div className="flex flex-wrap items-start gap-x-16 gap-y-12">
          <div className="min-w-0 flex-[1_1_600px]">
            <B w={360} h={40} r={8} />
            <B w={480} h={16} className="mt-3.5" />
            {Array.from({ length: 2 }, (_, i) => (
              <div key={i} className="mt-7 grid grid-cols-[52px_1fr] gap-6 border-t border-rule pt-7">
                <B w={44} h={36} r={8} />
                <Col gap={12}>
                  <B w={140} h={13} />
                  <B w="80%" h={24} />
                  <B w="70%" h={16} />
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {[92, 118, 86, 110].map((w, j) => <B key={j} w={w} h={40} r={8} />)}
                  </div>
                </Col>
              </div>
            ))}
          </div>
          <Col gap={20} className="flex-[0_1_340px]">
            <Card>
              <Col gap={14}>
                <B w="70%" h={20} />
                <Lines ws={['100%', '90%', '95%']} h={15} gap={14} />
              </Col>
            </Card>
            <Card>
              <Lines ws={['100%', '100%', '100%', '100%']} h={15} gap={18} />
            </Card>
          </Col>
        </div>
      </Body>
    </Shell>
  )
}

export function SessionSkeleton() {
  return (
    <Shell label="Loading session">
      <section className="bg-navy">
        <div className={cn(CONTAINER_CLASS, 'flex items-center justify-between py-5')}>
          <N w={290} h={16} />
          <div className="hidden items-center gap-2.5 sm:flex">
            <N w={100} h={14} />
            <N w={124} h={4} r={2} />
          </div>
        </div>
      </section>
      <Body className="pt-12">
        <div className="grid gap-12 lg:grid-cols-[280px_minmax(0,1fr)]">
          <Col gap={16} className="hidden lg:flex">
            <B w={130} h={13} />
            <B w="100%" h={64} r={8} />
            {Array.from({ length: 3 }, (_, i) => <B key={i} w="85%" h={40} />)}
          </Col>
          <Col gap={14}>
            <B w={260} h={15} />
            <B w="90%" h={42} r={8} />
            <B w="50%" h={42} r={8} />
            <B w="70%" h={18} />
            <div className="mt-3.5 flex justify-between">
              <B w={276} h={46} r={10} />
              <B w={130} h={16} />
            </div>
            <span className="block aspect-video w-full animate-pulse rounded-xl bg-[#20242E] motion-reduce:animate-none" />
          </Col>
        </div>
      </Body>
    </Shell>
  )
}

export function CertificateSkeleton() {
  return (
    <Shell label="Loading certificate">
      <Navy className="pb-12 pt-11">
        <N w={120} h={13} className="mb-8" />
        <div className="flex flex-wrap items-center gap-x-8 gap-y-6">
          <N w={64} h={64} r={32} />
          <Col gap={12} className="flex-[1_1_480px]">
            <N w={190} h={14} />
            <N w={720} h={42} r={8} />
            <N w={380} h={18} />
          </Col>
          <N w={108} h={54} r={8} />
        </div>
      </Navy>
      <Body className="pt-12">
        <div className="flex flex-wrap items-start gap-x-14 gap-y-10">
          <Col gap={14} className="flex-[1_1_620px]">
            <span className="block aspect-[1.414] w-full animate-pulse rounded-[10px] bg-[#20242E] motion-reduce:animate-none" />
            <div className="flex justify-between">
              <B w={220} h={14} />
              <B w={170} h={14} />
            </div>
          </Col>
          <Col gap={20} className="flex-[0_1_400px]">
            <Card>
              <Col gap={16}>
                <B w={70} h={12} />
                <div className="flex items-center gap-3">
                  <B w={44} h={44} r={22} />
                  <Col gap={8}>
                    <B w={140} h={16} />
                    <B w={170} h={13} />
                  </Col>
                </div>
                <B w={40} h={12} className="mt-2" />
                <B w="85%" h={18} />
              </Col>
            </Card>
            <Card>
              <Col gap={12}>
                <B w={170} h={20} />
                <Lines ws={['100%', '70%']} h={13} />
                <B w="100%" h={48} r={8} className="mt-2" />
              </Col>
            </Card>
          </Col>
        </div>
      </Body>
    </Shell>
  )
}
