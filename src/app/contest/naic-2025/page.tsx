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

export const metadata: Metadata = generateSEOMetadata({
  title: 'Noders AI Competition 2025 - Internal Competition',
  description: 'Internal AI competition for The Noders PTNK members. Build IELTS Writing scoring models and compete for cash prizes in a supportive learning environment.',
  keywords: ['internal competition', 'AI challenge', 'Noders PTNK', 'machine learning', 'IELTS scoring'],
  url: '/contest/naic-2025',
})

export default function NAIC2025Page() {
  const timeline = [
    { date: '29 Nov 2025', event: 'Registration Opens', status: 'completed' },
    { date: '29 Nov - 28 Dec', event: 'Active Competition Period', status: 'completed' },
    { date: '28 Dec 2025', event: 'Final Submission Deadline', status: 'completed' }
  ]

  const formatDetails = [
    {
      icon: <Laptop className="w-5 h-5" />,
      title: 'Online Competition',
      description: 'Train your models locally or on Google Colab/Kaggle, then submit results online'
    },
    {
      icon: <Upload className="w-5 h-5" />,
      title: 'Submit CSV Files',
      description: 'Download data, build your model, export submission.csv, and upload to our platform'
    },
    {
      icon: <Database className="w-5 h-5" />,
      title: 'Provided Dataset Only',
      description: 'Use only the competition dataset - external data is not permitted for fair competition'
    },
    {
      icon: <FileText className="w-5 h-5" />,
      title: 'Notebook Verification',
      description: 'Top 4 winners must submit notebooks for verification before receiving prizes'
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
    { rank: 15, name: 'Baseline (điểm của notebook mẫu)', submissions: 2, mae: 0.9149, isBaseline: true },
    { rank: 16, name: 'Trần Hoàng Thiên Phúc', submissions: 1, mae: 1.3554 }
  ]

  const prizes = [
    {
      rank: '1st Place',
      prize: '200,000 VNĐ',
      bonus: '+ 25 Club Points',
      icon: <Trophy className="w-8 h-8 text-yellow-500" />,
      gradient: 'from-yellow-500/20 to-orange-500/20',
      border: 'border-yellow-500/30'
    },
    {
      rank: '2nd Place',
      prize: '100,000 VNĐ',
      bonus: '+ 20 Club Points',
      icon: <Medal className="w-8 h-8 text-gray-400" />,
      gradient: 'from-gray-300/20 to-gray-500/20',
      border: 'border-gray-400/30'
    },
    {
      rank: '3rd Place (×3)',
      prize: '50,000 VNĐ each',
      bonus: '+ 15 Club Points',
      icon: <Award className="w-8 h-8 text-amber-600" />,
      gradient: 'from-amber-600/20 to-orange-700/20',
      border: 'border-amber-600/30'
    }
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
              <Badge variant="primary" className="mb-6">
                Internal • Ended
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6">
                <span className="gradient-text">Noders AI Competition</span>
                <br />
                <span className="text-text-primary">2025</span>
              </h1>
              <p className="text-xl text-text-secondary mb-8 max-w-3xl mx-auto leading-relaxed">
                Our internal training ground where Noders members level up their AI skills through
                real competition. Build IELTS Writing scoring models, compete on the leaderboard,
                and earn both knowledge and rewards in a supportive learning environment.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-text-secondary">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-primary-blue" />
                  <span>16 Members Joined</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-primary-blue" />
                  <span>29 Nov - 28 Dec 2025</span>
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
                Competition Overview & Rules
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Left Column - Overview (2/5 width) */}
                <div className="lg:col-span-2">
                  <Card className="bg-gradient-to-br from-primary-blue/10 to-accent-cyan/10 border-primary-blue/20 h-full">
                    <CardContent className="p-8">
                      <h3 className="text-2xl font-bold text-text-primary mb-6">
                        About NAIC 2025
                      </h3>
                      <p className="text-text-secondary leading-relaxed mb-6">
                        NAIC 2025 is designed as a practical learning experience for Noders members to
                        develop real AI skills through hands-on competition. Whether you're a seasoned
                        AI team member or completely new to machine learning, this is your chance to
                        train your first model, learn from detailed guides, and see your skills grow
                        in a friendly, low-pressure environment.
                      </p>

                      <div className="bg-dark-surface/50 rounded-lg p-6 border border-dark-border/30">
                        <h4 className="text-text-primary font-semibold mb-4 flex items-center">
                          <Users className="w-5 h-5 mr-2 text-primary-blue" />
                          Target Audience
                        </h4>
                        <ul className="space-y-3 text-text-secondary text-sm">
                          <li className="flex items-start">
                            <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mr-2 mt-0.5" />
                            <span><strong className="text-text-primary">AI Team Members:</strong> Mandatory participation to practice and improve skills</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mr-2 mt-0.5" />
                            <span><strong className="text-text-primary">Other Club Members:</strong> Optional participation - perfect for those curious about AI</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mr-2 mt-0.5" />
                            <span><strong className="text-text-primary">Beginners Welcome:</strong> Detailed tutorial guides provided for first-time AI practitioners</span>
                          </li>
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
                          Rules Explanation & Q&A
                        </h3>
                        <p className="text-text-secondary text-sm">
                          Watch our detailed walkthrough of competition rules
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
                            This session covers all competition rules, submission guidelines, evaluation criteria, and answers frequently asked questions from participants.
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
                Competition Timeline
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
                Final Leaderboard
              </h2>
              <p className="text-text-secondary text-center mb-8">
                Competition ended on 28 Dec 2025 • Ranked by Mean Absolute Error (lower is better)
              </p>

              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-dark-border/30">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                          Rank
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                          Participant
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-text-secondary uppercase tracking-wider">
                          Submissions
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">
                          MAE ↓
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
                Competition Format
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
                Competition Content
              </h2>

              <div className="space-y-6">
                <Card className="bg-gradient-to-r from-primary-blue/10 to-accent-cyan/10 border-primary-blue/20">
                  <CardContent className="p-8">
                    <div className="flex items-start space-x-4 mb-6">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary-blue/20 to-accent-cyan/10 border border-primary-blue/30 rounded-xl flex items-center justify-center text-primary-blue">
                        <Target className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-text-primary mb-2">Challenge Theme</h3>
                        <p className="text-text-secondary">
                          Build an AI model to automatically score IELTS Writing Task 1 essays
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-dark-surface/50 rounded-lg p-4 border border-dark-border/30">
                        <h4 className="text-text-primary font-semibold mb-3 flex items-center">
                          <Database className="w-4 h-4 mr-2 text-primary-blue" />
                          Dataset
                        </h4>
                        <p className="text-text-secondary text-sm">
                          Essays with corresponding Band Scores provided by organizers
                        </p>
                      </div>

                      <div className="bg-dark-surface/50 rounded-lg p-4 border border-dark-border/30">
                        <h4 className="text-text-primary font-semibold mb-3 flex items-center">
                          <Target className="w-4 h-4 mr-2 text-primary-blue" />
                          Task
                        </h4>
                        <p className="text-text-secondary text-sm">
                          Predict Band Scores for hidden test set essays
                        </p>
                      </div>

                      <div className="bg-dark-surface/50 rounded-lg p-4 border border-dark-border/30">
                        <h4 className="text-text-primary font-semibold mb-3 flex items-center">
                          <Star className="w-4 h-4 mr-2 text-primary-blue" />
                          Evaluation
                        </h4>
                        <p className="text-text-secondary text-sm">
                          MAE (Mean Absolute Error) - Lower error means higher rank
                        </p>
                      </div>

                      <div className="bg-dark-surface/50 rounded-lg p-4 border border-dark-border/30">
                        <h4 className="text-text-primary font-semibold mb-3 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2 text-primary-blue" />
                          Leaderboard
                        </h4>
                        <p className="text-text-secondary text-sm">
                          Real-time ranking based on submission accuracy
                        </p>
                      </div>
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
                Prizes & Recognition
              </h2>
              <p className="text-text-secondary text-center mb-8">
                Cash prizes plus club points for top performers
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
                      All other participants earn valuable experience + 10 club points
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
                  Join the Competition
                </h2>
                <p className="text-text-secondary text-lg mb-8 max-w-2xl mx-auto">
                  Access the competition platform to download data, submit your predictions,
                  and track your progress on the live leaderboard.
                </p>
                <Link href="https://the-noders-competition-platform.vercel.app/" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="group">
                    Go to Competition Platform
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
