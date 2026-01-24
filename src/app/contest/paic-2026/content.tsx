'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/Button'
import { Card, CardContent } from '@/components/Card'
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
  BarChart3,
  Globe
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
    {
      icon: <Brain className="w-6 h-6" />,
      ...t.features[0]
    },
    {
      icon: <Target className="w-6 h-6" />,
      ...t.features[1]
    },
    {
      icon: <Lightbulb className="w-6 h-6" />,
      ...t.features[2]
    },
    {
      icon: <Users className="w-6 h-6" />,
      ...t.features[3]
    }
  ]

  // Giải thưởng đội
  const teamPrizes = t.prizes.team.map((prize, index) => {
    let icon, bg, border, textColor;
    if (index === 0) {
      icon = <Trophy className="w-6 h-6 text-yellow-500" />;
      bg = 'bg-yellow-500/10';
      border = 'border-yellow-500/30';
      textColor = 'text-yellow-500';
    } else if (index === 1) {
      icon = <Medal className="w-6 h-6 text-gray-400" />;
      bg = 'bg-gray-400/10';
      border = 'border-gray-400/30';
      textColor = 'text-gray-400';
    } else {
      icon = <Award className="w-6 h-6 text-amber-600" />;
      bg = 'bg-amber-600/10';
      border = 'border-amber-600/30';
      textColor = 'text-amber-600';
    }
    return { ...prize, icon, bg, border, textColor };
  });

  // Giải thưởng cá nhân
  const individualPrizes = t.prizes.individual.map((prize, index) => {
    let icon, bg, border, textColor;
    if (index === 0) {
      icon = <User className="w-6 h-6 text-primary-blue" />;
      bg = 'bg-primary-blue/10';
      border = 'border-primary-blue/30';
      textColor = 'text-primary-blue';
    } else {
      icon = <Zap className="w-6 h-6 text-accent-cyan" />;
      bg = 'bg-accent-cyan/10';
      border = 'border-accent-cyan/30';
      textColor = 'text-accent-cyan';
    }
    return { ...prize, icon, bg, border, textColor };
  });


  const timeline = t.timeline.steps

  return (
    <>
      <NeuralNetworkBackground />
      <div className="relative min-h-screen z-10">
        {/* Back Button & Language Switcher */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex justify-between items-center">
          <Link href="/contest">
            <Button variant="ghost" className="group">
              <ArrowLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              {t.backToCompetitions}
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
                {t.status.ended}
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6">
                <span className="gradient-text">{t.title}</span>
                <br />
                <span className="text-text-primary">{t.subtitle}</span>
              </h1>
              <p className="text-xl text-text-secondary mb-8 max-w-3xl mx-auto leading-relaxed">
                {t.description}
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-text-secondary">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-primary-blue" />
                  <span>{t.stats.teams_participants}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-primary-blue" />
                  <span>{t.stats.date}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-primary-blue" />
                  <span>{t.stats.prizepool}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Overview Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">
            <div className="max-w-7xl mx-auto">
              {/* Main Content Card */}
              <Card className="bg-gradient-to-br from-primary-blue/5 to-accent-cyan/5 border-primary-blue/20 mb-6">
                <CardContent className="p-6 md:p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Video */}
                    <div className="lg:col-span-2">
                      <div className="mb-3">
                        <h3 className="text-lg font-bold text-text-primary mb-1 flex items-center gap-2">
                          <span className="text-primary-blue">▶</span>
                          {t.workshop.title}
                        </h3>
                        <p className="text-text-secondary text-sm">
                          {t.workshop.description}
                        </p>
                      </div>
                      <div className="relative w-full rounded-lg overflow-hidden border border-primary-blue/20" style={{ paddingBottom: '56.25%' }}>
                        <iframe
                          className="absolute top-0 left-0 w-full h-full"
                          src="https://www.youtube.com/embed/cFs5njLot7k"
                          title="PAIC 2026 Workshop"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                    </div>

                    {/* Right: Overview */}
                    <div className="lg:col-span-1 flex flex-col gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-text-primary mb-3">
                          {t.overview.title}
                        </h3>
                        <p className="text-text-secondary text-sm leading-relaxed mb-3">
                         {t.overview.intro}
                        </p>
                      </div>

                      <div className="bg-dark-surface/50 rounded-lg p-4 border border-dark-border/30">
                        <p className="text-primary-blue text-xs font-semibold mb-2">
                          {t.overview.goals_title}
                        </p>
                        <div className="space-y-2">
                          {t.overview.goals.map((goal, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                              <p className="text-text-secondary text-xs">{goal}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-dark-surface/50 rounded-lg p-4 border border-dark-border/30">
                        <p className="text-text-secondary text-xs">
                          <span className="text-text-primary font-semibold">Đối tượng:</span> {t.overview.target}
                        </p>
                      </div>
                    </div>
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
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-dark-surface/30">
          <div className="container mx-auto">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl font-bold text-text-primary mb-8 text-center">
                {t.timeline.title}
              </h2>
              <p className="text-text-secondary text-center mb-8">
                {t.timeline.subtitle}
              </p>

              {/* Desktop Timeline */}
              <div className="hidden md:block relative">
                {/* Progress Bar Background */}
                <div className="absolute top-6 left-0 right-0 h-1 bg-dark-border/30 rounded-full">
                  <div
                    className="absolute top-0 left-0 h-full bg-success rounded-full transition-all duration-1000"
                    style={{ width: '100%' }}
                  ></div>
                </div>

                {/* Timeline Items */}
                <div className="relative flex justify-between items-start">
                  {timeline.map((item, index) => (
                    <div key={index} className="flex flex-col items-center flex-1 relative">
                      {/* Milestone Node */}
                      <div className="w-12 h-12 rounded-full border-4 flex items-center justify-center transition-all duration-500 bg-success border-success/30 shadow-lg shadow-success/50 z-10">
                        <div className="w-5 h-5 rounded-full bg-white"></div>
                      </div>

                      {/* Label */}
                      <div className="mt-4 text-center">
                        <Badge variant="success" className="mb-2">
                          {item.date}
                        </Badge>
                        <h3 className="text-base font-bold text-text-primary font-mono">
                          {item.title}
                        </h3>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile Timeline */}
              <div className="md:hidden flex flex-col gap-4">
                {timeline.map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full border-4 flex items-center justify-center bg-success border-success/30">
                      <div className="w-4 h-4 rounded-full bg-white"></div>
                    </div>
                    <div className="flex-1 flex items-center gap-3">
                      <Badge variant="success">
                        {item.date}
                      </Badge>
                      <span className="text-base font-bold text-text-primary font-mono">
                        {item.title}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Leaderboard Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl font-bold text-text-primary mb-4 text-center">
                {t.leaderboard.title}
              </h2>
              <p className="text-text-secondary text-center mb-8">
                {t.leaderboard.subtitle}
              </p>
              <LeaderboardTabs
                teamLeaderboard={teamLeaderboard}
                individualLeaderboard={individualLeaderboard}
              />
            </div>
          </div>
        </section>

        {/* Competition Format */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-text-primary mb-8 text-center">
                {t.format.title}
              </h2>

              <Card className="bg-gradient-to-r from-primary-blue/10 to-accent-cyan/10 border-primary-blue/20 mb-8">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-text-primary mb-3 flex items-center space-x-3">
                        <Users className="w-6 h-6 text-primary-blue" />
                        <span>{t.format.type_title}</span>
                      </h3>
                      <p className="text-text-secondary leading-relaxed ml-9">
                        {t.format.type_desc}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-text-primary mb-3 flex items-center space-x-3">
                        <Target className="w-6 h-6 text-primary-blue" />
                        <span>{t.format.structure_title}</span>
                      </h3>
                      <p className="text-text-secondary leading-relaxed ml-9 mb-4">
                        {t.format.structure_desc}
                      </p>

                      <div className="ml-9 space-y-4">
                        <div className="bg-dark-surface/50 rounded-lg p-6 border border-dark-border/30">
                          <h4 className="text-lg font-semibold text-text-primary mb-2 flex items-center space-x-2">
                            <BarChart3 className="w-5 h-5 text-success" />
                            <span>{t.format.rounds[0].title}</span>
                          </h4>
                          <p className="text-sm text-text-secondary mb-2">
                            <strong>{t.format.rounds[0].time}</strong>
                          </p>
                          <p className="text-text-secondary text-sm leading-relaxed">
                            {t.format.rounds[0].desc}
                          </p>
                        </div>

                        <div className="bg-dark-surface/50 rounded-lg p-6 border border-dark-border/30">
                          <h4 className="text-lg font-semibold text-text-primary mb-2 flex items-center space-x-2">
                            <Zap className="w-5 h-5 text-warning" />
                            <span>{t.format.rounds[1].title}</span>
                          </h4>
                          <p className="text-sm text-text-secondary mb-2">
                            <strong>{t.format.rounds[1].time}</strong>
                          </p>
                          <p className="text-text-secondary text-sm leading-relaxed">
                            {t.format.rounds[1].desc}
                          </p>
                        </div>
                      </div>

                      <div className="ml-9 mt-4 p-4 bg-primary-blue/10 border border-primary-blue/30 rounded-lg">
                        <p className="text-text-secondary text-sm">
                          <Trophy className="w-4 h-4 inline mr-2 text-primary-blue" />
                          <strong className="text-text-primary">{t.leaderboard.title}</strong> {t.format.ranking_note}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Prizes Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-text-primary mb-4">
                {t.prizes.title}
              </h2>
              <p className="text-text-secondary">
                {t.prizes.total} <span className="text-primary-blue font-bold">{t.prizes.pool}</span>
              </p>
            </div>

            {/* Giải đội */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary-blue" />
                {t.prizes.team_prizes_title}
              </h3>
              <Card className="overflow-hidden border-primary-blue/20">
                <div className="divide-y divide-dark-border/30">
                  {teamPrizes.map((prize, index) => (
                    <div key={index} className="flex items-center justify-between p-4 hover:bg-dark-surface/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg ${prize.bg} border ${prize.border} flex items-center justify-center`}>
                          {prize.icon}
                        </div>
                        <div>
                          <p className={`font-semibold ${prize.textColor}`}>{prize.rank}</p>
                          <p className="text-text-tertiary text-sm">{prize.count}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-text-primary">{prize.prize}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Giải cá nhân */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-primary-blue" />
                {t.prizes.individual_prizes_title}
              </h3>
              <Card className="overflow-hidden border-primary-blue/20">
                <div className="divide-y divide-dark-border/30">
                  {individualPrizes.map((prize, index) => (
                    <div key={index} className="flex items-center justify-between p-4 hover:bg-dark-surface/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg ${prize.bg} border ${prize.border} flex items-center justify-center`}>
                          {prize.icon}
                        </div>
                        <div>
                          <p className={`font-semibold ${prize.textColor}`}>{prize.rank}</p>
                          <p className="text-text-tertiary text-sm">{prize.count}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-text-primary">{prize.prize}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Total Prize Pool */}
            <Card className="bg-gradient-to-r from-primary-blue/10 to-accent-cyan/10 border-primary-blue/30">
              <CardContent className="py-6 px-8 flex items-center justify-between">
                <p className="text-text-secondary font-medium">{t.prizes.total}</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-primary-blue to-accent-cyan bg-clip-text text-transparent">
                  {t.prizes.pool}
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

      </div>
    </>
  )
}
