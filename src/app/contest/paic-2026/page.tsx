import Link from 'next/link'
import { Metadata } from 'next'
import { Button } from '@/components/Button'
import { Card, CardContent } from '@/components/Card'
import { Badge } from '@/components/Badge'
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'
import {
  ArrowLeft,
  Users,
  Calendar,
  Target,
  Trophy,
  Zap,
  Brain,
  Database,
  Award,
  CheckCircle,
  ExternalLink,
  FileText,
  Lightbulb,
  BarChart3,
  Gift,
  Medal
} from 'lucide-react'
import { NeuralNetworkBackground } from '@/components/NeuralNetworkBackground'

export const metadata: Metadata = generateSEOMetadata({
  title: 'PTNK AI Challenge 2026 - Public Competition',
  description: 'Join The Noders PTNK AI Challenge 2026! Build AI models for IELTS Writing scoring. Cash prizes up to 1,000,000 VNĐ. Two-week competition for VNU High School students.',
  keywords: ['AI challenge', 'IELTS scoring', 'machine learning contest', 'student competition', 'AI competition Vietnam', 'PTNK challenge'],
  url: '/contest/paic-2026',
})

export default function PAIC2026Page() {
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
      title: 'Build Something Real',
      description: 'No toy datasets or fake problems—create an AI that scores real IELTS essays, tackling a challenge that matters to students like you'
    },
    {
      icon: <Database className="w-6 h-6" />,
      title: 'Rich, Flexible Dataset',
      description: 'Curated IELTS essays from Hugging Face as your foundation, but creative minds can supplement with external data to gain an edge'
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: 'Pure Performance Wins',
      description: 'Your model\'s accuracy on our private test set determines everything—no fluff, just results that speak for themselves'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Full Support System',
      description: 'Kickoff workshops, technical guides, live finals, and a community of competitors all pushing each other to improve'
    }
  ]

  const learningTopics = [
    'Natural Language Processing (NLP) fundamentals',
    'IELTS Writing scoring criteria and analysis',
    'Text preprocessing and feature extraction',
    'Machine learning model development',
    'Model evaluation and optimization',
    'Real-world AI project workflow'
  ]

  return (
    <>
      <NeuralNetworkBackground />
      <div className="relative min-h-screen z-10">
        {/* Back Button */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <Link href="/contest">
            <Button variant="ghost" className="group">
              <ArrowLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Competitions
            </Button>
          </Link>
        </div>

        {/* Hero Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto text-center">
              <Badge variant="warning" className="mb-6">
                Public • Coming Soon
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6">
                <span className="gradient-text">PTNK AI Challenge</span>
                <br />
                <span className="text-text-primary">2026</span>
              </h1>
              <p className="text-xl text-text-secondary mb-8 max-w-3xl mx-auto leading-relaxed">
                The Noders PTNK's flagship public competition where VNU High School students
                transform from AI enthusiasts into builders. Create IELTS Writing scoring models,
                compete for serious cash prizes, and experience what real AI development feels like—
                all while working on something you actually understand and care about.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-text-secondary">
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-primary-blue" />
                  <span>Open Registration</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-primary-blue" />
                  <span>29 Dec 2025 - 14 Jan 2026</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Overview Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-text-primary mb-6 text-center">
                Competition Overview
              </h2>
              <Card className="bg-gradient-to-r from-primary-blue/10 to-accent-cyan/10 border-primary-blue/20 mb-8">
                <CardContent className="p-8">
                  <p className="text-text-secondary text-lg leading-relaxed mb-4">
                    Forget boring theoretical exercises. PAIC 2026 challenges you to build something that
                    actually matters—an AI that scores IELTS Writing essays. This isn't just another school
                    project; it's a taste of real AI engineering where you'll face actual challenges,
                    make real decisions, and see your model compete against others in real-time.
                  </p>
                  <p className="text-text-secondary text-lg leading-relaxed mb-4">
                    Over two intense weeks, you'll go from dataset to deployed model, experiencing the
                    complete AI development cycle. Think you can outsmart the leaderboard? There's only
                    one way to find out—and over 1.8 million VNĐ in prizes waiting for those who do.
                  </p>
                  <div className="bg-dark-surface/50 rounded-lg p-6 border border-dark-border/30">
                    <p className="text-text-secondary">
                      <strong className="text-text-primary">Target Audience:</strong> VNU High School for the Gifted
                      students passionate about AI and machine learning. Whether you've trained models before or
                      you're ready to dive into your first competition—if you're curious and committed, you belong here.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-dark-surface/30">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-text-primary mb-8 text-center">
                Competition Timeline
              </h2>
              <p className="text-text-secondary text-center mb-8">
                2-week intensive competition with key milestones
              </p>

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

        {/* Competition Format */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-text-primary mb-8 text-center">
                Competition Format
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card variant="hover" className="hover-lift">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary-blue/20 to-accent-cyan/10 border border-primary-blue/30 rounded-xl flex items-center justify-center text-primary-blue">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-text-primary mb-2">
                          Individual or Team
                        </h3>
                        <p className="text-text-secondary text-sm leading-relaxed">
                          Compete individually or form teams of up to 3 members
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card variant="hover" className="hover-lift">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary-blue/20 to-accent-cyan/10 border border-primary-blue/30 rounded-xl flex items-center justify-center text-primary-blue">
                        <BarChart3 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-text-primary mb-2">
                          Two-Phase Structure
                        </h3>
                        <p className="text-text-secondary text-sm leading-relaxed">
                          Online phase with public leaderboard, followed by live finals
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Dataset Info */}
              <Card className="bg-gradient-to-r from-primary-blue/10 to-accent-cyan/10 border-primary-blue/20">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-text-primary mb-6 text-center">
                    Primary Dataset
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center mb-6">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-blue/20 to-accent-cyan/20 rounded-2xl mb-4">
                        <Database className="w-8 h-8 text-primary-blue" />
                      </div>
                      <h4 className="text-lg font-semibold text-text-primary mb-2">
                        Hugging Face Source
                      </h4>
                    </div>

                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-success/20 to-accent-cyan/20 rounded-2xl mb-4">
                        <FileText className="w-8 h-8 text-success" />
                      </div>
                      <h4 className="text-lg font-semibold text-text-primary mb-2">
                        IELTS Essays + Scores
                      </h4>
                    </div>

                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-accent-cyan/20 to-primary-blue/20 rounded-2xl mb-4">
                        <Zap className="w-8 h-8 text-accent-cyan" />
                      </div>
                      <h4 className="text-lg font-semibold text-text-primary mb-2">
                        External Data Allowed
                      </h4>
                    </div>
                  </div>

                  <div className="p-6 bg-dark-surface/50 rounded-lg border border-dark-border/30">
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

        {/* Learning Content */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-dark-surface/30">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-text-primary mb-8 text-center">
                What You'll Learn
              </h2>
              <Card className="bg-gradient-to-r from-primary-blue/10 to-accent-cyan/10 border-primary-blue/20">
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {learningTopics.map((topic, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                        <p className="text-text-secondary">{topic}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Prizes Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-text-primary mb-8 text-center">
                Prizes & Awards
              </h2>
              <p className="text-text-secondary text-center mb-2">
                Substantial cash prizes and recognition for top performers
              </p>
              <p className="text-accent-cyan text-center text-sm font-medium mb-8">
                * Prize pool may increase with additional sponsorship
              </p>

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
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-dark-surface/30">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-text-primary mb-8">
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
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">
            <Card className="text-center bg-gradient-to-r from-primary-blue/10 to-accent-cyan/10 border-primary-blue/20">
              <CardContent className="p-12">
                <h2 className="text-3xl font-bold text-text-primary mb-4">
                  Ready to Take the Challenge?
                </h2>
                <p className="text-text-secondary text-lg mb-8 max-w-2xl mx-auto">
                  Join The Noders PTNK's flagship AI challenge and showcase your machine learning skills.
                  Build something meaningful while competing for substantial prizes!
                </p>
                <Link href="https://the-noders-competition-platform.vercel.app/" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="group">
                    Register Now
                    <ExternalLink className="ml-2 w-4 h-4 group-hover:scale-110 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </>
  )
}
