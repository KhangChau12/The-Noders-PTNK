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
  Target,
  Trophy
} from 'lucide-react'
import { NeuralNetworkBackground } from '@/components/NeuralNetworkBackground'

export const metadata: Metadata = generateSEOMetadata({
  title: 'Competitions - The Noders PTNK',
  description: 'Join The Noders PTNK competitions and practice AI skills through hands-on challenges. Learn by doing with our internal and public AI competitions.',
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
      gradient: 'from-accent-cyan/10 to-primary-blue/10',
      border: 'border-accent-cyan/30',
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
      gradient: 'from-primary-blue/10 to-accent-cyan/10',
      border: 'border-primary-blue/30',
      videoUrl: 'https://www.youtube.com/embed/zN5i0p9qJqI',
      videoTitle: 'NAIC 2025 Rules & Q&A'
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
                <span className="gradient-text">Contests</span>
              </h1>

              <p className="text-2xl md:text-3xl font-semibold text-text-primary mb-8">
                Learn by Doing - Practice through Competition
              </p>

              <p className="text-xl text-text-secondary mb-8 max-w-3xl mx-auto leading-relaxed">
                At The Noders PTNK, we believe the best way to master AI is through hands-on practice.
                Our competitions provide real-world challenges where you can apply your knowledge,
                learn from experience, and grow alongside passionate peers.
              </p>

              <div className="flex justify-center">
                <Link href="https://the-noders-competition-platform.vercel.app/" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="group">
                    Visit Competition Platform
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Floating elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-20 h-20 bg-primary-blue/10 rounded-full blur-xl"></div>
            <div className="absolute bottom-20 right-10 w-32 h-32 bg-accent-cyan/10 rounded-full blur-xl"></div>
          </div>
        </section>

        {/* Our Competitions Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                  Our Competitions
                </h2>
                <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                  From internal practice sessions to public challenges, we offer competitions
                  that match your skill level and ambitions.
                </p>
              </div>

              <div className="space-y-8">
                {competitions.map((competition) => (
                  <Card
                    key={competition.id}
                    variant="hover"
                    className={`hover-lift bg-gradient-to-br ${competition.gradient} border ${competition.border} overflow-hidden`}
                  >
                    <div className="flex flex-col lg:flex-row">
                       {/* Video Section - Left Side */}
                       {competition.videoUrl && (
                        <div className="lg:w-1/2 xl:w-3/5 relative bg-dark-bg border-b lg:border-b-0 lg:border-r border-dark-border/30">
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

                      {/* Content Section - Right Side */}
                      <CardContent className={`p-6 lg:p-8 flex flex-col justify-between ${competition.videoUrl ? 'lg:w-1/2 xl:w-2/5' : 'w-full'}`}>
                        <div>
                          <Badge variant={competition.badgeVariant} className="mb-4">
                            {competition.badge}
                          </Badge>
                          <h3 className="text-xl lg:text-2xl font-bold text-text-primary mb-3">
                            {competition.title}
                          </h3>
                          <p className="text-text-secondary leading-relaxed text-sm lg:text-base mb-6">
                            {competition.shortDescription}
                          </p>

                          <div className="space-y-2 mb-6">
                            {competition.stats.map((stat, index) => (
                              <div key={index} className="flex items-center space-x-2 text-text-secondary">
                                <div className="text-primary-blue">
                                  {stat.icon}
                                </div>
                                <span className="text-sm">{stat.text}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <Link href={`/contest/${competition.slug}`}>
                            <Button variant="secondary" className="w-full group">
                              Learn More
                              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                          </Link>
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
