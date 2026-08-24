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
  ExternalLink,
  Plus
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
  const program = {
    slug: 'ds-and-ai-01',
    badge: 'Mini-Course • Coming Soon',
    title: 'Introduction to Data Science and Artificial Intelligence',
    description: 'Build a solid foundation in data science thinking and gain comprehensive knowledge of the 3 pillars of data (Structured, Vision, NLP).',
    targetText: 'Grade 10-11 students',
    scheduleText: '4 sessions × 1.5h • Jan 2026',
    orgText: 'The Noders Community × PRISEE',
    canvaEmbed: 'https://www.canva.com/design/DAG6aB5X6q0/9rrWO6b8nUd1G_NSfJvOrA/view?embed',
  }

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
        <section className="py-10 px-4 sm:px-6 sm:py-16 lg:px-8 bg-dark-surface/40">
          <div className="container mx-auto">
            <div className="mb-8 sm:mb-10">
              <span className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-accent-purple mb-3.5">
                <span className="w-[18px] h-0.5 rounded-sm bg-current" />
                Programs
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary mb-2">
                Our Programs
              </h2>
              <p className="text-text-secondary text-base sm:text-lg leading-relaxed max-w-2xl">
                From weekend workshops to multi-session courses, choose the learning path
                that fits your goals and schedule.
              </p>
            </div>

            <div className="lg:px-7">
              {/* Featured course card — sized like a first entry in a growing
                  catalog rather than a lone card floating in the page. */}
              <div className="rounded-[22px] border border-dark-border/60 bg-dark-surface/70 backdrop-blur-sm overflow-hidden grid grid-cols-1 lg:grid-cols-[1.3fr_1fr]">
                <div className="relative bg-black aspect-[4/3]">
                  <iframe
                    src={program.canvaEmbed}
                    allowFullScreen
                    allow="fullscreen"
                    className="absolute inset-0 w-full h-full border-0"
                    title={`${program.title} - Slide Preview`}
                  />
                  <div className="absolute bottom-3 left-3">
                    <Badge variant="secondary" className="bg-dark-bg/80 backdrop-blur-sm text-xs">
                      <Play className="w-3 h-3 mr-1" />
                      Session 1 Preview
                    </Badge>
                  </div>
                </div>
                <div className="p-6 sm:p-8 flex flex-col">
                  <Badge
                    variant="warning"
                    className="mb-3 self-start !bg-accent-orange/10 !text-[#fdba74] !border-accent-orange/30"
                  >
                    {program.badge}
                  </Badge>
                  <h3 className="text-xl sm:text-2xl font-bold text-text-primary mb-3 leading-tight">
                    {program.title}
                  </h3>
                  <p className="text-text-secondary leading-relaxed text-sm mb-5">
                    {program.description}
                  </p>
                  <div className="flex flex-col gap-2.5 mb-6">
                    <div className="flex items-center gap-2.5 text-text-secondary text-sm">
                      <Users className="w-4 h-4 text-accent-purple flex-shrink-0" />
                      {program.targetText}
                    </div>
                    <div className="flex items-center gap-2.5 text-text-secondary text-sm">
                      <Calendar className="w-4 h-4 text-accent-purple flex-shrink-0" />
                      {program.scheduleText}
                    </div>
                    <div className="flex items-center gap-2.5 text-text-secondary text-sm">
                      <Building2 className="w-4 h-4 text-accent-purple flex-shrink-0" />
                      {program.orgText}
                    </div>
                  </div>
                  <div className="mt-auto pt-5 border-t border-dark-border/60 flex gap-3">
                    <Link href={`/education/${program.slug}`} className="flex-1">
                      <Button variant="primary" className="w-full group/btn">
                        Learn More
                        <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                    <a
                      href={program.canvaEmbed.replace('?embed', '')}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="secondary" title="Open slides in new tab">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </a>
                  </div>
                </div>
              </div>

              {/* Explicit "more coming" slot so a single-program catalog
                  doesn't read as an unfinished page. */}
              <div className="mt-5 rounded-[18px] border border-dashed border-dark-border/60 p-5 sm:p-6 flex items-center gap-3.5 text-text-tertiary text-sm">
                <div className="w-9 h-9 rounded-lg bg-dark-surface flex items-center justify-center flex-shrink-0">
                  <Plus className="w-4 h-4" />
                </div>
                <span>More workshops and courses will appear here as they&apos;re announced.</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
