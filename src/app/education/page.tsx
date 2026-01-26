import Link from 'next/link'
import { Metadata } from 'next'
import { Button } from '@/components/Button'
import { Card, CardContent } from '@/components/Card'
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

export const metadata: Metadata = generateSEOMetadata({
  title: 'Education - The Noders PTNK',
  description: 'Join workshops and mini-courses designed for high school students serious about AI and Data Science. Build practical skills through structured learning paths.',
  keywords: ['AI education', 'data science course', 'student workshop', 'PTNK training', 'machine learning course'],
  url: '/education',
})

export default function EducationPage() {
  const programs = [
    {
      id: 'data-science-module-1',
      slug: 'data-science-module-1',
      badge: 'Mini-Course • Coming Soon',
      badgeVariant: 'warning' as const,
      title: 'Introduction to Data Science - Module 1',
      shortDescription: 'Build a solid foundation in data science thinking and gain comprehensive knowledge of the 3 pillars of data (Structured, Vision, NLP). Focus on problem fundamentals, standard data processing workflows, and practical applications.',
      stats: [
        { icon: <Users className="w-4 h-4" />, text: 'High School Students (Grade 10-11)' },
        { icon: <Calendar className="w-4 h-4" />, text: '4 sessions × 1.5h • Jan 2026' },
        { icon: <Building2 className="w-4 h-4" />, text: 'The Noders PTNK × PRISEE' }
      ],
      gradient: 'from-primary-blue/10 to-accent-cyan/10',
      border: 'border-primary-blue/30',
      canvaEmbed: 'https://www.canva.com/design/DAG6aB5X6q0/9rrWO6b8nUd1G_NSfJvOrA/view?embed'
    }
  ]

  return (
    <>
      <NeuralNetworkBackground />
      <div className="relative min-h-screen z-10">
        {/* Hero Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-dark-surface/50 to-primary-blue/5">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold font-heading mb-4">
                <span className="gradient-text">Education</span>
              </h1>

              <p className="text-2xl md:text-3xl font-semibold text-text-primary mb-8">
                Workshops & Mini-Courses for Future AI Builders
              </p>

              <p className="text-xl text-text-secondary mb-8 max-w-3xl mx-auto leading-relaxed">
                From quick weekend workshops to comprehensive multi-module courses, our programs help
                VNU High School students build practical AI and Data Science skills. Choose your path:
                learn a specific skill fast, or follow a structured journey from zero to builder.
              </p>
            </div>
          </div>

          {/* Floating elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-20 h-20 bg-primary-blue/10 rounded-full blur-xl"></div>
            <div className="absolute bottom-20 right-10 w-32 h-32 bg-accent-cyan/10 rounded-full blur-xl"></div>
          </div>
        </section>

        {/* Our Programs Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                  Our Programs
                </h2>
                <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                  From weekend workshops to multi-session courses, choose the learning path
                  that fits your goals and schedule.
                </p>
              </div>

              <div className="space-y-8">
                {programs.map((program) => (
                  <Card
                    key={program.id}
                    variant="hover"
                    className={`hover-lift bg-gradient-to-br ${program.gradient} border ${program.border} overflow-hidden`}
                  >
                    <div className="flex flex-col lg:flex-row">
                      {/* Slide Preview */}
                      {program.canvaEmbed && (
                        <div className="lg:w-1/2 xl:w-3/5 relative bg-dark-bg overflow-hidden">
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
                      <CardContent className={`p-6 lg:p-8 flex flex-col justify-between ${program.canvaEmbed ? 'lg:w-1/2 xl:w-2/5' : 'w-full'}`}>
                        <div>
                          <Badge variant={program.badgeVariant} className="mb-4">
                            {program.badge}
                          </Badge>
                          <h3 className="text-xl lg:text-2xl font-bold text-text-primary mb-3">
                            {program.title}
                          </h3>
                          <p className="text-text-secondary leading-relaxed text-sm lg:text-base mb-6">
                            {program.shortDescription}
                          </p>

                          <div className="space-y-2 mb-6">
                            {program.stats.map((stat, index) => (
                              <div key={index} className="flex items-center space-x-2 text-text-secondary">
                                <div className="text-primary-blue">
                                  {stat.icon}
                                </div>
                                <span className="text-sm">{stat.text}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <Link href={`/education/${program.slug}`} className="flex-1">
                            <Button variant="primary" className="w-full group">
                              Learn More
                              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
