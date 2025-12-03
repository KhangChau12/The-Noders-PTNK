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
  BookOpen,
  Lightbulb,
  Target
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
      border: 'border-primary-blue/30'
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {programs.map((program) => (
                  <Card
                    key={program.id}
                    variant="hover"
                    className={`hover-lift bg-gradient-to-br ${program.gradient} border ${program.border}`}
                  >
                    <CardContent className="p-8">
                      <div className="mb-6">
                        <Badge variant={program.badgeVariant} className="mb-4">
                          {program.badge}
                        </Badge>
                        <h3 className="text-2xl font-bold text-text-primary mb-3">
                          {program.title}
                        </h3>
                        <p className="text-text-secondary leading-relaxed">
                          {program.shortDescription}
                        </p>
                      </div>

                      <div className="space-y-3 mb-6">
                        {program.stats.map((stat, index) => (
                          <div key={index} className="flex items-center space-x-2 text-text-secondary">
                            <div className="text-primary-blue">
                              {stat.icon}
                            </div>
                            <span className="text-sm">{stat.text}</span>
                          </div>
                        ))}
                      </div>

                      <Link href={`/education/${program.slug}`}>
                        <Button variant="secondary" className="w-full group">
                          Learn More
                          <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-dark-surface/50">
          <div className="container mx-auto">
            <Card className="text-center bg-gradient-to-r from-primary-blue/10 to-accent-cyan/10 border-primary-blue/20">
              <CardContent className="p-12">
                <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                  Ready to Start Learning?
                </h2>
                <p className="text-text-secondary text-lg mb-8 max-w-3xl mx-auto">
                  Join our programs and build the skills that will set you apart. Whether you're
                  exploring AI for the first time or deepening your expertise, we'll meet you where you are.
                </p>
                <div className="flex justify-center gap-4">
                  <Link href="/contact">
                    <Button size="lg" className="group">
                      Get in Touch
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </>
  )
}
