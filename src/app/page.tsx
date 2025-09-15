import Link from 'next/link'
import { Button } from '@/components/Button'
import { Card, CardContent } from '@/components/Card'
import { Badge } from '@/components/Badge'
import { SITE_CONFIG } from '@/lib/constants'
import { Code, Users, Zap, Brain, ArrowRight, Github, ExternalLink, Calendar, Clock, User, Newspaper } from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: 'AI Innovation',
      description: 'Exploring cutting-edge AI technologies and building intelligent solutions.'
    },
    {
      icon: <Code className="w-8 h-8" />,
      title: 'Collaborative Development',
      description: 'Working together on projects using modern tech stacks and best practices.'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Knowledge Sharing',
      description: 'Learning from each other and growing together as a community.'
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Rapid Prototyping',
      description: 'Quickly turning ideas into working prototypes and MVPs.'
    }
  ]

  const stats = [
    { label: 'Active Projects', value: '12+' },
    { label: 'Club Members', value: '25+' },
    { label: 'Technologies Used', value: '20+' },
    { label: 'Workshops Held', value: '8+' }
  ]

  const recentProjects = [
    {
      title: 'Smart Chat Assistant',
      description: 'AI-powered chatbot with natural language processing',
      tech: ['Python', 'OpenAI', 'FastAPI'],
      status: 'Active'
    },
    {
      title: 'Project Portfolio Manager',
      description: 'Web platform for showcasing team projects and contributions',
      tech: ['Next.js', 'TypeScript', 'Supabase'],
      status: 'Active'
    },
    {
      title: 'ML Model Trainer',
      description: 'User-friendly interface for training machine learning models',
      tech: ['React', 'Python', 'TensorFlow'],
      status: 'In Progress'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="gradient-text">
                AI Agent Club
              </span>
              <br />
              <span className="text-text-primary">
                Building Tomorrow's Intelligence
              </span>
            </h1>
            
            <p className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto">
              We're a community of passionate developers, researchers, and innovators 
              exploring the frontiers of artificial intelligence through collaborative projects.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/projects">
                <Button size="lg" className="w-full sm:w-auto">
                  Explore Projects
                  <ArrowRight className="ml-2 w-4 h-4" />
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

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-dark-surface/30">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-blue mb-2">
                  {stat.value}
                </div>
                <div className="text-text-secondary text-sm md:text-base">
                  {stat.label}
                </div>
              </div>
            ))}
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
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              Our club focuses on hands-on learning, collaboration, and innovation in the AI space.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover-lift">
                <CardContent className="pt-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-blue/20 rounded-full mb-4 text-primary-blue">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-text-primary mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-text-secondary">
                    {feature.description}
                  </p>
                </CardContent>
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
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              Check out some of our latest innovations and collaborative efforts.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {recentProjects.map((project, index) => (
              <Card key={index} variant="hover" className="hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-text-primary">
                      {project.title}
                    </h3>
                    <Badge 
                      variant={project.status === 'Active' ? 'success' : 'warning'}
                      size="sm"
                    >
                      {project.status}
                    </Badge>
                  </div>
                  
                  <p className="text-text-secondary mb-4 text-sm">
                    {project.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tech.map((tech, techIndex) => (
                      <Badge key={techIndex} variant="tech" size="sm">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center space-x-2 text-text-tertiary">
                    <Github className="w-4 h-4" />
                    <ExternalLink className="w-4 h-4" />
                  </div>
                </CardContent>
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
            <p className="text-text-secondary max-w-2xl mx-auto">
              Stay up to date with our latest announcements, project showcases, and community highlights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {/* Featured News Items */}
            <Card variant="interactive" className="hover-lift">
              <Link href="/news/1">
                <div className="aspect-video relative rounded-t-lg overflow-hidden bg-gradient-to-br from-primary-blue/20 to-accent-cyan/20 flex items-center justify-center">
                  <Newspaper className="w-12 h-12 text-primary-blue" />
                </div>
                <CardContent className="p-6">
                  <Badge variant="primary" size="sm" className="mb-2">Announcement</Badge>
                  <h3 className="text-lg font-semibold text-text-primary mb-2 line-clamp-2 group-hover:text-primary-blue transition-colors">
                    AI Agent Club Launches Advanced ML Workshop Series
                  </h3>
                  <p className="text-text-secondary text-sm mb-4 line-clamp-2">
                    We are excited to announce our comprehensive ML workshop series designed for both beginners and advanced practitioners.
                  </p>
                  <div className="flex items-center gap-4 text-xs text-text-tertiary mb-3">
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
                    <ArrowRight className="w-4 h-4 text-primary-blue" />
                  </div>
                </CardContent>
              </Link>
            </Card>

            <Card variant="interactive" className="hover-lift">
              <Link href="/news/2">
                <div className="aspect-video relative rounded-t-lg overflow-hidden bg-gradient-to-br from-success/20 to-accent-cyan/20 flex items-center justify-center">
                  <User className="w-12 h-12 text-success" />
                </div>
                <CardContent className="p-6">
                  <Badge variant="success" size="sm" className="mb-2">Member Spotlight</Badge>
                  <h3 className="text-lg font-semibold text-text-primary mb-2 line-clamp-2 group-hover:text-primary-blue transition-colors">
                    Alice Johnson: From Beginner to AI Expert
                  </h3>
                  <p className="text-text-secondary text-sm mb-4 line-clamp-2">
                    Learn how Alice transformed from a coding newbie to leading our most complex AI projects in just 8 months.
                  </p>
                  <div className="flex items-center gap-4 text-xs text-text-tertiary mb-3">
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
                    <span className="text-primary-blue text-sm font-medium">Read More</span>
                    <ArrowRight className="w-4 h-4 text-primary-blue" />
                  </div>
                </CardContent>
              </Link>
            </Card>

            <Card variant="interactive" className="hover-lift">
              <Link href="/news">
                <CardContent className="p-8 text-center h-full flex flex-col justify-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-blue/20 to-accent-cyan/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Newspaper className="w-8 h-8 text-primary-blue" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    View All News
                  </h3>
                  <p className="text-text-secondary text-sm mb-4">
                    Discover more stories, updates, and insights from our community
                  </p>
                  <div className="flex items-center justify-center gap-2 text-primary-blue">
                    <span className="text-sm font-medium">Browse All Posts</span>
                    <ArrowRight className="w-4 h-4" />
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
                Join Our Community
              </h2>
              <p className="text-text-secondary text-lg mb-8 max-w-2xl mx-auto">
                Interested in AI, machine learning, or collaborative development? 
                We'd love to have you join our growing community of innovators.
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