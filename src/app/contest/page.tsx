import Link from 'next/link'
import { Metadata } from 'next'
import { Button } from '@/components/Button'
import { Card, CardContent } from '@/components/Card'
import { Badge } from '@/components/Badge'
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'
import {
  Trophy,
  Calendar,
  Clock,
  Users,
  Target,
  Database,
  Award,
  CheckCircle,
  ArrowRight,
  Brain,
  BarChart3,
  FileText,
  Lightbulb,
  Star,
  Medal,
  Gift,
  Zap
} from 'lucide-react'

export const metadata: Metadata = generateSEOMetadata({
  title: 'PTNK AI Challenge 2025',
  description: 'Join The Noders PTNK AI Challenge 2025! Build AI models for IELTS Writing scoring. Cash prizes up to 1,000,000 VNĐ. Two-week competition for VNU High School students.',
  keywords: ['AI challenge', 'IELTS scoring', 'machine learning contest', 'student competition', 'AI competition Vietnam', 'PTNK challenge'],
  url: '/contest',
})

export default function ContestPage() {
  const timeline = [
    {
      week: 'Week 1',
      title: 'Kickoff',
      items: [
        { icon: <Users className="w-4 h-4" />, text: 'Welcome Workshop: Official contest introduction' },
        { icon: <Lightbulb className="w-4 h-4" />, text: 'Technical Guide: Sample notebook demo and usage' },
        { icon: <FileText className="w-4 h-4" />, text: 'Rules Overview: Detailed regulations and evaluation criteria' }
      ]
    },
    {
      week: 'Week 1-2',
      title: 'Online Phase',
      items: [
        { icon: <Database className="w-4 h-4" />, text: 'Public train dataset (labeled) provided' },
        { icon: <Target className="w-4 h-4" />, text: 'Public test dataset (unlabeled) released' },
        { icon: <BarChart3 className="w-4 h-4" />, text: 'Real-time leaderboard updates based on public test results' }
      ]
    },
    {
      week: 'End Week 2',
      title: 'Live Finals',
      items: [
        { icon: <Users className="w-4 h-4" />, text: 'On-site competition at school' },
        { icon: <Zap className="w-4 h-4" />, text: 'Private dataset revealed' },
        { icon: <Trophy className="w-4 h-4" />, text: 'Final model evaluation and winner announcement' }
      ]
    }
  ]

  const prizes = [
    {
      rank: '1st Place',
      prize: '1,000,000 VNĐ',
      medal: 'Gold Medal',
      icon: <Trophy className="w-8 h-8 text-yellow-500" />,
      gradient: 'from-yellow-500/20 to-orange-500/20',
      border: 'border-yellow-500/30'
    },
    {
      rank: '2nd Place',
      prize: '500,000 VNĐ',
      medal: 'Silver Medal',
      icon: <Medal className="w-8 h-8 text-gray-400" />,
      gradient: 'from-gray-300/20 to-gray-500/20',
      border: 'border-gray-400/30'
    },
    {
      rank: '3rd Place',
      prize: '300,000 VNĐ',
      medal: 'Bronze Medal',
      icon: <Award className="w-8 h-8 text-amber-600" />,
      gradient: 'from-amber-600/20 to-orange-700/20',
      border: 'border-amber-600/30'
    }
  ]

  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: 'Real-World AI Application',
      description: 'Build practical AI models for IELTS Writing assessment - a skill highly relevant to students'
    },
    {
      icon: <Database className="w-6 h-6" />,
      title: 'Rich Dataset from Hugging Face',
      description: 'Primary dataset includes IELTS essays with corresponding scores, plus external data supplementation allowed'
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: 'Accuracy-Based Evaluation',
      description: 'Models evaluated on prediction accuracy using private test dataset for fair competition'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Hands-On Learning',
      description: 'Two-week intensive program with workshops, technical support, and live competition experience'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-dark-surface/50 to-primary-blue/5">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-blue/20 to-accent-cyan/20 border border-primary-blue/30 rounded-2xl mb-6">
              <Trophy className="w-8 h-8 text-primary-blue" />
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="gradient-text">PTNK AI Challenge</span>
              <br />
              <span className="text-text-primary">2025</span>
            </h1>

            <p className="text-xl text-text-secondary mb-8 max-w-3xl mx-auto leading-relaxed">
              Join our exciting challenge where talented VNU High School for the Gifted students build AI models to automatically score IELTS Writing tasks.
              Experience real-world AI development with practical applications students actually care about.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="group">
                Register Now
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="secondary" size="lg">
                Download Guidelines
                <FileText className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-20 h-20 bg-primary-blue/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 right-10 w-32 h-32 bg-accent-cyan/10 rounded-full blur-xl"></div>
        </div>
      </section>

      {/* Overview Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Challenge Overview
            </h2>
            <p className="text-lg text-text-secondary leading-relaxed">
              The Noders PTNK organizes an exciting playground for VNU High School for the Gifted students to test their skills with AI in a practical,
              relatable task. Instead of abstract problems, participants will build AI models for IELTS Writing scoring -
              a practical application many students are interested in. Contestants can supplement data from external sources
              and must achieve accurate results on our test dataset.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {features.map((feature, index) => (
              <Card key={index} variant="hover" className="text-center group hover-lift">
                <CardContent className="p-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary-blue/20 to-accent-cyan/10 border border-primary-blue/30 rounded-xl mb-4 text-primary-blue group-hover:shadow-lg group-hover:shadow-primary-blue/25 transition-all duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-3 font-mono">
                    {feature.title}
                  </h3>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Dataset Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-dark-surface/30">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                Primary Dataset
              </h2>
            </div>

            <Card className="bg-gradient-to-r from-primary-blue/10 to-accent-cyan/10 border-primary-blue/20">
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-blue/20 to-accent-cyan/20 rounded-2xl mb-4">
                      <Database className="w-8 h-8 text-primary-blue" />
                    </div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2">
                      Hugging Face Source
                    </h3>
                  </div>

                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-success/20 to-accent-cyan/20 rounded-2xl mb-4">
                      <FileText className="w-8 h-8 text-success" />
                    </div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2">
                      IELTS Essays + Scores
                    </h3>
                  </div>

                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-accent-cyan/20 to-primary-blue/20 rounded-2xl mb-4">
                      <Zap className="w-8 h-8 text-accent-cyan" />
                    </div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2">
                      External Data Allowed
                    </h3>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-dark-surface/50 rounded-lg border border-dark-border/30">
                  <p className="text-text-secondary text-center">
                    <strong className="text-text-primary">Primary Source:</strong> Curated dataset from Hugging Face containing IELTS writing samples with corresponding scores.
                    <br />
                    <strong className="text-text-primary">Enhancement Encouraged:</strong> Participants are encouraged to find additional data sources to improve model performance.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                Competition Timeline
              </h2>
              <p className="text-text-secondary text-lg">
                2-week intensive competition with key milestones
              </p>
            </div>

            <div className="space-y-8">
              {timeline.map((phase, index) => (
                <Card key={index} variant="hover" className="hover-lift overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/4 bg-gradient-to-br from-primary-blue/10 to-accent-cyan/10 p-6 border-b md:border-b-0 md:border-r border-dark-border/20">
                        <div className="text-center">
                          <Badge variant="primary" className="mb-3">
                            {phase.week}
                          </Badge>
                          <h3 className="text-xl font-bold text-text-primary font-mono">
                            {phase.title}
                          </h3>
                        </div>
                      </div>

                      <div className="md:w-3/4 p-6">
                        <div className="space-y-4">
                          {phase.items.map((item, itemIndex) => (
                            <div key={itemIndex} className="flex items-start space-x-3 group">
                              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-primary-blue/20 to-accent-cyan/10 border border-primary-blue/30 rounded-lg flex items-center justify-center text-primary-blue mt-0.5 group-hover:shadow-lg group-hover:shadow-primary-blue/25 transition-all duration-300">
                                {item.icon}
                              </div>
                              <p className="text-text-secondary leading-relaxed">
                                {item.text}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Prizes Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-dark-surface/40 to-primary-blue/5">
        <div className="container mx-auto">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                Prizes & Awards
              </h2>
              <p className="text-text-secondary text-lg mb-2">
                Substantial cash prizes and recognition for top performers
              </p>
              <p className="text-accent-cyan text-sm font-medium">
                * Prize pool may increase with additional sponsorship
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {prizes.map((prize, index) => (
                <Card key={index} className={`text-center hover-lift group relative overflow-hidden bg-gradient-to-br ${prize.gradient} border-2 ${prize.border}`}>
                  <CardContent className="p-10 relative z-10">
                    <div className="mb-8">
                      {prize.icon}
                    </div>

                    <h3 className="text-2xl font-bold text-text-primary mb-4 font-mono">
                      {prize.rank}
                    </h3>

                    <div className="text-3xl font-bold text-primary-blue mb-4">
                      {prize.prize}
                    </div>

                    <div className="flex items-center justify-center space-x-2 text-text-secondary">
                      <Gift className="w-5 h-5" />
                      <span className="text-base font-medium">{prize.medal}</span>
                    </div>
                  </CardContent>

                  {/* Spotlight effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Evaluation Criteria */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-8">
              Evaluation Criteria
            </h2>

            <Card className="bg-gradient-to-r from-primary-blue/10 to-accent-cyan/10 border-primary-blue/20">
              <CardContent className="p-12">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-blue/20 to-accent-cyan/20 border border-primary-blue/30 rounded-2xl mb-6">
                  <Target className="w-10 h-10 text-primary-blue" />
                </div>

                <h3 className="text-2xl font-bold text-text-primary mb-4">
                  Model Accuracy on Private Dataset
                </h3>

                <p className="text-text-secondary text-lg leading-relaxed">
                  Winners will be determined based on the accuracy of their AI models when evaluated against
                  our private test dataset. This ensures fair competition and prevents overfitting to public data.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-dark-surface/50">
        <div className="container mx-auto">
          <Card className="text-center bg-gradient-to-r from-primary-blue/10 to-accent-cyan/10 border-primary-blue/20">
            <CardContent className="p-12">
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                Ready to Take the Challenge?
              </h2>
              <p className="text-text-secondary text-lg mb-8 max-w-3xl mx-auto">
                Join The Noders PTNK's first AI challenge and showcase your machine learning skills.
                Build something meaningful while competing for substantial prizes!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="group">
                  Register for Contest
                  <Trophy className="ml-2 w-4 h-4 group-hover:scale-110 transition-transform" />
                </Button>
                <Link href="/contact">
                  <Button variant="secondary" size="lg">
                    Contact Organizers
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