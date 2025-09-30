'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Button } from '@/components/Button'
import { Card, CardContent } from '@/components/Card'
import { Badge } from '@/components/Badge'
import { CounterAnimation } from '@/components/CounterAnimation'
import { SITE_CONFIG } from '@/lib/constants'
import { Code, Users, Zap, Brain, ArrowRight, Github, ExternalLink, Calendar, Clock, User, Newspaper } from 'lucide-react'

interface Stats {
  activeProjects: number
  activeMembers: number
  postsShared: number
  workshopsHeld: number
}

export default function HomePage() {
  const [stats, setStats] = useState<Stats>({
    activeProjects: 0,
    activeMembers: 0,
    postsShared: 0,
    workshopsHeld: 0
  })
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
        // Fallback to default values
        setStats({
          activeProjects: 8,
          activeMembers: 15,
          postsShared: 25,
          workshopsHeld: 1
        })
      } finally {
        setStatsLoading(false)
      }
    }

    fetchStats()
  }, [])
  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: 'AI Innovation & Workshops',
      description: 'Organizing workshops at our school to spread AI and technology knowledge to more students.'
    },
    {
      icon: <Code className="w-8 h-8" />,
      title: 'Practical Tech Solutions',
      description: 'Building practical technology products, especially AI tools to support student learning.'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Knowledge Sharing',
      description: 'Writing and sharing tech posts for the community to learn, explore and share together.'
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Community Building',
      description: 'Connecting young developers at PTNK into a strong learning and development community.'
    }
  ]

  const statsDisplay = [
    { label: 'Active Projects', value: stats.activeProjects, key: 'activeProjects' },
    { label: 'Active Members', value: stats.activeMembers, key: 'activeMembers' },
    { label: 'Posts Shared', value: stats.postsShared, key: 'postsShared' },
    { label: 'Workshops Held', value: stats.workshopsHeld, key: 'workshopsHeld' }
  ]

  const recentProjects = [
    {
      title: 'PTNK Study Assistant',
      description: 'AI chatbot supporting VNU High School for the Gifted students\' learning',
      tech: ['Python', 'OpenAI API', 'FastAPI'],
      status: 'Active'
    },
    {
      title: 'Tech Blog Platform',
      description: 'Knowledge sharing platform for our club\'s tech content',
      tech: ['Next.js', 'TypeScript', 'Supabase'],
      status: 'Active'
    },
    {
      title: 'Workshop Management System',
      description: 'System for managing and registering workshops for our students',
      tech: ['React', 'Node.js', 'MongoDB'],
      status: 'In Progress'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-4">
              <span className="gradient-text">
                THE NODERS PTNK
              </span>
            </h1>

            <p className="text-lg text-text-secondary mb-3">
              Technology Club at PTNK
            </p>

            <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-text-primary">
              Connecting Minds • Creating Intelligence
            </h2>

            <p className="text-lg text-text-secondary mb-8 max-w-2xl mx-auto leading-relaxed">
              Where innovation meets collaboration at VNU High School for the Gifted.
              Just like nodes in a neural network collaborate to create powerful intelligence, we connect to build an outstanding developer community.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contest">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-primary-blue to-accent-cyan hover:from-primary-blue/90 hover:to-accent-cyan/90">
                  Join AI Challenge 2025
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/projects">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  Explore Projects
                  <Code className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/members">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  Meet the Team
                  <Users className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Our Journey So Far */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-dark-surface/40 to-primary-blue/5 relative">
        <div className="container mx-auto relative">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Our Journey So Far
            </h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              From innovative projects to growing community, here's what we've achieved together
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {statsDisplay.map((stat, index) => (
              <div key={stat.key} className="text-center group">
                <div className="relative bg-gradient-to-br from-primary-blue/10 to-accent-cyan/5 border border-dark-border/50 rounded-xl p-6 hover:border-primary-blue/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary-blue/10">
                  <div className="text-3xl md:text-4xl font-bold font-mono bg-gradient-to-r from-primary-blue to-accent-cyan bg-clip-text text-transparent mb-2">
                    {!statsLoading ? (
                      <CounterAnimation
                        end={stat.value}
                        suffix={stat.key === 'workshopsHeld' ? '+' : '+'}
                      />
                    ) : (
                      <span className="animate-pulse">0+</span>
                    )}
                  </div>
                  <div className="text-text-secondary text-sm md:text-base font-medium">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Subtle geometric background */}
          <div className="absolute inset-0 pointer-events-none opacity-5">
            <svg className="w-full h-full">
              <defs>
                <pattern id="grid" patternUnits="userSpaceOnUse" width="60" height="60">
                  <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1" className="text-primary-blue"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)"/>
            </svg>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              What We Do
            </h2>
            <p className="text-text-secondary text-lg max-w-3xl mx-auto">
              Our club focuses on hands-on learning, collaboration, and innovation in the AI space.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover-lift group relative overflow-hidden">
                <CardContent className="p-6 relative z-10">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-blue/20 to-accent-cyan/10 border border-primary-blue/30 rounded-xl mb-4 text-primary-blue group-hover:shadow-lg group-hover:shadow-primary-blue/25 transition-all duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-text-primary mb-3 font-mono">
                    {feature.title}
                  </h3>
                  <p className="text-text-secondary leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
                {/* Terminal-style border effect */}
                <div className="absolute inset-0 border border-transparent group-hover:border-primary-blue/30 rounded-lg transition-all duration-300"></div>
                {/* Circuit pattern background */}
                <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
                  <div className="w-full h-full bg-gradient-to-br from-primary-blue/10 to-transparent"></div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Projects Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-dark-surface/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Recent Projects
            </h2>
            <p className="text-text-secondary text-lg max-w-3xl mx-auto">
              Check out some of our latest innovations and collaborative efforts.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {recentProjects.map((project, index) => (
              <Card key={index} variant="hover" className="hover-lift group relative overflow-hidden">
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-text-primary font-mono group-hover:text-primary-blue transition-colors duration-300">
                      {project.title}
                    </h3>
                    <Badge
                      variant={project.status === 'Active' ? 'success' : 'warning'}
                      size="sm"
                      className="font-mono text-xs"
                    >
                      {project.status}
                    </Badge>
                  </div>

                  <p className="text-text-secondary mb-4 text-sm leading-relaxed">
                    {project.description}
                  </p>

                  {/* Tech stack with terminal styling */}
                  <div className="bg-dark-surface/50 border border-dark-border/30 rounded-lg p-3 mb-4">
                    <div className="flex flex-wrap gap-2">
                      {project.tech.map((tech, techIndex) => (
                        <span key={techIndex} className="px-2 py-1 bg-primary-blue/10 text-accent-cyan text-xs font-mono rounded border border-primary-blue/20">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Interactive GitHub/External links */}
                  <div className="flex items-center space-x-3">
                    <button className="flex items-center space-x-1 text-text-tertiary hover:text-primary-blue transition-colors duration-200 group/btn">
                      <Github className="w-4 h-4 group-hover/btn:scale-110 transition-transform duration-200" />
                      <span className="text-xs font-mono">code</span>
                    </button>
                    <button className="flex items-center space-x-1 text-text-tertiary hover:text-accent-cyan transition-colors duration-200 group/btn">
                      <ExternalLink className="w-4 h-4 group-hover/btn:scale-110 transition-transform duration-200" />
                      <span className="text-xs font-mono">demo</span>
                    </button>
                  </div>
                </CardContent>
                {/* Glitch effect background */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {/* Terminal border */}
                <div className="absolute inset-0 border border-transparent group-hover:border-primary-blue/20 rounded-lg transition-all duration-300"></div>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/projects">
              <Button variant="secondary" size="lg">
                View All Projects
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Latest News Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-dark-surface/50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Latest News & Updates
            </h2>
            <p className="text-text-secondary max-w-3xl mx-auto">
              Stay up to date with our latest announcements, project showcases, and community highlights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {/* Featured News Items */}
            {/* Clean news announcement */}
            <Card variant="interactive" className="hover-lift group">
              <Link href="/news/1">
                <div className="aspect-video relative rounded-t-lg overflow-hidden bg-gradient-to-br from-primary-blue/10 to-accent-cyan/5 flex items-center justify-center">
                  <Newspaper className="w-12 h-12 text-primary-blue group-hover:scale-105 transition-transform duration-300" />
                </div>
                <CardContent className="p-6">
                  <Badge variant="primary" size="sm" className="mb-3">Announcement</Badge>
                  <h3 className="text-lg font-semibold text-text-primary mb-2 line-clamp-2 group-hover:text-primary-blue transition-colors">
                    The Noders PTNK Launches AI Fundamentals Workshop Series
                  </h3>
                  <p className="text-text-secondary text-sm mb-4 line-clamp-2 leading-relaxed">
                    We are excited to announce our comprehensive AI workshop series designed to spread technology knowledge to VNU High School for the Gifted students.
                  </p>
                  <div className="flex items-center gap-4 text-xs text-text-tertiary mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Jan 15, 2024
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      5 min read
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-primary-blue text-sm font-medium">Read More</span>
                    <ArrowRight className="w-4 h-4 text-primary-blue group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </CardContent>
              </Link>
            </Card>

            {/* Member spotlight */}
            <Card variant="interactive" className="hover-lift group">
              <Link href="/news/2">
                <div className="aspect-video relative rounded-t-lg overflow-hidden bg-gradient-to-br from-success/10 to-accent-cyan/5 flex items-center justify-center">
                  <User className="w-12 h-12 text-success group-hover:scale-105 transition-transform duration-300" />
                </div>
                <CardContent className="p-6">
                  <Badge variant="success" size="sm" className="mb-3">Member Spotlight</Badge>
                  <h3 className="text-lg font-semibold text-text-primary mb-2 line-clamp-2 group-hover:text-success transition-colors">
                    Success Story: From Zero to Hero in Programming
                  </h3>
                  <p className="text-text-secondary text-sm mb-4 line-clamp-2 leading-relaxed">
                    Discover how our club members transform from beginners to confident developers through collaborative learning and practice.
                  </p>
                  <div className="flex items-center gap-4 text-xs text-text-tertiary mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Jan 12, 2024
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      7 min read
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-success text-sm font-medium">Read More</span>
                    <ArrowRight className="w-4 h-4 text-success group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </CardContent>
              </Link>
            </Card>

            {/* View all news CTA */}
            <Card variant="interactive" className="hover-lift group">
              <Link href="/news">
                <CardContent className="p-8 text-center h-full flex flex-col justify-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-blue/20 to-accent-cyan/20 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg group-hover:shadow-primary-blue/25 transition-all duration-300">
                    <Newspaper className="w-8 h-8 text-primary-blue" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    View All News
                  </h3>
                  <p className="text-text-secondary text-sm mb-4 leading-relaxed">
                    Discover more stories, updates, and insights from our community
                  </p>
                  <div className="flex items-center justify-center gap-2 text-primary-blue group-hover:text-accent-cyan transition-colors duration-300">
                    <span className="text-sm font-medium">Browse All Posts</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </CardContent>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <Card className="text-center bg-gradient-to-r from-primary-blue/10 to-accent-cyan/10 border-primary-blue/20">
            <CardContent className="p-12">
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                Join The Noders Community
              </h2>
              <p className="text-text-secondary text-lg mb-8 max-w-2xl mx-auto">
                Passionate about AI, web/app development, or technology in general?
                Join us in connecting to create amazing things together!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/members">
                  <Button size="lg" className="w-full sm:w-auto">
                    Learn More
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}