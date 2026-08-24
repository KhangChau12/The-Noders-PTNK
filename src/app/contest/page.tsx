import Link from 'next/link'
import { Metadata } from 'next'
import { Button } from '@/components/Button'
import { Badge } from '@/components/Badge'
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'
import {
  ArrowRight,
  Users,
  Calendar,
  Trophy
} from 'lucide-react'
import { NeuralNetworkBackground } from '@/components/NeuralNetworkBackground'
import { PageHero } from '@/components/PageHero'

export const metadata: Metadata = generateSEOMetadata({
  title: 'Competitions - The Noders Community',
  description: 'Join The Noders Community competitions and practice AI skills through hands-on challenges. Learn by doing with our internal and public AI competitions.',
  keywords: ['AI competition', 'machine learning contest', 'student competition', 'PTNK challenge', 'learn by doing'],
  url: '/contest',
})

export default function ContestPage() {
  // Both competitions get the same full video-card treatment — each one
  // does have its own real video (workshop tutorial / rules Q&A). Order is
  // still by significance: the larger, more recent public contest leads.
  const competitions = [
    {
      slug: 'paic-2026',
      badge: 'Public • Ended',
      badgeVariant: 'gray' as const,
      title: 'PTNK AI Challenge 2026',
      description: 'Our flagship public competition for VNU High School students. Build AI models for IELTS Writing scoring with cash prizes up to 1,000,000 VNĐ.',
      teamsText: '24 Teams • 54 Participants',
      dateText: '05 – 18 Jan 2026',
      prizePool: '1,800,000 VNĐ',
      videoUrl: 'https://www.youtube.com/embed/cFs5njLot7k',
      videoTitle: 'PAIC 2026 Workshop',
    },
    {
      slug: 'naic-2025',
      badge: 'Internal • Ended',
      badgeVariant: 'purple' as const,
      title: 'Noders AI Competition 2025',
      description: 'Our internal competition where Noders members sharpen their AI skills through practical challenges — a focused learning environment for club members.',
      teamsText: '16 Members Joined',
      dateText: '28 Nov – 28 Dec 2025',
      prizePool: '400,000 VNĐ',
      videoUrl: 'https://www.youtube.com/embed/zN5i0p9qJqI',
      videoTitle: 'NAIC 2025 Rules & Q&A',
    },
  ]

  return (
    <>
      <NeuralNetworkBackground />
      <div className="relative min-h-screen z-10">
        <PageHero
          title="Contests"
          subtitle="Learn by Doing • Practice through Competition"
          description="The best way to master AI is hands-on. Our competitions give you real-world challenges to apply what you know, learn from experience, and grow with peers."
        >
          {/* Platform banner — title + blurb left, action right */}
          <div className="relative mt-10 sm:mt-12 max-w-3xl mx-auto overflow-hidden rounded-2xl border border-primary-blue/30 bg-gradient-to-br from-primary-blue/10 to-accent-cyan/5 backdrop-blur-sm p-5 sm:p-6">
            <Trophy
              className="pointer-events-none absolute -top-4 -right-2 h-20 w-20 sm:h-24 sm:w-24 -rotate-12 text-primary-blue opacity-[0.07]"
              strokeWidth={1.5}
            />

            <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-left">
                <h2 className="text-base sm:text-lg font-bold text-text-primary mb-1">
                  Compete on our platform
                </h2>
                <p className="text-sm text-text-secondary leading-relaxed max-w-xl">
                  Register, submit your models, and climb the live leaderboard — all in one place.
                </p>
              </div>

              <Link
                href="https://the-noders-competition-platform.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="sm:flex-shrink-0"
              >
                <Button size="md" className="w-full sm:w-auto group">
                  Visit Platform
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats strip — quick at-a-glance totals across all competitions */}
          <div className="max-w-2xl mx-auto mt-8 flex flex-wrap justify-center gap-x-7 gap-y-2 text-xs text-text-tertiary">
            <span>
              <b className="block text-[15px] text-text-primary [font-variant-numeric:tabular-nums]">{competitions.length}</b>
              Competitions Run
            </span>
            <span>
              <b className="block text-[15px] text-text-primary [font-variant-numeric:tabular-nums]">70</b>
              Total Participants
            </span>
            <span>
              <b className="block text-[15px] text-text-primary [font-variant-numeric:tabular-nums]">2.2M ₫</b>
              Combined Prize Pool
            </span>
          </div>
        </PageHero>

        {/* Our Competitions Section */}
        <section className="py-10 px-4 sm:px-6 sm:py-16 lg:px-8 bg-dark-surface/40">
          <div className="container mx-auto">
            <div className="mb-8 sm:mb-10">
              <span className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-primary-blue mb-3.5">
                <span className="w-[18px] h-0.5 rounded-sm bg-current" />
                Competitions
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary mb-2">
                Our Competitions
              </h2>
              <p className="text-text-secondary text-base sm:text-lg leading-relaxed max-w-2xl">
                From internal practice sessions to public challenges, we run competitions
                that match your skill level and ambitions.
              </p>
            </div>

            <div className="lg:px-7 flex flex-col gap-5">
              {competitions.map((competition) => (
                <div
                  key={competition.slug}
                  className="rounded-[22px] border border-dark-border/60 bg-dark-surface/70 backdrop-blur-sm overflow-hidden grid grid-cols-1 lg:grid-cols-[1.3fr_1fr]"
                >
                  <div className="relative bg-black aspect-video lg:aspect-auto">
                    <iframe
                      className="absolute inset-0 w-full h-full"
                      src={competition.videoUrl}
                      title={competition.videoTitle}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <div className="p-6 sm:p-8 flex flex-col">
                    <Badge variant={competition.badgeVariant} className="mb-3 self-start">{competition.badge}</Badge>
                    <h3 className="text-2xl sm:text-[26px] font-bold text-text-primary mb-3 leading-tight">
                      {competition.title}
                    </h3>
                    <p className="text-text-secondary leading-relaxed text-sm mb-5">
                      {competition.description}
                    </p>
                    <div className="flex flex-col gap-2.5 mb-6">
                      <div className="flex items-center gap-2.5 text-text-secondary text-sm">
                        <Users className="w-4 h-4 text-primary-blue flex-shrink-0" />
                        {competition.teamsText}
                      </div>
                      <div className="flex items-center gap-2.5 text-text-secondary text-sm">
                        <Calendar className="w-4 h-4 text-primary-blue flex-shrink-0" />
                        {competition.dateText}
                      </div>
                    </div>
                    <div className="mt-auto pt-5 border-t border-dark-border/60 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs text-text-tertiary">Prize pool</div>
                        <div className="text-lg font-bold text-text-primary [font-variant-numeric:tabular-nums]">{competition.prizePool}</div>
                      </div>
                      <Link href={`/contest/${competition.slug}`}>
                        <Button variant="secondary" className="group/btn">
                          Learn More
                          <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
