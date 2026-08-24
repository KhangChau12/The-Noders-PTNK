'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/Button'
import { Badge } from '@/components/Badge'
import {
  ArrowLeft,
  Users,
  User,
  Calendar,
  Target,
  Trophy,
  Zap,
  Brain,
  Award,
  CheckCircle,
  Lightbulb,
  Medal,
  ExternalLink,
  Clock,
  BarChart3,
  Unlock
} from 'lucide-react'
import { NeuralNetworkBackground } from '@/components/NeuralNetworkBackground'
import { LeaderboardTabs } from './LeaderboardTabs'
import { useLanguage } from '@/components/LanguageProvider'
import { content } from './locale'

export default function PAIC2026Content() {
  const { lang, setLang } = useLanguage()
  const t = content[lang as keyof typeof content] || content.vi

  // Team Leaderboard (22 đội có nộp bài)
  const teamLeaderboard = [
    { rank: 1, team: 'Mango', public: 0.4103, private: 0.4150, average: 0.4126, submissions: 127 },
    { rank: 2, team: 'Lực Hướng Tâm', public: 0.4119, private: 0.4276, average: 0.4197, submissions: 74 },
    { rank: 3, team: 'Tuianhchaphet', public: 0.4175, private: 0.4297, average: 0.4236, submissions: 103 },
    { rank: 4, team: 'Ép oăn - Ti oăn', public: 0.4169, private: 0.4330, average: 0.4250, submissions: 113 },
    { rank: 5, team: 'kothanglamcho', public: 0.4264, private: 0.4461, average: 0.4362, submissions: 72 },
    { rank: 6, team: 'Chồn Nghệ Tây', public: 0.4298, private: 0.4537, average: 0.4417, submissions: 133 },
    { rank: 7, team: 'Synapse', public: 0.4326, private: 0.4510, average: 0.4418, submissions: 95 },
    { rank: 8, team: 'Nước Tương Tam Thái Tử', public: 0.5039, private: 0.5142, average: 0.5090, submissions: 14 },
    { rank: 9, team: 'Don\'t mind us', public: 0.4588, private: 0.5594, average: 0.5091, submissions: 12 },
    { rank: 10, team: 'Three Little Wolves', public: 0.4855, private: 0.5430, average: 0.5143, submissions: 36 },
    { rank: 11, team: 'Nynee', public: 0.5351, private: 0.8731, average: 0.7041, submissions: 6 },
    { rank: 12, team: 'beebee', public: 0.4287, private: null, average: null, submissions: 12 },
    { rank: 13, team: 'nexai', public: 0.4303, private: null, average: null, submissions: 4 },
    { rank: 14, team: 'LLMers', public: 0.4365, private: null, average: null, submissions: 33 },
    { rank: 15, team: 'Thợ săn hạng E', public: 0.4409, private: null, average: null, submissions: 36 },
    { rank: 16, team: 'Lmao', public: 0.4482, private: null, average: null, submissions: 22 },
    { rank: 17, team: 'Chat_GPT', public: 0.4588, private: null, average: null, submissions: 7 },
    { rank: 18, team: 'GeminiPro>Chatgpt', public: 0.4688, private: null, average: null, submissions: 38 },
    { rank: 19, team: 'KhoiLe08', public: 0.4771, private: null, average: null, submissions: 3 },
    { rank: 20, team: 'Sinh Viên Bàn 5', public: 0.5792, private: null, average: null, submissions: 6 },
    { rank: 21, team: 'Nhúc nhích', public: 0.7353, private: null, average: null, submissions: 2 },
    { rank: 22, team: 'Nhóm skibidi', public: null, private: 1.3279, average: null, submissions: 2 },
    // Đội không nộp bài
    { rank: null, team: 'Ruler of the Abyss', public: null, private: null, average: null, submissions: 0 },
    { rank: null, team: 'School Emoji', public: null, private: null, average: null, submissions: 0 },
    { rank: null, team: 'icyalmond&icy_lemon&snowyalmond', public: null, private: null, average: null, submissions: 0 },
  ]

  // Individual Leaderboard (54 thí sinh, bao gồm cả những người không nộp bài)
  const individualLeaderboard = [
    // Thí sinh có nộp bài (xếp hạng theo điểm)
    { rank: 1, name: 'Phan Xuân Khoa', team: 'Mango', public: 0.4130, private: 0.4150, average: 0.4140, submissions: 25 },
    { rank: 2, name: 'Cao Tùng Lâm', team: 'Mango', public: 0.4103, private: 0.4227, average: 0.4165, submissions: 102 },
    { rank: 3, name: 'Đoàn Thiên An', team: 'Lực Hướng Tâm', public: 0.4119, private: 0.4276, average: 0.4197, submissions: 74 },
    { rank: 4, name: 'Lê Trường Minh Đăng', team: 'Tuianhchaphet', public: 0.4175, private: 0.4297, average: 0.4236, submissions: 49 },
    { rank: 5, name: 'Vũ Nguyễn Khánh Ngọc', team: 'Ép oăn - Ti oăn', public: 0.4169, private: 0.4330, average: 0.4250, submissions: 69 },
    { rank: 6, name: 'Trương Bảo Khang', team: 'Tuianhchaphet', public: 0.4287, private: 0.4406, average: 0.4346, submissions: 54 },
    { rank: 7, name: 'Ngụy Mỹ Linh', team: 'Ép oăn - Ti oăn', public: 0.4281, private: 0.4450, average: 0.4365, submissions: 32 },
    { rank: 8, name: 'Phạm Quốc Bình', team: 'kothanglamcho', public: 0.4298, private: 0.4461, average: 0.4379, submissions: 51 },
    { rank: 9, name: 'Nguyễn Hoàng Anh', team: 'Chồn Nghệ Tây', public: 0.4298, private: 0.4537, average: 0.4417, submissions: 76 },
    { rank: 10, name: 'Lâm Gia Phúc Nguyên', team: 'Synapse', public: 0.4326, private: 0.4510, average: 0.4418, submissions: 83 },
    { rank: 11, name: 'Cam Duy Minh', team: 'Chồn Nghệ Tây', public: 0.4342, private: 0.4581, average: 0.4461, submissions: 33 },
    { rank: 12, name: 'Nguyễn Ngọc Minh Tâm', team: 'Ép oăn - Ti oăn', public: 0.5373, private: 0.4646, average: 0.5010, submissions: 12 },
    { rank: 13, name: 'Đỗ Lê Chí Hùng', team: 'Nước Tương Tam Thái Tử', public: 0.5039, private: 0.5142, average: 0.5090, submissions: 10 },
    { rank: 14, name: 'Tạ Hầu Việt Long', team: 'Don\'t mind us', public: 0.4588, private: 0.5594, average: 0.5091, submissions: 9 },
    { rank: 15, name: 'Chu Quang Nam', team: 'Three Little Wolves', public: 0.4855, private: 0.5501, average: 0.5178, submissions: 31 },
    { rank: 16, name: 'Phạm Đình Hải Nam', team: 'Three Little Wolves', public: 0.4933, private: 0.5430, average: 0.5182, submissions: 5 },
    { rank: 17, name: 'Đào Ngọc Minh Tâm', team: 'Don\'t mind us', public: 0.4710, private: 0.6127, average: 0.5419, submissions: 3 },
    { rank: 18, name: 'Trần Duy Phát', team: 'Nynee', public: 0.5351, private: 0.8731, average: 0.7041, submissions: 6 },
    { rank: 19, name: 'Phạm Phương Thảo', team: 'Nước Tương Tam Thái Tử', public: 0.8501, private: 0.7996, average: 0.8248, submissions: 4 },
    { rank: 20, name: 'Bùi Quốc Vĩnh Khang', team: 'kothanglamcho', public: 0.4264, private: null, average: null, submissions: 19 },
    { rank: 21, name: 'Nguyễn Lê Quỳnh Châu', team: 'beebee', public: 0.4287, private: null, average: null, submissions: 12 },
    { rank: 22, name: 'Trương Hoàng Tấn Dũng', team: 'nexai', public: 0.4303, private: null, average: null, submissions: 4 },
    { rank: 23, name: 'Thái Hoàng Sơn', team: 'LLMers', public: 0.4365, private: null, average: null, submissions: 16 },
    { rank: 24, name: 'Từ Đình Nguyên', team: 'Thợ săn hạng E', public: 0.4409, private: null, average: null, submissions: 36 },
    { rank: 25, name: 'Đinh Gia Minh', team: 'Chồn Nghệ Tây', public: 0.4443, private: null, average: null, submissions: 24 },
    { rank: 26, name: 'Nguyễn Hoàng Minh Khang', team: 'LLMers', public: 0.4465, private: null, average: null, submissions: 17 },
    { rank: 27, name: 'Ngô Gia Bảo', team: 'Lmao', public: 0.4482, private: null, average: null, submissions: 16 },
    { rank: 28, name: 'Võ Kế Hoài', team: 'kothanglamcho', public: null, private: 0.4532, average: null, submissions: 2 },
    { rank: 29, name: 'Trần Trung Quân', team: 'Chat_GPT', public: 0.4588, private: null, average: null, submissions: 5 },
    { rank: 30, name: 'Hoàng Tô Đức Thắng', team: 'GeminiPro>Chatgpt', public: 0.4688, private: null, average: null, submissions: 16 },
    { rank: 31, name: 'Huỳnh Khải Đông', team: 'GeminiPro>Chatgpt', public: 0.4734, private: null, average: null, submissions: 19 },
    { rank: 32, name: 'Lê Nguyễn Minh Khôi', team: 'KhoiLe08', public: 0.4771, private: null, average: null, submissions: 3 },
    { rank: 33, name: 'Thái Nguyên Khôi', team: 'Lmao', public: 0.5284, private: null, average: null, submissions: 4 },
    { rank: 34, name: 'Lâm Hoàng Anh Tuấn', team: 'Lmao', public: 0.5390, private: null, average: null, submissions: 2 },
    { rank: 35, name: 'Nguyễn Ngọc Tuấn', team: 'Synapse', public: 0.5464, private: null, average: null, submissions: 10 },
    { rank: 36, name: 'Khưu Trường Khả', team: 'Synapse', public: 0.5511, private: null, average: null, submissions: 2 },
    { rank: 37, name: 'Nguyễn Hoàng Hải Đăng', team: 'Chat_GPT', public: 0.5780, private: null, average: null, submissions: 2 },
    { rank: 38, name: 'Nguyễn Hữu Đăng', team: 'Sinh Viên Bàn 5', public: 0.5792, private: null, average: null, submissions: 6 },
    { rank: 39, name: 'Trần Phúc Thái', team: 'Nhúc nhích', public: 0.7353, private: null, average: null, submissions: 2 },
    { rank: 40, name: 'Tân Nguyễn Khánh Duy', team: 'GeminiPro>Chatgpt', public: 0.8567, private: null, average: null, submissions: 3 },
    { rank: 41, name: 'Hoàng Nhật Nam', team: 'Nhóm skibidi', public: null, private: 1.3279, average: null, submissions: 2 },
    // Thí sinh không nộp bài
    { rank: null, name: 'Nguyễn Đặng Xuân Thuỷ', team: 'Chat_GPT', public: null, private: null, average: null, submissions: 0 },
    { rank: null, name: 'Đoàn Gia Đức', team: 'Three Little Wolves', public: null, private: null, average: null, submissions: 0 },
    { rank: null, name: 'Trần Dương Minh Tâm', team: 'Ruler of the Abyss', public: null, private: null, average: null, submissions: 0 },
    { rank: null, name: 'Đinh Hoàng Ân', team: 'Ruler of the Abyss', public: null, private: null, average: null, submissions: 0 },
    { rank: null, name: 'Trương Quốc Bình', team: 'School Emoji', public: null, private: null, average: null, submissions: 0 },
    { rank: null, name: 'Ngô Minh Quân', team: 'School Emoji', public: null, private: null, average: null, submissions: 0 },
    { rank: null, name: 'Trương Khiết Anh', team: 'Nhóm skibidi', public: null, private: null, average: null, submissions: 0 },
    { rank: null, name: 'Vũ Gia Bảo', team: 'icyalmond&icy_lemon&snowyalmond', public: null, private: null, average: null, submissions: 0 },
    { rank: null, name: 'Đặng Trúc Chi', team: 'Nước Tương Tam Thái Tử', public: null, private: null, average: null, submissions: 0 },
    { rank: null, name: 'Lê Đức Lân', team: 'Sinh Viên Bàn 5', public: null, private: null, average: null, submissions: 0 },
    { rank: null, name: 'Phan Đặng Minh Thái', team: 'Sinh Viên Bàn 5', public: null, private: null, average: null, submissions: 0 },
    { rank: null, name: 'Nguyễn Ngô Minh Dương', team: 'nexai', public: null, private: null, average: null, submissions: 0 },
    { rank: null, name: 'Nguyễn Khôi Nguyên', team: 'nexai', public: null, private: null, average: null, submissions: 0 },
    { rank: null, name: 'Nguyễn Tiến Thịnh', team: 'Nynee', public: null, private: null, average: null, submissions: 0 },
  ]

  const features = [
    { icon: <Brain className="w-5 h-5" />, ...t.features[0] },
    { icon: <Target className="w-5 h-5" />, ...t.features[1] },
    { icon: <Lightbulb className="w-5 h-5" />, ...t.features[2] },
    { icon: <Users className="w-5 h-5" />, ...t.features[3] },
  ]

  // Giải thưởng đội
  const teamPrizes = t.prizes.team.map((prize, index) => {
    let icon, bg, textColor
    if (index === 0) {
      icon = <Trophy className="w-[18px] h-[18px]" />
      bg = 'rgba(234,179,8,.12)'
      textColor = '#facc15'
    } else if (index === 1) {
      icon = <Medal className="w-[18px] h-[18px]" />
      bg = 'rgba(148,163,184,.14)'
      textColor = '#cbd5e1'
    } else {
      icon = <Award className="w-[18px] h-[18px]" />
      bg = 'rgba(217,119,6,.12)'
      textColor = '#fb923c'
    }
    return { ...prize, icon, bg, textColor }
  })

  // Giải thưởng cá nhân
  const individualPrizes = t.prizes.individual.map((prize, index) => {
    let icon, bg, textColor
    if (index === 0) {
      icon = <User className="w-[18px] h-[18px]" />
      bg = 'rgba(37,99,235,.12)'
      textColor = '#2563EB'
    } else {
      icon = <Zap className="w-[18px] h-[18px]" />
      bg = 'rgba(6,182,212,.12)'
      textColor = '#06B6D4'
    }
    return { ...prize, icon, bg, textColor }
  })

  const timeline = t.timeline.steps

  return (
    <>
      <NeuralNetworkBackground />
      <div className="relative min-h-screen z-10">
        {/* Back Button & Language Switcher */}
        <div className="container mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8 pt-8 flex justify-between items-center">
          <Link href="/contest">
            <Button variant="ghost" className="group">
              <ArrowLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              {t.backToCompetitions}
            </Button>
          </Link>
          <div className="flex bg-dark-surface/50 p-1 rounded-lg border border-dark-border/50">
            <button
              onClick={() => setLang('en')}
              className={`px-4 py-2 min-h-[40px] rounded-md text-sm font-medium transition-all ${
                lang === 'en'
                  ? 'bg-primary-blue text-white shadow-lg'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang('vi')}
              className={`px-4 py-2 min-h-[40px] rounded-md text-sm font-medium transition-all ${
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
        <section className="py-9 px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <Badge variant="gray" className="mb-5">{t.status.ended}</Badge>
            <h1 className="text-3xl sm:text-4xl md:text-[2.5rem] font-[family-name:var(--font-shrikhand)] mb-3 leading-[1.15]">
              <span className="gradient-text">{t.title}</span>
              <br />
              <span className="text-text-primary">{t.subtitle}</span>
            </h1>
            <p className="text-sm sm:text-base text-text-secondary mb-6 max-w-2xl mx-auto leading-relaxed">
              {t.description}
            </p>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-text-secondary mb-6">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary-blue" />
                <span>{t.stats.teams_participants}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary-blue" />
                <span>{t.stats.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-primary-blue" />
                <span>{t.stats.prizepool}</span>
              </div>
            </div>
            <Link href="https://the-noders-competition-platform.vercel.app/competitions/e51e4314-854d-4a80-8520-044bf8b069e0" target="_blank" rel="noopener noreferrer">
              <Button variant="secondary" className="group">
                {t.buttons.competitionDetail}
                <ExternalLink className="ml-2 w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Overview console — one consistent panel replacing the old
            gradient-card + 4 separate hover-lift feature cards. */}
        <section className="py-9 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-[1180px]">
            <div className="rounded-[20px] border border-dark-border/60 bg-gradient-to-br from-dark-surface to-[#16223a] overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-dark-border/60">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-green" />
                <span className="text-[10.5px] font-extrabold uppercase tracking-[0.1em] text-text-tertiary">{t.workshop.title}</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr]">
                <div className="p-5 lg:border-r border-dark-border/60">
                  <h3 className="text-sm font-extrabold mb-1 flex items-center gap-2">▶ {t.workshop.title}</h3>
                  <p className="text-xs text-text-tertiary mb-3">{t.workshop.description}</p>
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
                    <iframe
                      className="absolute inset-0 w-full h-full"
                      src="https://www.youtube.com/embed/cFs5njLot7k"
                      title="PAIC 2026 Workshop"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>

                <div className="p-5 flex flex-col gap-3.5">
                  <div>
                    <h3 className="text-sm font-extrabold mb-1.5">{t.overview.title}</h3>
                    <p className="text-xs text-text-secondary leading-relaxed">{t.overview.intro}</p>
                  </div>
                  <div className="bg-dark-bg/40 border border-dark-border/60 rounded-xl p-3.5">
                    <div className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-primary-blue mb-2">{t.overview.goals_title}</div>
                    <div className="flex flex-col gap-1.5">
                      {t.overview.goals.map((goal, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-accent-green flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-text-secondary">{goal}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-dark-bg/40 border border-dark-border/60 rounded-xl p-3.5">
                    <p className="text-xs text-text-secondary">
                      <span className="text-text-primary font-semibold">Target:</span> {t.overview.target}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 border-t border-dark-border/60">
                {features.map((feature, index) => (
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
                      {feature.icon}
                    </div>
                    <h4 className="text-xs font-extrabold">{feature.title}</h4>
                    <p className="text-[11px] text-text-tertiary leading-relaxed">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Timeline — compact horizontal rail instead of a large illustrated progress bar */}
        <section className="py-9 px-4 sm:px-6 lg:px-8 bg-dark-surface/30">
          <div className="container mx-auto max-w-[1180px]">
            <span className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-primary-blue mb-3.5">
              <span className="w-[18px] h-0.5 rounded-sm bg-current" />
              Timeline
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-1.5">{t.timeline.title}</h2>
            <p className="text-text-secondary text-sm mb-6">{t.timeline.subtitle}</p>

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
                  <h4 className="text-sm font-extrabold text-text-primary font-mono">{item.title}</h4>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Leaderboard — real data table with rank badges, same data as before */}
        <section className="py-9 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-[1180px]">
            <span className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-primary-blue mb-3.5">
              <span className="w-[18px] h-0.5 rounded-sm bg-current" />
              Results
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-1.5">{t.leaderboard.title}</h2>
            <p className="text-text-secondary text-sm mb-6">{t.leaderboard.subtitle}</p>

            <LeaderboardTabs
              teamLeaderboard={teamLeaderboard}
              individualLeaderboard={individualLeaderboard}
            />
          </div>
        </section>

        {/* Competition Format */}
        <section className="py-9 px-4 sm:px-6 lg:px-8 bg-dark-surface/30">
          <div className="container mx-auto max-w-[1180px]">
            <span className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-primary-blue mb-3.5">
              <span className="w-[18px] h-0.5 rounded-sm bg-current" />
              Format
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-6">{t.format.title}</h2>

            <div className="rounded-[18px] border border-dark-border/60 bg-dark-surface/70 p-5 sm:p-7">
              <div className="mb-6">
                <h3 className="text-base font-extrabold text-text-primary mb-2 flex items-center gap-2.5">
                  <Users className="w-[18px] h-[18px] text-primary-blue flex-shrink-0" />
                  {t.format.type_title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">{t.format.type_desc}</p>
              </div>

              <div>
                <h3 className="text-base font-extrabold text-text-primary mb-2 flex items-center gap-2.5">
                  <Clock className="w-[18px] h-[18px] text-primary-blue flex-shrink-0" />
                  {t.format.structure_title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed mb-3">{t.format.structure_desc}</p>

                <div className="flex flex-col gap-3">
                  {t.format.rounds.map((round, i) => {
                    const RoundIcon = i === 0 ? BarChart3 : Unlock
                    return (
                      <div key={i} className="bg-dark-bg/40 border border-dark-border/60 rounded-[11px] p-4">
                        <h4 className="text-sm font-bold text-text-primary mb-1.5 flex items-center gap-2">
                          <RoundIcon className="w-3.5 h-3.5 text-primary-blue flex-shrink-0" />
                          {round.title}
                        </h4>
                        <p className="text-xs text-text-tertiary mb-1.5"><strong>{round.time}</strong></p>
                        <p className="text-xs text-text-secondary leading-relaxed">{round.desc}</p>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-4 p-3.5 bg-primary-blue/8 border border-primary-blue/25 rounded-xl">
                  <p className="text-sm text-text-secondary">
                    <Trophy className="w-4 h-4 inline mr-2 text-primary-blue" />
                    <strong className="text-text-primary">{t.leaderboard.title}</strong> {t.format.ranking_note}
                  </p>
                </div>
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
              <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-3">{t.prizes.title}</h2>
              <p className="text-sm text-text-secondary">{t.prizes.total}</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-primary-blue to-accent-cyan bg-clip-text text-transparent mt-1">
                {t.prizes.pool}
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-primary-blue" />
                {t.prizes.team_prizes_title}
              </h3>
              <div className="rounded-[14px] border border-dark-border/60 overflow-hidden">
                {teamPrizes.map((prize, index) => (
                  <div key={index} className="flex items-center justify-between p-3.5 border-b border-dark-border/60 last:border-b-0">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: prize.bg, color: prize.textColor }}>
                        {prize.icon}
                      </div>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: prize.textColor }}>{prize.rank}</p>
                        <p className="text-text-tertiary text-xs">{prize.count}</p>
                      </div>
                    </div>
                    <p className="font-bold text-text-primary text-sm">{prize.prize}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-primary-blue" />
                {t.prizes.individual_prizes_title}
              </h3>
              <div className="rounded-[14px] border border-dark-border/60 overflow-hidden">
                {individualPrizes.map((prize, index) => (
                  <div key={index} className="flex items-center justify-between p-3.5 border-b border-dark-border/60 last:border-b-0">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: prize.bg, color: prize.textColor }}>
                        {prize.icon}
                      </div>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: prize.textColor }}>{prize.rank}</p>
                        <p className="text-text-tertiary text-xs">{prize.count}</p>
                      </div>
                    </div>
                    <p className="font-bold text-text-primary text-sm">{prize.prize}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

      </div>
    </>
  )
}
