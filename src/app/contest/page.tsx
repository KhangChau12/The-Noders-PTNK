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
  const competitions = [
    {
      id: 'paic-2026',
      slug: 'paic-2026',
      badge: 'Public • Ended',
      badgeVariant: 'primary' as const,
      title: 'PTNK AI Challenge 2026',
      shortDescription: 'Our flagship public competition for VNU High School students. Build AI models for IELTS Writing scoring with cash prizes up to 1,000,000 VNĐ.',
      stats: [
        { icon: <Users className="w-4 h-4" />, text: '24 Teams • 54 Participants' },
        { icon: <Calendar className="w-4 h-4" />, text: '05 - 18 Jan 2026' }
      ],
      videoUrl: 'https://www.youtube.com/embed/cFs5njLot7k',
      videoTitle: 'PAIC 2026 Workshop'
    },
    {
      id: 'naic-2025',
      slug: 'naic-2025',
      badge: 'Internal • Ended',
      badgeVariant: 'primary' as const,
      title: 'Noders AI Competition 2025',
      shortDescription: 'Our internal competition where Noders members sharpen their AI skills through practical challenges. A focused learning environment for our club members.',
      stats: [
        { icon: <Users className="w-4 h-4" />, text: '16 Members Joined' },
        { icon: <Calendar className="w-4 h-4" />, text: '28 Nov - 28 Dec 2025' }
      ],
      videoUrl: 'https://www.youtube.com/embed/zN5i0p9qJqI',
      videoTitle: 'NAIC 2025 Rules & Q&A'
    }
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
          <div className="relative mt-10 sm:mt-12 max-w-5xl mx-auto overflow-hidden rounded-2xl border border-primary-blue/30 bg-gradient-to-br from-primary-blue/10 to-accent-cyan/5 backdrop-blur-sm p-6 sm:p-8">
            {/* Quiet watermark — background mark, not a focal point */}
            <Trophy
              className="pointer-events-none absolute -top-4 -right-2 h-28 w-28 sm:h-36 sm:w-36 -rotate-12 text-primary-blue opacity-[0.07]"
              strokeWidth={1.5}
            />

            <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-left">
                <h2 className="text-lg sm:text-xl font-bold text-text-primary mb-1">
                  Compete on our platform
                </h2>
                <p className="text-sm sm:text-base text-text-secondary leading-relaxed max-w-xl">
                  Register, submit your models, and climb the live leaderboard — all in one place.
                </p>
              </div>

              <Link
                href="https://the-noders-competition-platform.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="sm:flex-shrink-0"
              >
                <Button size="lg" className="w-full sm:w-auto group">
                  Visit Platform
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </PageHero>

        {/* Our Competitions Section */}
        <section className="py-10 px-4 sm:px-6 sm:py-16 lg:px-8 bg-dark-surface/40">
          <div className="container mx-auto">
            <div className="mb-8 sm:mb-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary mb-2">
                Our Competitions
              </h2>
              <p className="text-text-secondary text-base sm:text-lg leading-relaxed max-w-2xl">
                From internal practice sessions to public challenges, we run competitions
                that match your skill level and ambitions.
              </p>
            </div>

            <div className="space-y-6 sm:space-y-8">
              {competitions.map((competition) => (
                <div
                  key={competition.id}
                  className="group relative overflow-hidden rounded-2xl border border-dark-border/60 bg-dark-surface/70 backdrop-blur-sm transition-all duration-300 hover:border-primary-blue/40 hover:shadow-lg hover:shadow-primary-blue/10"
                >
                  <div className="flex flex-col lg:flex-row">
                    {/* Video — left */}
                    {competition.videoUrl && (
                      <div className="lg:w-1/2 xl:w-3/5 relative bg-dark-bg border-b lg:border-b-0 lg:border-r border-dark-border/40">
                        <div className="aspect-video relative w-full h-full">
                          <iframe
                            className="absolute top-0 left-0 w-full h-full"
                            src={competition.videoUrl}
                            title={competition.videoTitle}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    )}

                    {/* Content — right */}
                    <div className={`p-6 lg:p-8 flex flex-col ${competition.videoUrl ? 'lg:w-1/2 xl:w-2/5' : 'w-full'}`}>
                      <Badge variant={competition.badgeVariant} className="mb-4 self-start">
                        {competition.badge}
                      </Badge>
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-text-primary mb-3 group-hover:text-primary-blue transition-colors duration-300 break-words">
                        {competition.title}
                      </h3>
                      <p className="text-text-secondary leading-relaxed text-sm lg:text-base mb-5">
                        {competition.shortDescription}
                      </p>

                      <div className="space-y-2 mb-6">
                        {competition.stats.map((stat, index) => (
                          <div key={index} className="flex items-center gap-2 text-text-secondary">
                            <span className="text-primary-blue">{stat.icon}</span>
                            <span className="text-sm">{stat.text}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-auto">
                        <Link href={`/contest/${competition.slug}`}>
                          <Button variant="secondary" className="w-full group/btn">
                            Learn More
                            <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                      </div>
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
