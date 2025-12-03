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
  BarChart3
} from 'lucide-react'
import { NeuralNetworkBackground } from '@/components/NeuralNetworkBackground'

export const metadata: Metadata = generateSEOMetadata({
  title: 'Introduction to Data Science - Module 1',
  description: 'Build a solid foundation in data science with comprehensive training on structured data, computer vision, and NLP. 4-session mini-course for high school students.',
  keywords: ['data science course', 'machine learning training', 'student workshop', 'Python data analysis', 'AI education'],
  url: '/education/data-science-module-1',
})

export default function DataScienceModule1Page() {
  const sessions = [
    {
      number: 1,
      title: 'Data Science Thinking & Standard Workflows',
      objective: 'Understand the big picture and professional working processes',
      topics: [
        {
          title: 'Overview of Data Science',
          items: [
            'Definition and role in the digital era',
            'Distinguishing Data Analytics vs Data Science'
          ]
        },
        {
          title: 'The Three Core Data Pillars',
          items: [
            'Structured Data',
            'Computer Vision',
            'Natural Language Processing (NLP)'
          ]
        },
        {
          title: 'Standard Data Processing Workflow (End-to-End)',
          items: [
            'Data Collection',
            'Data Pre-processing: Cleaning and standardization',
            'Modeling & Analysis',
            'Visualization & Reporting'
          ]
        },
        {
          title: 'Case Study',
          items: [
            'IELTS score data analysis'
          ]
        }
      ],
      icon: <Brain className="w-6 h-6" />,
      gradient: 'from-primary-blue/20 to-accent-cyan/10',
      materials: null // Will be added after session
    },
    {
      number: 2,
      title: 'Data Processing & Visualization Techniques',
      objective: 'Master tools for working with tabular data',
      topics: [
        {
          title: 'Analysis Tool Ecosystem',
          items: [
            'SQL: Query and extract data from large systems',
            'Pandas (Python): Powerful data processing and analysis library',
            'Matplotlib/Tableau: Data visualization tools'
          ]
        },
        {
          title: 'Hands-on Practice',
          items: [
            'Data querying techniques with SQL (SELECT, WHERE...)',
            'Data cleaning and transformation with Pandas DataFrame',
            'Building visualization charts (Bar Chart, Line Plot) to find insights'
          ]
        }
      ],
      icon: <Database className="w-6 h-6" />,
      gradient: 'from-accent-cyan/20 to-primary-blue/10',
      materials: null // Will be added after session
    },
    {
      number: 3,
      title: 'Computer Vision & Basic Machine Learning',
      objective: 'Understand how computers process images and classification algorithms',
      topics: [
        {
          title: 'Digital Image Fundamentals',
          items: [
            'Representing images as numerical matrices (Pixel Matrix)',
            'Image preprocessing techniques: Resize, Grayscale, Normalization'
          ]
        },
        {
          title: 'K-Nearest Neighbors (KNN) Algorithm',
          items: [
            'Operating principles and applications in classification problems',
            'Practice: Build models to predict shirt sizes and recognize handwritten digits'
          ]
        },
        {
          title: 'Introduction to Deep Learning',
          items: [
            'Convolutional Neural Networks (CNN) and advantages over traditional algorithms'
          ]
        }
      ],
      icon: <Eye className="w-6 h-6" />,
      gradient: 'from-success/20 to-accent-cyan/10',
      materials: null // Will be added after session
    },
    {
      number: 4,
      title: 'Natural Language Processing & Model Evaluation',
      objective: 'Approach text data and AI model evaluation standards',
      topics: [
        {
          title: 'Basic NLP Techniques',
          items: [
            'Text cleaning process',
            'Tokenization and normalization techniques (Stemming/Lemmatization)'
          ]
        },
        {
          title: 'Text Representation Methods',
          items: [
            'Bag of Words & TF-IDF',
            'Word Embedding (Word2Vec): Vectorizing word semantics'
          ]
        },
        {
          title: 'Model Evaluation Metrics',
          items: [
            'Accuracy, Precision, Recall, F1-Score',
            'Analyzing meaning and choosing appropriate metrics for each problem (Examples: Healthcare, Finance)'
          ]
        }
      ],
      icon: <MessageSquare className="w-6 h-6" />,
      gradient: 'from-warning/20 to-success/10',
      materials: null // Will be added after session
    }
  ]

  const learningOutcomes = [
    'Form correct data analysis thinking',
    'Understand the standard workflow of a Data Scientist',
    'Gain foundational knowledge to continue developing at more advanced levels',
    'Practical experience with Python, Jupyter Notebook, and industry-standard tools',
    'Comprehensive overview of all three data pillars (Structured, Vision, NLP)',
    'Ability to evaluate and choose appropriate models for different problem types'
  ]

  const tools = [
    { name: 'Python', description: 'Primary programming language' },
    { name: 'Jupyter Notebook', description: 'Interactive development environment' },
    { name: 'Pandas & SQL', description: 'Data manipulation and querying' },
    { name: 'Matplotlib', description: 'Data visualization' },
    { name: 'Scikit-learn', description: 'Machine learning algorithms' }
  ]

  return (
    <>
      <NeuralNetworkBackground />
      <div className="relative min-h-screen z-10">
        {/* Back Button */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <Link href="/education">
            <Button variant="ghost" className="group">
              <ArrowLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Education
            </Button>
          </Link>
        </div>

        {/* Hero Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto text-center">
              <Badge variant="warning" className="mb-6">
                Mini-Course • Coming Soon
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6">
                <span className="gradient-text">Introduction to Data Science</span>
                <br />
                <span className="text-text-primary">Module 1</span>
              </h1>
              <p className="text-xl text-text-secondary mb-8 max-w-3xl mx-auto leading-relaxed">
                Build a solid foundation in data science thinking and gain comprehensive knowledge of
                the 3 pillars of data (Structured Data, Computer Vision, NLP). This course focuses on
                problem fundamentals, standard data processing workflows, and practical applications
                to give you the most hands-on perspective of the field.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-text-secondary">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-primary-blue" />
                  <span>High School Students (Grade 10-11)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-primary-blue" />
                  <span>January 2026</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-primary-blue" />
                  <span>4 Sessions × 1.5 hours</span>
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
                Course Overview
              </h2>
              <Card className="bg-gradient-to-r from-primary-blue/10 to-accent-cyan/10 border-primary-blue/20">
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary-blue/20 to-accent-cyan/10 border border-primary-blue/30 rounded-xl flex items-center justify-center text-primary-blue">
                        <Target className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-text-primary mb-2">Target Audience</h3>
                        <p className="text-text-secondary text-sm leading-relaxed">
                          High school students (Grade 10-11) interested in Data Science who want to gain
                          an overview to assess their fit and plan their future development path.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary-blue/20 to-accent-cyan/10 border border-primary-blue/30 rounded-xl flex items-center justify-center text-primary-blue">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-text-primary mb-2">Approach</h3>
                        <p className="text-text-secondary text-sm leading-relaxed">
                          Build solid thinking foundation and practical skills for beginners. Focus on
                          problem fundamentals, standard workflows, and real-world applications.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary-blue/20 to-accent-cyan/10 border border-primary-blue/30 rounded-xl flex items-center justify-center text-primary-blue">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-text-primary mb-2">Organizers</h3>
                        <p className="text-text-secondary text-sm leading-relaxed">
                          The Noders PTNK × PRISEE
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary-blue/20 to-accent-cyan/10 border border-primary-blue/30 rounded-xl flex items-center justify-center text-primary-blue">
                        <Clock className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-text-primary mb-2">Duration</h3>
                        <p className="text-text-secondary text-sm leading-relaxed">
                          4 sessions × 1 hour 30 minutes
                          <br />
                          Scheduled for January 2026
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Detailed Curriculum */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-dark-surface/30">
          <div className="container mx-auto">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-text-primary mb-8 text-center">
                Course Curriculum
              </h2>
              <p className="text-text-secondary text-center mb-12">
                4 comprehensive sessions, each 1 hour 30 minutes
              </p>

              <div className="space-y-6">
                {sessions.map((session, index) => (
                  <Card key={index} variant="hover" className="hover-lift overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col lg:flex-row">
                        {/* Session Header */}
                        <div className={`lg:w-1/3 bg-gradient-to-br ${session.gradient} p-8 border-b lg:border-b-0 lg:border-r border-dark-border/20`}>
                          <div className="flex items-start space-x-4 mb-4">
                            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary-blue/30 to-accent-cyan/20 border border-primary-blue/40 rounded-xl flex items-center justify-center text-primary-blue">
                              {session.icon}
                            </div>
                            <div>
                              <Badge variant="primary" className="mb-3">
                                Session {session.number}
                              </Badge>
                            </div>
                          </div>

                          <h3 className="text-xl font-bold text-text-primary mb-3 leading-tight">
                            {session.title}
                          </h3>

                          <div className="flex items-start space-x-2 text-text-secondary mb-6">
                            <Target className="w-4 h-4 flex-shrink-0 mt-1 text-primary-blue" />
                            <p className="text-sm italic">
                              <strong className="text-text-primary">Objective:</strong> {session.objective}
                            </p>
                          </div>

                          {/* Materials Section - Will be populated after session */}
                          {session.materials ? (
                            <div className="mt-6 pt-6 border-t border-dark-border/30">
                              <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center">
                                <FileText className="w-4 h-4 mr-2 text-primary-blue" />
                                Course Materials
                              </h4>
                              <div className="space-y-2">
                                {session.materials.lecture && (
                                  <a
                                    href={session.materials.lecture}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center space-x-2 text-xs text-text-secondary hover:text-primary-blue transition-colors group"
                                  >
                                    <FileText className="w-3 h-3" />
                                    <span className="group-hover:underline">Lecture Notes</span>
                                    <Download className="w-3 h-3" />
                                  </a>
                                )}
                                {session.materials.slides && (
                                  <a
                                    href={session.materials.slides}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center space-x-2 text-xs text-text-secondary hover:text-primary-blue transition-colors group"
                                  >
                                    <Presentation className="w-3 h-3" />
                                    <span className="group-hover:underline">Presentation Slides</span>
                                    <Download className="w-3 h-3" />
                                  </a>
                                )}
                                {session.materials.notebook && (
                                  <a
                                    href={session.materials.notebook}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center space-x-2 text-xs text-text-secondary hover:text-primary-blue transition-colors group"
                                  >
                                    <Code className="w-3 h-3" />
                                    <span className="group-hover:underline">Practice Notebook</span>
                                    <Download className="w-3 h-3" />
                                  </a>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="mt-6 pt-6 border-t border-dark-border/30">
                              <p className="text-xs text-text-secondary italic">
                                Materials will be available after the session
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Session Content */}
                        <div className="lg:w-2/3 p-8">
                          <h4 className="text-sm font-semibold text-text-primary mb-4 uppercase tracking-wide">
                            Topics Covered
                          </h4>
                          <div className="space-y-6">
                            {session.topics.map((topic, topicIndex) => (
                              <div key={topicIndex}>
                                <h5 className="text-base font-semibold text-text-primary mb-3">
                                  {topic.title}
                                </h5>
                                <ul className="space-y-2">
                                  {topic.items.map((item, itemIndex) => (
                                    <li key={itemIndex} className="flex items-start space-x-2">
                                      <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-success" />
                                      <span className="text-sm text-text-secondary">{item}</span>
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
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Tools & Environment */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-text-primary mb-8 text-center">
                Tools & Practice Environment
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tools.map((tool, index) => (
                  <Card key={index} variant="hover" className="hover-lift">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary-blue/20 to-accent-cyan/10 border border-primary-blue/30 rounded-lg flex items-center justify-center text-primary-blue">
                          <Code className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-text-primary mb-1">
                            {tool.name}
                          </h3>
                          <p className="text-sm text-text-secondary">
                            {tool.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-8">
                <h3 className="text-2xl font-bold text-text-primary mb-6 text-center">
                  Practice Notebooks Included
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card variant="hover" className="hover-lift bg-gradient-to-br from-primary-blue/10 to-accent-cyan/5 border-primary-blue/30">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4 mb-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary-blue/30 to-accent-cyan/20 border border-primary-blue/40 rounded-xl flex items-center justify-center text-primary-blue">
                          <Code className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <p className="text-lg font-bold text-text-primary font-mono mb-2">
                            Lecture_2_Demo.ipynb
                          </p>
                          <p className="text-sm text-text-secondary">
                            SQL, Pandas & Visualization
                          </p>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-dark-border/30">
                        <p className="text-xs text-text-secondary">
                          Hands-on practice with data querying, manipulation, and creating insightful visualizations
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card variant="hover" className="hover-lift bg-gradient-to-br from-accent-cyan/10 to-primary-blue/5 border-accent-cyan/30">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4 mb-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-accent-cyan/30 to-primary-blue/20 border border-accent-cyan/40 rounded-xl flex items-center justify-center text-accent-cyan">
                          <Code className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <p className="text-lg font-bold text-text-primary font-mono mb-2">
                            Lecture_3_Demo.ipynb
                          </p>
                          <p className="text-sm text-text-secondary">
                            KNN Algorithm & Computer Vision
                          </p>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-dark-border/30">
                        <p className="text-xs text-text-secondary">
                          Build classification models and explore image processing fundamentals
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Learning Outcomes */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-dark-surface/30">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-text-primary mb-8 text-center">
                What You'll Achieve
              </h2>

              <Card className="bg-gradient-to-r from-primary-blue/10 to-accent-cyan/10 border-primary-blue/20">
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {learningOutcomes.map((outcome, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                        <p className="text-text-secondary">{outcome}</p>
                      </div>
                    ))}
                  </div>
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
                  Interested in This Course?
                </h2>
                <p className="text-text-secondary text-lg mb-8 max-w-2xl mx-auto">
                  Registration will open soon. Get in touch to stay updated or learn more
                  about our educational programs.
                </p>
                <div className="flex justify-center gap-4">
                  <Link href="/contact">
                    <Button size="lg" className="group">
                      Contact Us
                      <ArrowLeft className="ml-2 w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/education">
                    <Button size="lg" variant="secondary" className="group">
                      View All Programs
                      <ArrowLeft className="ml-2 w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />
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
