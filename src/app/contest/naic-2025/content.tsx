'use client'

import Link from 'next/link'
import { Button } from '@/components/Button'
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
  Star
} from 'lucide-react'
import { NeuralNetworkBackground } from '@/components/NeuralNetworkBackground'

export function NAIC2025Content() {
  const { lang, setLang } = useLanguage()
  const t = translations

  const loc = (obj: { en: string; vi: string }) => obj[lang] || obj.en

  const timeline = [
    { date: loc(t.timeline.items[0].date), event: loc(t.timeline.items[0].event) },
    { date: loc(t.timeline.items[1].date), event: loc(t.timeline.items[1].event) },
    { date: loc(t.timeline.items[2].date), event: loc(t.timeline.items[2].event) },
  ]

  const formatDetails = [
    { icon: <Laptop className="w-5 h-5" />, title: loc(t.format.details[0].title), description: loc(t.format.details[0].description) },
    { icon: <Upload className="w-5 h-5" />, title: loc(t.format.details[1].title), description: loc(t.format.details[1].description) },
    { icon: <Database className="w-5 h-5" />, title: loc(t.format.details[2].title), description: loc(t.format.details[2].description) },
    { icon: <FileText className="w-5 h-5" />, title: loc(t.format.details[3].title), description: loc(t.format.details[3].description) },
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
    { rank: 16, name: 'Trần Hoàng Thiên Phúc', submissions: 1, mae: 1.3554 },
  ]

  const prizes = [
    { rank: loc(t.prizes.list[0].rank), prize: loc(t.prizes.list[0].prize), bonus: loc(t.prizes.list[0].bonus), icon: <Trophy className="w-[18px] h-[18px]" />, bg: 'rgba(234,179,8,.12)', textColor: '#facc15' },
    { rank: loc(t.prizes.list[1].rank), prize: loc(t.prizes.list[1].prize), bonus: loc(t.prizes.list[1].bonus), icon: <Medal className="w-[18px] h-[18px]" />, bg: 'rgba(148,163,184,.14)', textColor: '#cbd5e1' },
    { rank: loc(t.prizes.list[2].rank), prize: loc(t.prizes.list[2].prize), bonus: loc(t.prizes.list[2].bonus), icon: <Award className="w-[18px] h-[18px]" />, bg: 'rgba(217,119,6,.12)', textColor: '#fb923c' },
  ]

  const contentDetailsIcons = [Database, Target, Star, CheckCircle]

  return (
    <>
      <NeuralNetworkBackground />
      <div className="relative min-h-screen z-10">
        {/* Navigation & Language Toggle */}
        <div className="container mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8 pt-8 flex justify-between items-center">
          <Link href="/contest">
            <Button variant="ghost" className="group">
              <ArrowLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              {loc(t.hero.backButton)}
            </Button>
          </Link>
          <div className="flex bg-dark-surface/50 p-1 rounded-lg border border-dark-border/50">
            <button
              onClick={() => setLang('en')}
              className={`px-4 py-2 min-h-[40px] rounded-md text-sm font-medium transition-all ${
                lang === 'en' ? 'bg-primary-blue text-white shadow-lg' : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang('vi')}
              className={`px-4 py-2 min-h-[40px] rounded-md text-sm font-medium transition-all ${
                lang === 'vi' ? 'bg-primary-blue text-white shadow-lg' : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
              }`}
            >
              VI
            </button>
          </div>
        </div>

        {/* Hero Section */}
        <section className="py-9 px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <Badge variant="purple" className="mb-5">{loc(t.hero.badge)}</Badge>
            <h1 className="text-3xl sm:text-4xl md:text-[2.5rem] font-[family-name:var(--font-shrikhand)] mb-3 leading-[1.15]">
              <span className="gradient-text">{loc(t.hero.titlePrefix)}</span>
              <br />
              <span className="text-text-primary">2025</span>
            </h1>
            <p className="text-sm sm:text-base text-text-secondary mb-6 max-w-2xl mx-auto leading-relaxed">
              {loc(t.hero.description)}
            </p>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-text-secondary mb-6">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary-blue" />
                <span>{loc(t.hero.stats.members)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary-blue" />
                <span>{loc(t.hero.stats.date)}</span>
              </div>
            </div>
            <Link href="https://the-noders-competition-platform.vercel.app/competitions/28f402dd-6e61-4d7f-816f-d802e1478679" target="_blank" rel="noopener noreferrer">
              <Button variant="secondary" className="group">
                {loc(t.hero.competitionDetail)}
                <ExternalLink className="ml-2 w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Overview console — same panel language as PAIC 2026 for consistency
            between the two contest detail pages. */}
        <section className="py-9 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-[1180px]">
            <div className="rounded-[20px] border border-dark-border/60 bg-gradient-to-br from-dark-surface to-[#16223a] overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-dark-border/60">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-green" />
                <span className="text-[10.5px] font-extrabold uppercase tracking-[0.1em] text-text-tertiary">{loc(t.overview.videoTitle)}</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr]">
                <div className="p-5 lg:border-r border-dark-border/60">
                  <h3 className="text-sm font-extrabold mb-1">▶ {loc(t.overview.videoTitle)}</h3>
                  <p className="text-xs text-text-tertiary mb-3">{loc(t.overview.videoDesc)}</p>
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
                    <iframe
                      className="absolute inset-0 w-full h-full"
                      src="https://www.youtube.com/embed/zN5i0p9qJqI"
                      title="NAIC 2025 Rules & Q&A"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>

                <div className="p-5 flex flex-col gap-3.5">
                  <div>
                    <h3 className="text-sm font-extrabold mb-1.5">{loc(t.overview.aboutTitle)}</h3>
                    <p className="text-xs text-text-secondary leading-relaxed">{loc(t.overview.aboutText)}</p>
                  </div>
                  <div className="bg-dark-bg/40 border border-dark-border/60 rounded-xl p-3.5">
                    <div className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-primary-blue mb-2">
                      {loc(t.overview.targetTitle)}
                    </div>
                    <div className="flex flex-col gap-2">
                      {t.overview.targets.map((target, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-accent-green flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-text-secondary"><strong className="text-text-primary">{loc(target.title)}</strong> {loc(target.desc)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 border-t border-dark-border/60">
                {formatDetails.map((detail, index) => (
                  <div
                    key={index}
                    className={[
                      'p-4 flex flex-col gap-2 border-dark-border/60',
                      index % 2 === 0 ? 'border-r' : '',
                      index >= 2 ? 'border-t lg:border-t-0' : '',
                      'lg:border-r lg:last:border-r-0',
                    ].join(' ')}
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary-blue/12 flex items-center justify-center text-primary-blue">
                      {detail.icon}
                    </div>
                    <h4 className="text-xs font-extrabold">{detail.title}</h4>
                    <p className="text-[11px] text-text-tertiary leading-relaxed">{detail.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Timeline — same horizontal rail pattern as PAIC 2026 */}
        <section className="py-9 px-4 sm:px-6 lg:px-8 bg-dark-surface/30">
          <div className="container mx-auto max-w-[1180px]">
            <span className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-primary-blue mb-3.5">
              <span className="w-[18px] h-0.5 rounded-sm bg-current" />
              Timeline
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-6">{loc(t.timeline.heading)}</h2>

            <div className="flex flex-col md:flex-row rounded-2xl border border-dark-border/60 bg-dark-surface/70 overflow-hidden">
              {timeline.map((item, index) => (
                <div
                  key={index}
                  className={`flex-1 p-4 ${index < timeline.length - 1 ? 'border-b md:border-b-0 md:border-r' : ''} border-dark-border/60`}
                >
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="w-2 h-2 rounded-full bg-accent-green" />
                    <span className="text-[10px] font-extrabold text-text-tertiary tracking-[0.06em]">STEP {String(index + 1).padStart(2, '0')}</span>
                  </div>
                  <div className="text-[11px] font-bold text-accent-green mb-1">{item.date}</div>
                  <h4 className="text-sm font-extrabold text-text-primary font-mono">{item.event}</h4>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Leaderboard — real data table with rank badges */}
        <section className="py-9 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-[1180px]">
            <span className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-primary-blue mb-3.5">
              <span className="w-[18px] h-0.5 rounded-sm bg-current" />
              Results
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-1.5">{loc(t.leaderboard.heading)}</h2>
            <p className="text-text-secondary text-sm mb-6">{loc(t.leaderboard.subheading)}</p>

            <div className="rounded-2xl border border-dark-border/60 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px] text-sm">
                  <thead>
                    <tr className="bg-dark-surface">
                      <th className="px-4 py-3 text-left text-[10.5px] font-extrabold uppercase tracking-wider text-text-tertiary">{loc(t.leaderboard.columns.rank)}</th>
                      <th className="px-4 py-3 text-left text-[10.5px] font-extrabold uppercase tracking-wider text-text-tertiary">{loc(t.leaderboard.columns.participant)}</th>
                      <th className="px-4 py-3 text-right text-[10.5px] font-extrabold uppercase tracking-wider text-text-tertiary">{loc(t.leaderboard.columns.submissions)}</th>
                      <th className="px-4 py-3 text-right text-[10.5px] font-extrabold uppercase tracking-wider text-text-tertiary">{loc(t.leaderboard.columns.mae)}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry) => {
                      const rankStyle =
                        entry.rank === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                        entry.rank === 2 ? 'bg-slate-400/20 text-slate-300' :
                        entry.rank === 3 ? 'bg-amber-600/20 text-amber-500' :
                        'bg-dark-bg/60 text-text-tertiary'
                      const rowTint =
                        entry.rank === 1 ? 'bg-yellow-500/[0.04]' :
                        entry.rank === 2 ? 'bg-slate-400/[0.04]' :
                        entry.rank === 3 ? 'bg-amber-600/[0.03]' :
                        entry.isBaseline ? 'bg-warning/5' : ''
                      return (
                        <tr key={entry.rank} className={`border-t border-dark-border/60 ${rowTint}`}>
                          <td className="px-4 py-2.5">
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-[11px] font-bold ${rankStyle}`}>{entry.rank}</span>
                          </td>
                          <td className={`px-4 py-2.5 whitespace-nowrap ${entry.isBaseline ? 'italic text-warning font-semibold' : 'font-bold text-text-primary'}`}>
                            {entry.name}
                          </td>
                          <td className="px-4 py-2.5 text-right text-text-tertiary [font-variant-numeric:tabular-nums]">{entry.submissions}</td>
                          <td className="px-4 py-2.5 text-right font-semibold text-text-primary [font-variant-numeric:tabular-nums]">{entry.mae.toFixed(4)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <p className="md:hidden text-xs text-text-tertiary text-center mt-3">
              {lang === 'vi' ? '← Vuốt ngang để xem đầy đủ →' : '← Swipe to see full table →'}
            </p>
          </div>
        </section>

        {/* Competition Content — challenge theme & task details */}
        <section className="py-9 px-4 sm:px-6 lg:px-8 bg-dark-surface/30">
          <div className="container mx-auto max-w-[1180px]">
            <span className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-primary-blue mb-3.5">
              <span className="w-[18px] h-0.5 rounded-sm bg-current" />
              Content
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-6">{loc(t.content.heading)}</h2>

            <div className="rounded-2xl border border-dark-border/60 bg-dark-surface/70 p-5 sm:p-7">
              <div className="flex items-start gap-3.5 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary-blue/12 flex items-center justify-center text-primary-blue flex-shrink-0">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-text-primary mb-1.5">{loc(t.content.theme.title)}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{loc(t.content.theme.desc)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {t.content.details.map((item, i) => {
                  const Icon = contentDetailsIcons[i]
                  return (
                    <div key={i} className="bg-dark-bg/40 border border-dark-border/60 rounded-xl p-4">
                      <h4 className="text-text-primary font-bold text-sm mb-2 flex items-center gap-2">
                        <Icon className="w-4 h-4 text-primary-blue" />
                        {loc(item.title)}
                      </h4>
                      <p className="text-text-secondary text-xs leading-relaxed">{loc(item.text)}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Prizes */}
        <section className="py-9 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-2xl">
            <div className="text-center mb-8">
              <span className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-primary-blue mb-3.5 justify-center">
                <span className="w-[18px] h-0.5 rounded-sm bg-current" />
                Prizes
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">{loc(t.prizes.heading)}</h2>
              <p className="text-sm text-text-secondary">{loc(t.prizes.subheading)}</p>
            </div>

            <div className="rounded-[14px] border border-dark-border/60 overflow-hidden mb-5">
              {prizes.map((prize, index) => (
                <div key={index} className="flex items-center justify-between p-3.5 border-b border-dark-border/60 last:border-b-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: prize.bg, color: prize.textColor }}>
                      {prize.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: prize.textColor }}>{prize.rank}</p>
                      <p className="text-text-tertiary text-xs">{prize.bonus}</p>
                    </div>
                  </div>
                  <p className="font-bold text-text-primary text-sm">{prize.prize}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-primary-blue/25 bg-primary-blue/8 p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Star className="w-4 h-4 text-accent-green flex-shrink-0" />
                <p className="text-sm text-text-secondary font-medium">
                  {lang === 'vi' ? 'Tất cả thí sinh khác' : 'All other participants'}
                </p>
              </div>
              <p className="text-sm font-bold text-text-primary text-right">
                {lang === 'vi' ? 'Kinh nghiệm + 10 Club Points' : 'Experience + 10 Club Points'}
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-9 px-4 sm:px-6 lg:px-8 bg-dark-surface/40">
          <div className="container mx-auto max-w-2xl text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-3">{loc(t.cta.title)}</h2>
            <p className="text-text-secondary text-sm sm:text-base mb-6 leading-relaxed">{loc(t.cta.desc)}</p>
            <Link href="https://the-noders-competition-platform.vercel.app/" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="group w-full sm:w-auto">
                {loc(t.cta.button)}
                <ExternalLink className="ml-2 w-4 h-4 group-hover:scale-110 transition-transform" />
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}
