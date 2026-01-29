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
  Target,
  BookOpen,
  CheckCircle,
  Building2,
  Clock,
  FileText,
  Download,
  Presentation,
  Code,
  Brain,
  Database,
  Eye,
  MessageSquare,
  BarChart3,
  Zap,
  Layers,
  Search
} from 'lucide-react'
import { NeuralNetworkBackground } from '@/components/NeuralNetworkBackground'

export function DataScienceModule1Content() {
  const { lang, setLang, localize } = useLanguage()
  const t = translations
  
  // Helper to ensure type safety when accessing translations
  const loc = (obj: { en: string; vi: string }) => obj[lang] || obj.en

  const sessions = [
    {
      number: 1,
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
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">
            <div className="max-w-6xl mx-auto text-center">
              <Badge variant="warning" className="mb-6">
                {loc(t.hero.badge)}
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6">
                <span className="gradient-text">{loc(t.hero.title.prefix)}</span>
                <br />
                <span className="text-text-primary">{loc(t.hero.title.suffix)}</span>
              </h1>
              <p className="text-xl text-text-secondary mb-8 max-w-3xl mx-auto leading-relaxed">
                {loc(t.hero.description)}
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-text-secondary">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-primary-blue" />
                  <span>{loc(t.hero.stats.target)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-primary-blue" />
                  <span>{loc(t.hero.stats.date)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-primary-blue" />
                  <span>{loc(t.hero.stats.sessions)}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Overview & Outcomes */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 relative">
          <div className="container mx-auto">
            <div className="max-w-7xl mx-auto">
              {/* Flex Container for Landscape Layout */}
              <div className="flex flex-col xl:flex-row gap-8">
                
                {/* Overview Card */}
                <div className="flex-1">
                  <div className="relative group h-full">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-blue to-accent-cyan rounded-2xl opacity-10 blur-xl group-hover:opacity-20 transition-opacity duration-500"></div>
                    <Card className="relative overflow-hidden border-dark-border/40 bg-dark-surface/40 backdrop-blur-md h-full">
                      <CardContent className="p-8">
                        <h2 className="text-2xl font-bold text-text-primary mb-6 text-center">
                          {loc(t.overview.heading)}
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex flex-col items-center text-center p-4 rounded-xl bg-dark-surface/30 hover:bg-dark-surface/50 border border-transparent hover:border-primary-blue/20 transition-all">
                            <div className="w-12 h-12 bg-primary-blue/10 rounded-full flex items-center justify-center text-primary-blue mb-3">
                              <Target className="w-6 h-6" />
                            </div>
                            <h3 className="text-sm font-bold text-text-primary mb-1">{loc(t.overview.cards.target.title)}</h3>
                            <p className="text-text-secondary text-xs leading-relaxed">
                             {loc(t.overview.cards.target.desc)}
                            </p>
                          </div>

                          <div className="flex flex-col items-center text-center p-4 rounded-xl bg-dark-surface/30 hover:bg-dark-surface/50 border border-transparent hover:border-primary-blue/20 transition-all">
                            <div className="w-12 h-12 bg-primary-blue/10 rounded-full flex items-center justify-center text-primary-blue mb-3">
                              <BookOpen className="w-6 h-6" />
                            </div>
                            <h3 className="text-sm font-bold text-text-primary mb-1">{loc(t.overview.cards.approach.title)}</h3>
                            <p className="text-text-secondary text-xs leading-relaxed">
                              {loc(t.overview.cards.approach.desc)}
                            </p>
                          </div>

                          <div className="flex flex-col items-center text-center p-4 rounded-xl bg-dark-surface/30 hover:bg-dark-surface/50 border border-transparent hover:border-primary-blue/20 transition-all">
                            <div className="w-12 h-12 bg-primary-blue/10 rounded-full flex items-center justify-center text-primary-blue mb-3">
                              <Building2 className="w-6 h-6" />
                            </div>
                            <h3 className="text-sm font-bold text-text-primary mb-1">{loc(t.overview.cards.organizers.title)}</h3>
                            <p className="text-text-secondary text-xs leading-relaxed">
                              {loc(t.overview.cards.organizers.desc)}
                            </p>
                          </div>

                          <div className="flex flex-col items-center text-center p-4 rounded-xl bg-dark-surface/30 hover:bg-dark-surface/50 border border-transparent hover:border-primary-blue/20 transition-all">
                            <div className="w-12 h-12 bg-primary-blue/10 rounded-full flex items-center justify-center text-primary-blue mb-3">
                              <Clock className="w-6 h-6" />
                            </div>
                            <h3 className="text-sm font-bold text-text-primary mb-1">{loc(t.overview.cards.duration.title)}</h3>
                            <p className="text-text-secondary text-xs leading-relaxed">
                              {loc(t.overview.cards.duration.desc)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Learning Outcomes Card */}
                <div className="flex-1">
                  <div className="relative group h-full">
                    <div className="absolute inset-0 bg-gradient-to-br from-success to-accent-cyan rounded-2xl opacity-10 blur-xl group-hover:opacity-20 transition-opacity duration-500"></div>
                    <Card className="relative overflow-hidden border-dark-border/40 bg-dark-surface/40 backdrop-blur-md h-full">
                      <CardContent className="p-8">
                        <h2 className="text-2xl font-bold text-text-primary mb-6 text-center">
                          {loc(t.outcomes.heading)}
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
                          {learningOutcomes.map((outcome, index) => (
                            <div key={index} className="flex flex-col items-center text-center p-4 rounded-xl bg-dark-surface/30 hover:bg-dark-surface/50 border border-transparent hover:border-white/10 transition-all h-full justify-center">
                              <div className={`w-12 h-12 bg-white/5 rounded-full flex items-center justify-center ${outcome.color} mb-3 group-hover:scale-110 transition-transform`}>
                                {outcome.icon}
                              </div>
                              <h3 className="text-sm font-bold text-text-primary mb-1">{outcome.title}</h3>
                              <p className="text-text-secondary text-xs leading-relaxed">{outcome.desc}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

              </div>
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
              <p className="text-text-secondary text-center mb-12">
                {loc(t.curriculum.subheading)}
              </p>

              <div className="space-y-8">
                {sessions.map((session, index) => (
                  <div key={index} className="relative group">
                    {/* Glow Effect */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${session.gradient} rounded-2xl opacity-10 blur-xl group-hover:opacity-20 transition-opacity duration-500`}></div>
                    
                    <Card className="relative overflow-hidden border-dark-border/40 bg-dark-surface/40 backdrop-blur-md hover:border-primary-blue/30 transition-all duration-300">
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
                                <Target className="w-4 h-4 mr-2 text-accent-cyan" />
                                <span className="line-clamp-2 md:line-clamp-none leading-snug">{session.objective}</span>
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
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Course Material */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-text-primary mb-8 text-center">
                {loc(t.materials.heading)}
              </h2>

              <div className="space-y-12">
                {/* Lecture Notes */}
                <div>
                  <h3 className="text-xl font-bold text-text-primary mb-6 flex items-center">
                    <FileText className="w-6 h-6 mr-3 text-primary-blue" />
                    {loc(t.materials.sections.notes.title)}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((num) => (
                      <div key={`note-${num}`} className="group relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary-blue to-accent-cyan rounded-xl opacity-20 blur-md group-hover:opacity-40 transition-opacity duration-300"></div>
                        <Card className="relative h-full bg-dark-bg/80 backdrop-blur-sm border-primary-blue/30 hover:border-primary-blue/60 transition-colors">
                          <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                            <div className="w-12 h-12 rounded-full bg-primary-blue/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                              <FileText className="w-6 h-6 text-primary-blue" />
                            </div>
                            <span className="text-text-primary font-bold text-lg mb-1">{loc(t.materials.sections.notes.itemPrefix)} {num}</span>
                            <span className="text-text-secondary text-sm">{loc(t.materials.sections.notes.sub)}</span>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Teaching Slides */}
                <div>
                  <h3 className="text-xl font-bold text-text-primary mb-6 flex items-center">
                    <Presentation className="w-6 h-6 mr-3 text-accent-cyan" />
                    {loc(t.materials.sections.slides.title)}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((num) => (
                      <div key={`slide-${num}`} className="group relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-accent-cyan to-primary-blue rounded-xl opacity-20 blur-md group-hover:opacity-40 transition-opacity duration-300"></div>
                        <Card className="relative h-full bg-dark-bg/80 backdrop-blur-sm border-accent-cyan/30 hover:border-accent-cyan/60 transition-colors">
                          <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                            <div className="w-12 h-12 rounded-full bg-accent-cyan/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                              <Presentation className="w-6 h-6 text-accent-cyan" />
                            </div>
                            <span className="text-text-primary font-bold text-lg mb-1">{loc(t.materials.sections.slides.itemPrefix)} {num}</span>
                            <span className="text-text-secondary text-sm">{loc(t.materials.sections.slides.sub)}</span>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Practice Notebooks */}
                <div>
                  <h3 className="text-xl font-bold text-text-primary mb-6 flex items-center">
                    <Code className="w-6 h-6 mr-3 text-success" />
                    {loc(t.materials.sections.notebooks.title)}
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {t.materials.sections.notebooks.items.map((item, idx) => (
                      <Card key={idx} variant="hover" className={`hover-lift bg-gradient-to-br ${idx === 0 ? 'from-primary-blue/10 to-accent-cyan/5 border-primary-blue/30' : idx === 1 ? 'from-accent-cyan/10 to-primary-blue/5 border-accent-cyan/30' : 'from-success/10 to-accent-cyan/5 border-success/30'} h-full`}>
                        <CardContent className="p-6 flex flex-col h-full">
                          <div className="flex items-start space-x-4 mb-4">
                            <div className={`flex-shrink-0 w-12 h-12 bg-gradient-to-br ${idx === 0 ? 'from-primary-blue/30 to-accent-cyan/20 border-primary-blue/40 text-primary-blue' : idx === 1 ? 'from-accent-cyan/30 to-primary-blue/20 border-accent-cyan/40 text-accent-cyan' : 'from-success/30 to-accent-cyan/20 border-success/40 text-success'} border rounded-xl flex items-center justify-center`}>
                              <Code className="w-6 h-6" />
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <p className="text-lg font-bold text-text-primary font-mono mb-2 truncate" title={item.title}>
                                {item.title}
                              </p>
                              <p className="text-sm text-text-secondary">
                                {loc(item.sub)}
                              </p>
                            </div>
                          </div>
                          <div className="pt-4 border-t border-dark-border/30 mt-auto">
                            <p className="text-xs text-text-secondary">
                              {loc(item.desc)}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
