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
  Trophy,
  Laptop,
  Upload,
  Database,
  Award,
  CheckCircle,
  ExternalLink,
  FileText,
  Medal,
  Coins,
  Star,
  PlayCircle
} from 'lucide-react'
import { NeuralNetworkBackground } from '@/components/NeuralNetworkBackground'

export function NAIC2025Content() {
  const { lang, setLang, localize } = useLanguage()
  const t = translations

  // Helper to get localized string from dict
  const loc = (obj: { en: string; vi: string }) => obj[lang] || obj.en

  const timeline = [
    { date: loc(t.timeline.items[0].date), event: loc(t.timeline.items[0].event), status: 'completed' },
    { date: loc(t.timeline.items[1].date), event: loc(t.timeline.items[1].event), status: 'completed' },
    { date: loc(t.timeline.items[2].date), event: loc(t.timeline.items[2].event), status: 'completed' }
  ]

  const formatDetails = [
    {
      icon: <Laptop className="w-5 h-5" />,
      title: loc(t.format.details[0].title),
      description: loc(t.format.details[0].description)
    },
    {
      icon: <Upload className="w-5 h-5" />,
      title: loc(t.format.details[1].title),
      description: loc(t.format.details[1].description)
    },
    {
      icon: <Database className="w-5 h-5" />,
      title: loc(t.format.details[2].title),
      description: loc(t.format.details[2].description)
    },
    {
      icon: <FileText className="w-5 h-5" />,
      title: loc(t.format.details[3].title),
      description: loc(t.format.details[3].description)
    }
  ]

  const leaderboard = [
    { rank: 1, name: 'Nguyễn Vũ Trọng Nhân', submissions: 5, mae: 0.3487 },
    { rank: 2, name: 'Trương Hoàng Tấn Dũng', submissions: 36, mae: 0.4511 },
    { rank: 3, name: 'Châu Phúc Khang', submissions: 11, mae: 0.4563 },
    { rank: 4, name: 'Đoàn Văn Quyết', submissions: 14, mae: 0.4820 },
    { rank: 5, name: 'Đào Ngọc Minh Tâm', submissions: 4, mae: 0.4862 },
    { rank: 6, name: 'Nguyễn Ngọc Minh Tâm', submissions: 12, mae: 0.5210 },
    { rank: 7, name: 'Nguyễn Ngô Minh Dương', submissions: 2, mae: 0.5285 },
    { rank: 8, name: 'Đặng Trần Thiên Phúc', submissions: 1, mae: 0.5683 },
    { rank: 9, name: 'Huỳnh Quang Phú', submissions: 3, mae: 0.6454 },
    { rank: 10, name: 'Lê Minh Trung', submissions: 1, mae: 0.8159 },
    { rank: 11, name: 'Hồ Bảo Phúc', submissions: 2, mae: 0.8451 },
    { rank: 12, name: 'Hà Lan Viên', submissions: 1, mae: 0.8939 },
    { rank: 13, name: 'Trần Phúc Thái', submissions: 1, mae: 0.9067 },
    { rank: 14, name: 'Việt Tiến', submissions: 1, mae: 0.9148 },
    { rank: 15, name: loc(t.leaderboard.baselineName), submissions: 2, mae: 0.9149, isBaseline: true },
    { rank: 16, name: 'Trần Hoàng Thiên Phúc', submissions: 1, mae: 1.3554 }
  ]

  const prizes = [
    {
      rank: loc(t.prizes.list[0].rank),
      prize: loc(t.prizes.list[0].prize),
      bonus: loc(t.prizes.list[0].bonus),
      icon: <Trophy className="w-8 h-8 text-yellow-500" />,
      gradient: 'from-yellow-500/20 to-orange-500/20',
      border: 'border-yellow-500/30'
    },
    {
      rank: loc(t.prizes.list[1].rank),
      prize: loc(t.prizes.list[1].prize),
      bonus: loc(t.prizes.list[1].bonus),
      icon: <Medal className="w-8 h-8 text-gray-400" />,
      gradient: 'from-gray-300/20 to-gray-500/20',
      border: 'border-gray-400/30'
    },
    {
      rank: loc(t.prizes.list[2].rank),
      prize: loc(t.prizes.list[2].prize),
      bonus: loc(t.prizes.list[2].bonus),
      icon: <Award className="w-8 h-8 text-amber-600" />,
      gradient: 'from-amber-600/20 to-orange-700/20',
      border: 'border-amber-600/30'
    }
  ]
  
  const contentDetailsIcons = [Database, Target, Star, CheckCircle];

  return (
    <>
      <NeuralNetworkBackground />
      <div className="relative min-h-screen z-10">
        {/* Navigation & Language Toggle */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex justify-between items-center">
          <Link href="/contest">
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
            <div className="max-w-4xl mx-auto text-center">
              <Badge variant="primary" className="mb-6">
                 {loc(t.hero.badge)}
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6">
                <span className="gradient-text">{loc(t.hero.titlePrefix)}</span>
                <br />
                <span className="text-text-primary">2025</span>
              </h1>
              <p className="text-xl text-text-secondary mb-8 max-w-3xl mx-auto leading-relaxed">
                {loc(t.hero.description)}
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-text-secondary">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-primary-blue" />
                  <span>{loc(t.hero.stats.members)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-primary-blue" />
                   <span>{loc(t.hero.stats.date)}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Overview & Video Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-12 text-center">
                 {loc(t.overview.heading)}
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Left Column - Overview (2/5 width) */}
                <div className="lg:col-span-2">
                  <Card className="bg-gradient-to-br from-primary-blue/10 to-accent-cyan/10 border-primary-blue/20 h-full">
                    <CardContent className="p-8">
                      <h3 className="text-2xl font-bold text-text-primary mb-6">
                        {loc(t.overview.aboutTitle)}
                      </h3>
                      <p className="text-text-secondary leading-relaxed mb-6">
                        {loc(t.overview.aboutText)}
                      </p>

                      <div className="bg-dark-surface/50 rounded-lg p-6 border border-dark-border/30">
                        <h4 className="text-text-primary font-semibold mb-4 flex items-center">
                          <Users className="w-5 h-5 mr-2 text-primary-blue" />
                          {loc(t.overview.targetTitle)}
                        </h4>
                        <ul className="space-y-3 text-text-secondary text-sm">
                          {t.overview.targets.map((target, i) => (
                             <li key={i} className="flex items-start">
                                <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mr-2 mt-0.5" />
                                <span><strong className="text-text-primary">{loc(target.title)}</strong> {loc(target.desc)}</span>
                              </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column - Video (3/5 width) */}
                <div className="lg:col-span-3">
                  <div className="mb-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary-blue/20 to-accent-cyan/10 border border-primary-blue/30 rounded-xl text-primary-blue">
                        <PlayCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-text-primary">
                          {loc(t.overview.videoTitle)}
                        </h3>
                        <p className="text-text-secondary text-sm">
                           {loc(t.overview.videoDesc)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Card className="bg-gradient-to-r from-primary-blue/10 to-accent-cyan/10 border-primary-blue/20 overflow-hidden">
                    <CardContent className="p-0">
                      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                        <iframe
                          className="absolute top-0 left-0 w-full h-full"
                          src="https://www.youtube.com/embed/zN5i0p9qJqI"
                          title="NAIC 2025 Rules & Q&A"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                      <div className="p-6 bg-dark-surface/50">
                        <div className="flex items-start space-x-3 text-text-secondary text-sm">
                          <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                          <p>
                             {loc(t.overview.videoNote)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-text-primary mb-12 text-center">
                 {loc(t.timeline.heading)}
              </h2>

              {/* Desktop Timeline */}
              <div className="hidden md:block relative">
                {/* Progress Bar Background */}
                <div className="absolute top-8 left-0 right-0 h-1 bg-dark-border/30 rounded-full">
                  {/* Active Progress */}
                  <div className="absolute top-0 left-0 h-full bg-success rounded-full transition-all duration-1000" style={{ width: '100%' }}></div>
                </div>

                {/* Timeline Items */}
                <div className="relative flex justify-between items-start pt-16">
                  {timeline.map((item, index) => (
                    <div key={index} className="flex flex-col items-center flex-1 relative">
                      {/* Milestone Node */}
                      <div className={`absolute -top-16 w-12 h-12 rounded-full border-4 flex items-center justify-center transition-all duration-500 ${
                        item.status === 'completed'
                          ? 'bg-success border-success/30 shadow-lg shadow-success/50' :
                        item.status === 'ongoing'
                          ? 'bg-warning border-warning/30 shadow-xl shadow-warning/60 animate-pulse' :
                          'bg-dark-surface border-dark-border/50'
                      }`}>
                        <div className={`w-6 h-6 rounded-full ${
                          item.status === 'completed' ? 'bg-white' :
                          item.status === 'ongoing' ? 'bg-white' :
                          'bg-dark-border'
                        }`}></div>
                      </div>

                      {/* Content Card */}
                      <Card className={`w-full mt-2 transition-all duration-300 ${
                        item.status === 'ongoing'
                          ? 'bg-gradient-to-br from-warning/10 to-accent-cyan/5 border-warning/30 shadow-lg'
                          : 'bg-dark-surface/50 border-dark-border/30'
                      }`}>
                        <CardContent className="p-6 text-center">
                          <Badge
                            variant={
                              item.status === 'completed' ? 'success' :
                              item.status === 'ongoing' ? 'warning' :
                              'default'
                            }
                            className="mb-3"
                          >
                            {item.status}
                          </Badge>
                          <h3 className="text-lg font-bold text-text-primary mb-2 leading-tight">
                            {item.event}
                          </h3>
                          <p className="text-sm text-text-secondary font-mono">
                            {item.date}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile Timeline (Vertical) */}
              <div className="md:hidden space-y-6">
                {timeline.map((item, index) => (
                  <div key={index} className="relative flex items-start space-x-4">
                    {/* Vertical Line */}
                    {index < timeline.length - 1 && (
                      <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-dark-border/30">
                        <div className={`w-full ${
                          item.status === 'completed' ? 'bg-success h-full' :
                          item.status === 'ongoing' ? 'bg-warning h-1/2' :
                          'bg-transparent'
                        } transition-all duration-500`}></div>
                      </div>
                    )}

                    {/* Node */}
                    <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full border-4 flex items-center justify-center ${
                      item.status === 'completed'
                        ? 'bg-success border-success/30 shadow-lg shadow-success/50' :
                      item.status === 'ongoing'
                        ? 'bg-warning border-warning/30 shadow-xl shadow-warning/60 animate-pulse' :
                        'bg-dark-surface border-dark-border/50'
                    }`}>
                      <div className={`w-4 h-4 rounded-full ${
                        item.status === 'completed' ? 'bg-white' :
                        item.status === 'ongoing' ? 'bg-white' :
                        'bg-dark-border'
                      }`}></div>
                    </div>

                    {/* Card */}
                    <Card className={`flex-1 ${
                      item.status === 'ongoing'
                        ? 'bg-gradient-to-br from-warning/10 to-accent-cyan/5 border-warning/30'
                        : 'bg-dark-surface/50 border-dark-border/30'
                    }`}>
                      <CardContent className="p-4">
                        <Badge
                          variant={
                            item.status === 'completed' ? 'success' :
                            item.status === 'ongoing' ? 'warning' :
                            'default'
                          }
                          size="sm"
                          className="mb-2"
                        >
                          {item.status}
                        </Badge>
                        <h3 className="text-base font-bold text-text-primary mb-1">
                          {item.event}
                        </h3>
                        <p className="text-xs text-text-secondary font-mono">
                          {item.date}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Leaderboard Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-dark-surface/30">
          <div className="container mx-auto">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-text-primary mb-8 text-center">
                 {loc(t.leaderboard.heading)}
              </h2>
              <p className="text-text-secondary text-center mb-8">
                 {loc(t.leaderboard.subheading)}
              </p>

              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-dark-border/30">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                           {loc(t.leaderboard.columns.rank)}
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                           {loc(t.leaderboard.columns.participant)}
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-text-secondary uppercase tracking-wider">
                           {loc(t.leaderboard.columns.submissions)}
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">
                           {loc(t.leaderboard.columns.mae)}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-border/30">
                      {leaderboard.map((entry) => (
                        <tr
                          key={entry.rank}
                          className={`
                            ${entry.rank <= 5 ? 'bg-gradient-to-r from-primary-blue/5 to-accent-cyan/5' : ''}
                            ${entry.isBaseline ? 'bg-warning/5 border-l-4 border-warning' : ''}
                            hover:bg-dark-border/20 transition-colors
                          `}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {entry.rank <= 3 ? (
                                <div className={`flex items-center justify-center w-8 h-8 rounded-full mr-2 ${
                                  entry.rank === 1 ? 'bg-yellow-500/20 text-yellow-500' :
                                  entry.rank === 2 ? 'bg-gray-400/20 text-gray-400' :
                                  'bg-amber-600/20 text-amber-600'
                                }`}>
                                  {entry.rank === 1 ? <Trophy className="w-4 h-4" /> :
                                   entry.rank === 2 ? <Medal className="w-4 h-4" /> :
                                   <Award className="w-4 h-4" />}
                                </div>
                              ) : null}
                              <span className={`text-sm font-mono ${
                                entry.rank <= 5 ? 'font-bold text-text-primary' : 'text-text-secondary'
                              }`}>
                                #{entry.rank}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-sm ${
                              entry.isBaseline ? 'font-semibold text-warning italic' :
                              entry.rank <= 5 ? 'font-semibold text-text-primary' :
                              'text-text-secondary'
                            }`}>
                              {entry.name}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-sm text-text-secondary font-mono">
                              {entry.submissions}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className={`text-sm font-mono ${
                              entry.rank <= 5 ? 'font-bold text-primary-blue' : 'text-text-secondary'
                            }`}>
                              {entry.mae.toFixed(4)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Format Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-text-primary mb-8 text-center">
                 {loc(t.format.heading)}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {formatDetails.map((detail, index) => (
                  <Card key={index} variant="hover" className="hover-lift">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary-blue/20 to-accent-cyan/10 border border-primary-blue/30 rounded-xl flex items-center justify-center text-primary-blue">
                          {detail.icon}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-text-primary mb-2">
                            {detail.title}
                          </h3>
                          <p className="text-text-secondary text-sm leading-relaxed">
                            {detail.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-dark-surface/30">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-text-primary mb-8 text-center">
                 {loc(t.content.heading)}
              </h2>

              <div className="space-y-6">
                <Card className="bg-gradient-to-r from-primary-blue/10 to-accent-cyan/10 border-primary-blue/20">
                  <CardContent className="p-8">
                    <div className="flex items-start space-x-4 mb-6">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary-blue/20 to-accent-cyan/10 border border-primary-blue/30 rounded-xl flex items-center justify-center text-primary-blue">
                        <Target className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-text-primary mb-2">{loc(t.content.theme.title)}</h3>
                        <p className="text-text-secondary">
                          {loc(t.content.theme.desc)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {t.content.details.map((item, i) => {
                             const Icon = contentDetailsIcons[i];
                             return (
                                <div key={i} className="bg-dark-surface/50 rounded-lg p-4 border border-dark-border/30">
                                    <h4 className="text-text-primary font-semibold mb-3 flex items-center">
                                    <Icon className="w-4 h-4 mr-2 text-primary-blue" />
                                    {loc(item.title)}
                                    </h4>
                                    <p className="text-text-secondary text-sm">
                                    {loc(item.text)}
                                    </p>
                                </div>
                             )
                        })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Prizes Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-text-primary mb-8 text-center">
                 {loc(t.prizes.heading)}
              </h2>
              <p className="text-text-secondary text-center mb-8">
                 {loc(t.prizes.subheading)}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {prizes.map((prize, index) => (
                  <Card key={index} className={`text-center hover-lift bg-gradient-to-br ${prize.gradient} border-2 ${prize.border}`}>
                    <CardContent className="p-8">
                      <div className="mb-6">{prize.icon}</div>
                      <h3 className="text-xl font-bold text-text-primary mb-3 font-mono">
                        {prize.rank}
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-center space-x-2">
                          <Coins className="w-5 h-5 text-primary-blue" />
                          <span className="text-2xl font-bold text-primary-blue">{prize.prize}</span>
                        </div>
                        <p className="text-text-secondary text-sm">{prize.bonus}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="bg-gradient-to-r from-success/10 to-primary-blue/10 border-success/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center space-x-3">
                    <Star className="w-6 h-6 text-success" />
                    <p className="text-text-primary font-semibold">
                       {loc(t.prizes.participation)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-dark-surface/50">
          <div className="container mx-auto">
            <Card className="text-center bg-gradient-to-r from-primary-blue/10 to-accent-cyan/10 border-primary-blue/20">
              <CardContent className="p-12">
                <h2 className="text-3xl font-bold text-text-primary mb-4">
                   {loc(t.cta.title)}
                </h2>
                <p className="text-text-secondary text-lg mb-8 max-w-2xl mx-auto">
                   {loc(t.cta.desc)}
                </p>
                <Link href="https://the-noders-competition-platform.vercel.app/" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="group">
                     {loc(t.cta.button)}
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
