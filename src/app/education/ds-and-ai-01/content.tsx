'use client'

import Link from 'next/link'
import { Button } from '@/components/Button'
import { Card, CardContent } from '@/components/Card'
import { Badge } from '@/components/Badge'
import { useLanguage } from '@/components/LanguageProvider'
import { translations } from './locale'
import {
  ArrowLeft,
  Users,
  Calendar,
  Clock,
  Brain,
  Database,
  Eye,
  MessageSquare,
  BarChart3,
  Zap,
  Layers,
  CheckCircle
} from 'lucide-react'
import { NeuralNetworkBackground } from '@/components/NeuralNetworkBackground'
import { LectureVideoCarousel } from '@/components/education/LectureVideoCarousel'

export function DataScienceModule1Content() {
  const { lang, setLang, localize } = useLanguage()
  const t = translations
  
  // Helper to ensure type safety when accessing translations
  const loc = (obj: { en: string; vi: string }) => obj[lang] || obj.en

  const sessions = [
    {
      number: 1,
      date: "05/04/2026",
      title: loc(t.curriculum.sessions[0].title),
      objective: loc(t.curriculum.sessions[0].objective),
      topics: [
        {
          title: loc(t.curriculum.sessions[0].topics[0].title),
          items: [
            loc(t.curriculum.sessions[0].topics[0].items[0]),
            loc(t.curriculum.sessions[0].topics[0].items[1])
          ]
        },
        {
          title: loc(t.curriculum.sessions[0].topics[1].title),
          items: [
            loc(t.curriculum.sessions[0].topics[1].items[0]),
            loc(t.curriculum.sessions[0].topics[1].items[1])
          ]
        },
        {
          title: loc(t.curriculum.sessions[0].topics[2].title),
          items: [
            loc(t.curriculum.sessions[0].topics[2].items[0])
          ]
        }
      ],
      icon: <Brain className="w-6 h-6" />,
      gradient: 'from-primary-blue/20 to-accent-cyan/10',
    },
    {
      number: 2,
      date: "08/04/2026",
      title: loc(t.curriculum.sessions[1].title),
      objective: loc(t.curriculum.sessions[1].objective),
      topics: [
        {
          title: loc(t.curriculum.sessions[1].topics[0].title),
          items: [
            loc(t.curriculum.sessions[1].topics[0].items[0]),
            loc(t.curriculum.sessions[1].topics[0].items[1]),
            loc(t.curriculum.sessions[1].topics[0].items[2])
          ]
        },
        {
          title: loc(t.curriculum.sessions[1].topics[1].title),
          items: [
            loc(t.curriculum.sessions[1].topics[1].items[0]),
            loc(t.curriculum.sessions[1].topics[1].items[1]),
            loc(t.curriculum.sessions[1].topics[1].items[2])
          ]
        }
      ],
      icon: <Database className="w-6 h-6" />,
      gradient: 'from-accent-cyan/20 to-primary-blue/10',
    },
    {
      number: 3,
      date: "12/04/2026",
      title: loc(t.curriculum.sessions[2].title),
      objective: loc(t.curriculum.sessions[2].objective),
      topics: [
        {
          title: loc(t.curriculum.sessions[2].topics[0].title),
          items: [
            loc(t.curriculum.sessions[2].topics[0].items[0]),
            loc(t.curriculum.sessions[2].topics[0].items[1])
          ]
        },
        {
          title: loc(t.curriculum.sessions[2].topics[1].title),
          items: [
            loc(t.curriculum.sessions[2].topics[1].items[0]),
            loc(t.curriculum.sessions[2].topics[1].items[1])
          ]
        },
        {
          title: loc(t.curriculum.sessions[2].topics[2].title),
          items: [
            loc(t.curriculum.sessions[2].topics[2].items[0])
          ]
        }
      ],
      icon: <Eye className="w-6 h-6" />,
      gradient: 'from-success/20 to-accent-cyan/10',
    },
    {
      number: 4,
      date: "15/04/2026",
      title: loc(t.curriculum.sessions[3].title),
      objective: loc(t.curriculum.sessions[3].objective),
      topics: [
        {
          title: loc(t.curriculum.sessions[3].topics[0].title),
          items: [
            loc(t.curriculum.sessions[3].topics[0].items[0]),
            loc(t.curriculum.sessions[3].topics[0].items[1])
          ]
        },
        {
          title: loc(t.curriculum.sessions[3].topics[1].title),
          items: [
            loc(t.curriculum.sessions[3].topics[1].items[0]),
            loc(t.curriculum.sessions[3].topics[1].items[1])
          ]
        }
      ],
      icon: <MessageSquare className="w-6 h-6" />,
      gradient: 'from-warning/20 to-success/10',
    }
  ]

  const lectureVideos = [
    {
      sessionNumber: 1,
      title: loc(t.lectureVideos.sessions[0].title),
      date: '05/04/2026',
      youtubeEmbedUrl: 'https://www.youtube.com/embed/vGEgixKR8lA',
      sessionUrl: '/education/ds-and-ai-01/session/1',
      gradient: 'from-primary-blue/30 to-accent-cyan/20',
    },
    {
      sessionNumber: 2,
      title: loc(t.lectureVideos.sessions[1].title),
      date: '08/04/2026',
      youtubeEmbedUrl: 'https://www.youtube.com/embed/81h3Bysu6oc',
      sessionUrl: '/education/ds-and-ai-01/session/2',
      gradient: 'from-accent-cyan/30 to-primary-blue/20',
    },
    {
      sessionNumber: 3,
      title: loc(t.lectureVideos.sessions[2].title),
      date: '12/04/2026',
      youtubeEmbedUrl: 'https://www.youtube.com/embed/jSQLXLTBEhE',
      sessionUrl: '/education/ds-and-ai-01/session/3',
      gradient: 'from-success/30 to-accent-cyan/20',
    },
    {
      sessionNumber: 4,
      title: loc(t.lectureVideos.sessions[3].title),
      date: '15/04/2026',
      youtubeEmbedUrl: 'https://www.youtube.com/embed/TvU_e2Kvp_Y',
      sessionUrl: '/education/ds-and-ai-01/session/4',
      gradient: 'from-warning/30 to-success/20',
    },
  ]

  const learningOutcomes = [
    { 
      title: loc(t.outcomes.items[0].title), 
      desc: loc(t.outcomes.items[0].desc),
      icon: <Brain className="w-6 h-6" />,
      color: 'text-success',
    },
    { 
      title: loc(t.outcomes.items[1].title), 
      desc: loc(t.outcomes.items[1].desc),
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'text-success',
    },
    { 
      title: loc(t.outcomes.items[2].title), 
      desc: loc(t.outcomes.items[2].desc),
      icon: <Zap className="w-6 h-6" />,
      color: 'text-success',
    },
    { 
      title: loc(t.outcomes.items[3].title), 
      desc: loc(t.outcomes.items[3].desc),
      icon: <Layers className="w-6 h-6" />,
      color: 'text-success',
    }
  ]

  return (
    <>
      <NeuralNetworkBackground />
      <div className="relative min-h-screen z-10">
        {/* Navigation & Language Toggle */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex justify-between items-center">
          <Link href="/education">
            <Button variant="ghost" className="group">
              <ArrowLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              {loc(t.hero.backButton)}
            </Button>
          </Link>

          <div className="flex bg-dark-surface/50 p-1 rounded-lg border border-dark-border/50">
            <button
              onClick={() => setLang('en')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                lang === 'en' 
                  ? 'bg-primary-blue text-white shadow-lg' 
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang('vi')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                lang === 'vi' 
                  ? 'bg-primary-blue text-white shadow-lg' 
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
              }`}
            >
              VI
            </button>
          </div>
        </div>

        {/* Hero Section */}
        <section className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto text-center">
              <Badge variant="warning" className="mb-4">
                {loc(t.hero.badge)}
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4">
                <span className="gradient-text">{loc(t.hero.title.prefix)}</span>
                <br />
                <span className="text-text-primary">{loc(t.hero.title.suffix)}</span>
              </h1>
              <p className="text-base text-text-secondary mb-5 max-w-2xl mx-auto leading-relaxed">
                {loc(t.hero.description)}
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-text-secondary">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-primary-blue" />
                  <span className="text-sm">{loc(t.hero.stats.target)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-primary-blue" />
                  <span className="text-sm">{loc(t.hero.stats.date)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-primary-blue" />
                  <span className="text-sm">{loc(t.hero.stats.sessions)}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Lecture Video Carousel */}
        <section id="lectures" className="py-12 px-4 sm:px-6 lg:px-8 relative">
          <div className="container mx-auto">
            <div className="max-w-7xl mx-auto">
              <LectureVideoCarousel videos={lectureVideos} lang={lang} />
            </div>
          </div>
        </section>

        {/* Detailed Curriculum */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-dark-surface/30">
          <div className="container mx-auto">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl font-bold text-text-primary mb-8 text-center">
                {loc(t.curriculum.heading)}
              </h2>

              <div className="space-y-8">
                {sessions.map((session, index) => (
                  <Link key={index} href={`/education/ds-and-ai-01/session/${session.number}`} className="relative group block">
                    {/* Glow Effect */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${session.gradient} rounded-2xl opacity-10 blur-xl group-hover:opacity-20 transition-opacity duration-500`}></div>

                    <Card className="relative overflow-hidden border-dark-border/40 bg-dark-surface/40 backdrop-blur-md hover:border-primary-blue/30 transition-all duration-300 cursor-pointer">
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row h-full">
                          {/* Left Column: Header */}
                          <div className={`md:w-1/3 xl:w-1/4 p-6 md:p-8 bg-gradient-to-br ${session.gradient} relative overflow-hidden flex flex-col justify-between`}>
                            {/* Giant Background Icon */}
                            <div className="absolute -bottom-6 -right-6 text-white text-opacity-10 rotate-12 z-0 pointer-events-none origin-bottom-right">
                              <div className="transform scale-[8] opacity-10">
                                {session.icon}
                              </div>
                            </div>

                            {/* Decorative Background Pattern */}
                            <div className="absolute inset-0 opacity-10 z-0">
                              <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <path d="M0 100 L100 0 L100 100 Z" fill="currentColor" />
                              </svg>
                            </div>
                            
                            <div className="relative z-10">
                              <div className="flex items-center space-x-3 mb-4">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 backdrop-blur-md text-white font-bold text-sm">
                                  {session.number}
                                </span>
                                <span className="text-sm font-medium text-white/80 uppercase tracking-widest">{loc(t.curriculum.sessionLabel)}</span>
                              </div>
                              
                              <h3 className="text-2xl font-bold text-white mb-4 leading-tight">
                                {session.title}
                              </h3>

                              <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-md text-white/90 text-sm border border-white/10">
                                <Calendar className="w-4 h-4 mr-2 text-yellow-300" />
                                <span>{session.date}</span>
                              </div>
                            </div>
                          </div>

                          {/* Right Column: Content */}
                          <div className="md:w-2/3 xl:w-3/4 p-6 md:p-8 bg-dark-bg/20">
                             <div className="flex items-center mb-6">
                                <Badge variant="default" className="text-primary-blue border border-primary-blue/30 bg-primary-blue/5">
                                  {loc(t.curriculum.topicsLabel)}
                                </Badge>
                                <div className="h-px bg-dark-border/40 flex-1 ml-4"></div>
                                <span className="ml-4 inline-flex items-center gap-1 text-xs text-text-secondary/60 group-hover:text-primary-blue transition-colors">
                                  {lang === 'vi' ? 'Xem chi tiết' : 'View details'}
                                  <ArrowLeft className="w-3 h-3 rotate-180 group-hover:translate-x-0.5 transition-transform" />
                                </span>
                             </div>

                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                              {session.topics.map((topic, topicIndex) => (
                                <div key={topicIndex} className="group/topic">
                                  <h4 className="text-lg font-semibold text-text-primary mb-3 flex items-center group-hover/topic:text-primary-blue transition-colors">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary-blue mr-2"></div>
                                    {topic.title}
                                  </h4>
                                  <ul className="space-y-2 pl-3.5 border-l border-dark-border/30">
                                    {topic.items.map((item, itemIndex) => (
                                      <li key={itemIndex} className="text-sm text-text-secondary pl-3 relative">
                                        {/* Custom bullet using pseudo like effect but inline for ease */}
                                        <span className="absolute left-0 top-2 w-1 h-1 rounded-full bg-text-secondary/50"></span>
                                        {item}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                             </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Course Ended Notice */}
        <section id="register" className="py-12 px-4 sm:px-6 lg:px-8 bg-dark-surface/30">
          <div className="container mx-auto">
            <div className="max-w-2xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-warning/10 border border-warning/30 text-warning text-sm font-semibold mb-6">
                <CheckCircle className="w-4 h-4" />
                {loc(t.registration.ended.badge)}
              </div>
              <h2 className="text-3xl font-bold text-text-primary mb-4">
                {loc(t.registration.ended.heading)}
              </h2>
              <p className="text-text-secondary leading-relaxed">
                {loc(t.registration.ended.subheading)}
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
