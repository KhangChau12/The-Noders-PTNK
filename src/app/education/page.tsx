import Link from 'next/link'
import { Metadata } from 'next'
import { Button } from '@/components/Button'
import { Badge } from '@/components/Badge'
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'
import {
  ArrowRight,
  Users,
  Calendar,
  Building2,
  Play,
  ExternalLink
} from 'lucide-react'
import { NeuralNetworkBackground } from '@/components/NeuralNetworkBackground'
import { PageHero } from '@/components/PageHero'

export const metadata: Metadata = generateSEOMetadata({
  title: 'Education - The Noders Community',
  description: 'Join workshops and mini-courses designed for high school students serious about AI and Data Science. Build practical skills through structured learning paths.',
  keywords: ['AI education', 'data science course', 'student workshop', 'PTNK training', 'machine learning course'],
  url: '/education',
})

export default function EducationPage() {
  const programs = [
    {
      id: 'data-science-module-1',
      slug: 'ds-and-ai-01',
      badge: 'Mini-Course • Coming Soon',
      badgeVariant: 'warning' as const,
      title: 'Introduction to Data Science and Artificial Intelligence',
      shortDescription: 'Build a solid foundation in data science thinking and gain comprehensive knowledge of the 3 pillars of data (Structured, Vision, NLP). Focus on problem fundamentals, standard data processing workflows, and practical applications.',
      stats: [
        { icon: <Users className="w-4 h-4" />, text: 'High School Students (Grade 10-11)' },
        { icon: <Calendar className="w-4 h-4" />, text: '4 sessions × 1.5h • Jan 2026' },
        { icon: <Building2 className="w-4 h-4" />, text: 'The Noders Community × PRISEE' }
      ],
      canvaEmbed: 'https://www.canva.com/design/DAG6aB5X6q0/9rrWO6b8nUd1G_NSfJvOrA/view?embed'
    }
  ]

  return (
    <>
      <NeuralNetworkBackground />
      <div className="relative min-h-screen z-10">
        <PageHero
          title="Education"
          subtitle="Workshops & Mini-Courses for Future AI Builders"
          description="From quick weekend workshops to multi-module courses, our programs help VNU High School students build practical AI and Data Science skills — learn a skill fast, or follow a structured journey from zero to builder."
        />

        {/* Our Programs Section */}
        <section className="py-12 px-4 sm:px-6 sm:py-16 lg:px-8 bg-dark-surface/40">
          <div className="container mx-auto">
            <div className="mb-8 sm:mb-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary mb-2">
                Our Programs
              </h2>
              <p className="text-text-secondary text-base sm:text-lg leading-relaxed max-w-2xl">
                From weekend workshops to multi-session courses, choose the learning path
                that fits your goals and schedule.
              </p>
            </div>

            <div className="space-y-6 sm:space-y-8">
              {programs.map((program) => (
                <div
                  key={program.id}
                  className="group relative overflow-hidden rounded-2xl border border-dark-border/60 bg-dark-surface/70 backdrop-blur-sm transition-all duration-300 hover:border-primary-blue/40 hover:shadow-lg hover:shadow-primary-blue/10"
                >
                  <div className="flex flex-col lg:flex-row">
                    {/* Slide Preview */}
                    {program.canvaEmbed && (
                      <div className="lg:w-1/2 xl:w-3/5 relative bg-dark-bg overflow-hidden border-b lg:border-b-0 lg:border-r border-dark-border/40">
                        <div className="aspect-[4/3] relative">
                          <iframe
                            src={program.canvaEmbed}
                            allowFullScreen
                            allow="fullscreen"
                            className="absolute -inset-[1px] w-[calc(100%+2px)] h-[calc(100%+2px)] border-0 scale-[1.01]"
                            title={`${program.title} - Slide Preview`}
                          />
                        </div>
                        <div className="absolute bottom-3 left-3">
                          <Badge variant="secondary" className="bg-dark-bg/80 backdrop-blur-sm text-xs">
                            <Play className="w-3 h-3 mr-1" />
                            Session 1 Preview
                          </Badge>
                        </div>
                      </div>
                    )}

                    {/* Content */}
                    <div className={`p-6 lg:p-8 flex flex-col ${program.canvaEmbed ? 'lg:w-1/2 xl:w-2/5' : 'w-full'}`}>
                      <Badge variant={program.badgeVariant} className="mb-4 self-start">
                        {program.badge}
                      </Badge>
                      <h3 className="text-xl lg:text-2xl font-bold text-text-primary mb-3 group-hover:text-primary-blue transition-colors duration-300">
                        {program.title}
                      </h3>
                      <p className="text-text-secondary leading-relaxed text-sm lg:text-base mb-5">
                        {program.shortDescription}
                      </p>

                      <div className="space-y-2 mb-6">
                        {program.stats.map((stat, index) => (
                          <div key={index} className="flex items-center gap-2 text-text-secondary">
                            <span className="text-primary-blue">{stat.icon}</span>
                            <span className="text-sm">{stat.text}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-auto flex gap-3">
                        <Link href={`/education/${program.slug}`} className="flex-1">
                          <Button variant="primary" className="w-full group/btn">
                            Learn More
                            <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                        {program.canvaEmbed && (
                          <a
                            href={program.canvaEmbed.replace('?embed', '')}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="secondary" title="Open slides in new tab">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </a>
                        )}
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
