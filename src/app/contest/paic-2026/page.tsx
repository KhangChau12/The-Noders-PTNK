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
  Medal
} from 'lucide-react'
import { NeuralNetworkBackground } from '@/components/NeuralNetworkBackground'

export const metadata: Metadata = generateSEOMetadata({
  title: 'PAIC 2026 - PTNK AI Challenge 2026',
  description: 'Kỳ thi học thuật về Trí tuệ Nhân tạo do CLB The Noders tổ chức. Giải thưởng đến 1,600,000 VNĐ. Dành cho học sinh PTNK yêu thích AI.',
  keywords: ['AI challenge', 'cuộc thi AI', 'học sinh PTNK', 'kỳ thi AI', 'machine learning', 'PAIC 2026'],
  url: '/contest/paic-2026',
})

export default function PAIC2026Page() {
  const timeline = [
    {
      date: '28/12 - 03/01',
      title: 'Đăng ký',
      status: 'ongoing' as const,
      items: [
        { icon: <Users className="w-4 h-4" />, text: 'Mở đơn đăng ký tham gia qua Google Form' },
        { icon: <FileText className="w-4 h-4" />, text: 'Thí sinh đăng ký theo đội 1-3 người' },
      ]
    },
    {
      date: '04/01/2026',
      title: 'Workshop',
      status: 'upcoming' as const,
      items: [
        { icon: <Lightbulb className="w-4 h-4" />, text: 'Giải đáp thắc mắc về kỳ thi' },
        { icon: <FileText className="w-4 h-4" />, text: 'Hướng dẫn chạy thử notebook lần đầu' },
        { icon: <CheckCircle className="w-4 h-4" />, text: 'Thông báo các lưu ý quan trọng' }
      ]
    },
    {
      date: '05/01 - 17/01',
      title: 'Vòng Public',
      status: 'upcoming' as const,
      items: [
        { icon: <Database className="w-4 h-4" />, text: 'Cung cấp tập dữ liệu huấn luyện' },
        { icon: <Target className="w-4 h-4" />, text: 'Cung cấp tập test public' },
        { icon: <BarChart3 className="w-4 h-4" />, text: 'Xếp hạng tạm thời theo kết quả nộp' }
      ]
    },
    {
      date: '18/01/2026',
      title: 'Vòng Private',
      status: 'upcoming' as const,
      items: [
        { icon: <Zap className="w-4 h-4" />, text: 'Mở thêm dữ liệu và thay đổi tập test' },
        { icon: <Calendar className="w-4 h-4" />, text: '24 giờ để cải thiện mô hình' },
        { icon: <Trophy className="w-4 h-4" />, text: 'Nộp kết quả cuối cùng và công bố giải thưởng' }
      ]
    }
  ]

  const prizes = [
    {
      rank: 'Giải Nhất',
      count: '01 đội',
      prize: '1,000,000 VNĐ',
      icon: <Trophy className="w-8 h-8 text-yellow-500" />,
      gradient: 'from-yellow-500/20 to-orange-500/20',
      border: 'border-yellow-500/30'
    },
    {
      rank: 'Giải Nhì',
      count: '01 đội',
      prize: '500,000 VNĐ',
      icon: <Medal className="w-8 h-8 text-gray-400" />,
      gradient: 'from-gray-300/20 to-gray-500/20',
      border: 'border-gray-400/30'
    },
    {
      rank: 'Giải Ba',
      count: '03 đội',
      prize: '100,000 VNĐ/đội',
      icon: <Award className="w-8 h-8 text-amber-600" />,
      gradient: 'from-amber-600/20 to-orange-700/20',
      border: 'border-amber-600/30'
    }
  ]

  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: 'Trải nghiệm thực tế',
      description: 'Trải nghiệm quy trình xây dựng và đánh giá mô hình AI thực tế, giống các kỳ thi AI học sinh như VOAI, VAIC, IOAI'
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: 'Rèn luyện tư duy',
      description: 'Rèn luyện tư duy dữ liệu và thuật toán thông qua bài toán AI thực tế'
    },
    {
      icon: <Lightbulb className="w-6 h-6" />,
      title: 'Hỗ trợ toàn diện',
      description: 'Notebook mẫu, workshop hướng dẫn, tài liệu giải thích, và được phép sử dụng AI tools để hỗ trợ lập trình'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Dành cho mọi cấp độ',
      description: 'Không yêu cầu nền tảng AI trước đó, phù hợp cho học sinh muốn thử sức với kỳ thi AI học thuật'
    }
  ]

  const supportItems = [
    {
      icon: <FileText className="w-6 h-6" />,
      title: 'Notebook mẫu cơ bản',
      description: 'Hướng dẫn cách huấn luyện mô hình AI từ dữ liệu vòng Public và xuất file kết quả hợp lệ'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Workshop hướng dẫn',
      description: 'Giải đáp thắc mắc, hướng dẫn chạy notebook lần đầu, và các lưu ý quan trọng (có ghi hình)'
    },
    {
      icon: <Lightbulb className="w-6 h-6" />,
      title: 'Tài liệu đi kèm',
      description: 'Giải thích khái niệm AI, phân tích cấu trúc mô hình, và gợi ý hướng cải tiến'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Công cụ AI hỗ trợ',
      description: 'Được phép sử dụng các công cụ AI để hỗ trợ lập trình, tập trung vào tư duy và cải tiến thuật toán'
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
              <Badge variant="warning" className="mb-6">
                Đang mở đăng ký
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6">
                <span className="gradient-text">PAIC 2026</span>
                <br />
                <span className="text-text-primary">PTNK AI Challenge 2026</span>
              </h1>
              <p className="text-xl text-text-secondary mb-8 max-w-3xl mx-auto leading-relaxed">
                PAIC 2026 là kỳ thi AI dành cho học sinh Phổ thông Năng khiếu do The Noders PTNK community tổ chức,
                được xây dựng theo hình thức thi đấu tương tự VOAI / VAIC / IOAI, với advisor là thầy Nguyễn Thành Lộc.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-text-secondary">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-primary-blue" />
                  <span>Thi theo đội 1-3 người</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-primary-blue" />
                  <span>05 - 18 Tháng 1, 2026</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-primary-blue" />
                  <span>1,600,000 VNĐ</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Overview Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-text-primary mb-6 text-center">
                Giới thiệu chung
              </h2>
              <Card className="bg-gradient-to-r from-primary-blue/10 to-accent-cyan/10 border-primary-blue/20 mb-8">
                <CardContent className="p-8">
                  <p className="text-text-secondary text-lg leading-relaxed mb-4">
                    PAIC 2026 là kỳ thi AI dành cho học sinh Phổ thông Năng khiếu do <span className="text-text-primary font-semibold">The Noders PTNK community</span> tổ chức,
                    được xây dựng theo hình thức thi đấu tương tự <span className="text-primary-blue font-semibold">VOAI / VAIC / IOAI</span>, với advisor là <span className="text-text-primary font-semibold">thầy Nguyễn Thành Lộc</span>.
                  </p>
                  <p className="text-text-secondary text-lg leading-relaxed mb-4">
                    Cuộc thi nhằm tạo sân chơi học thuật cho học sinh quan tâm đến AI:
                  </p>
                  <div className="space-y-3 mb-4">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                      <p className="text-text-secondary">Trải nghiệm quy trình xây dựng và đánh giá mô hình AI thực tế</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                      <p className="text-text-secondary">Rèn luyện tư duy dữ liệu và thuật toán</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                      <p className="text-text-secondary">Làm nền tảng cho việc tham gia các kỳ thi AI chuyên sâu trong tương lai</p>
                    </div>
                  </div>
                  <div className="bg-dark-surface/50 rounded-lg p-6 border border-dark-border/30">
                    <p className="text-text-secondary">
                      <strong className="text-text-primary">Đối tượng tham gia:</strong> Học sinh Trường Phổ thông Năng khiếu
                      có quan tâm đến Trí tuệ Nhân tạo và mong muốn thử sức trong một kỳ thi AI học thuật.
                      Không yêu cầu thí sinh phải có nền tảng AI trước đó, tuy nhiên cần có tinh thần học hỏi
                      và chủ động tìm hiểu trong quá trình thi.
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
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-dark-surface/30">
          <div className="container mx-auto">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl font-bold text-text-primary mb-8 text-center">
                Lịch trình kỳ thi
              </h2>
              <p className="text-text-secondary text-center mb-8">
                Thời gian đăng ký & thi đấu từ 28/12/2025 đến 18/01/2026
              </p>

              {/* Desktop Timeline */}
              <div className="hidden md:block relative">
                {/* Progress Bar Background */}
                <div className="absolute top-8 left-0 right-0 h-1 bg-dark-border/30 rounded-full">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-success via-warning to-dark-border/50 rounded-full transition-all duration-1000"
                    style={{ width: '25%' }}
                  ></div>
                </div>

                {/* Timeline Items */}
                <div className="relative flex justify-between items-start pt-16">
                  {timeline.map((item, index) => (
                    <div key={index} className="flex flex-col items-center flex-1 relative">
                      {/* Milestone Node */}
                      <div className={`absolute -top-16 w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all duration-500 ${
                        item.status === 'completed' ? 'bg-success border-success/30 shadow-lg shadow-success/50' :
                        item.status === 'ongoing' ? 'bg-warning border-warning/30 shadow-xl shadow-warning/60 animate-pulse' :
                        'bg-dark-surface border-dark-border/50'
                      }`}>
                        <div className={`w-8 h-8 rounded-full ${
                          item.status === 'completed' ? 'bg-white' :
                          item.status === 'ongoing' ? 'bg-white' :
                          'bg-dark-border'
                        }`}></div>
                      </div>

                      {/* Card */}
                      <Card variant="hover" className="w-full hover-lift">
                        <CardContent className="p-6">
                          <div className="text-center mb-4">
                            <Badge variant={item.status === 'ongoing' ? 'warning' : 'primary'} className="mb-2">
                              {item.date}
                            </Badge>
                            <h3 className="text-lg font-bold text-text-primary font-mono">
                              {item.title}
                            </h3>
                          </div>
                          <div className="space-y-3">
                            {item.items.map((subItem, subIndex) => (
                              <div key={subIndex} className="flex items-start space-x-2 text-sm">
                                <div className="flex-shrink-0 w-6 h-6 bg-primary-blue/10 border border-primary-blue/30 rounded flex items-center justify-center text-primary-blue mt-0.5">
                                  {subItem.icon}
                                </div>
                                <p className="text-text-secondary text-left">{subItem.text}</p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile Timeline */}
              <div className="md:hidden space-y-6">
                {timeline.map((item, index) => (
                  <Card key={index} variant="hover" className="hover-lift">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4 mb-4">
                        <div className={`flex-shrink-0 w-12 h-12 rounded-full border-4 flex items-center justify-center ${
                          item.status === 'completed' ? 'bg-success border-success/30' :
                          item.status === 'ongoing' ? 'bg-warning border-warning/30' :
                          'bg-dark-surface border-dark-border/50'
                        }`}>
                          <div className={`w-6 h-6 rounded-full ${
                            item.status === 'completed' ? 'bg-white' :
                            item.status === 'ongoing' ? 'bg-white' :
                            'bg-dark-border'
                          }`}></div>
                        </div>
                        <div className="flex-1">
                          <Badge variant={item.status === 'ongoing' ? 'warning' : 'primary'} className="mb-2">
                            {item.date}
                          </Badge>
                          <h3 className="text-lg font-bold text-text-primary font-mono">
                            {item.title}
                          </h3>
                        </div>
                      </div>
                      <div className="space-y-3 ml-16">
                        {item.items.map((subItem, subIndex) => (
                          <div key={subIndex} className="flex items-start space-x-2 text-sm">
                            <div className="flex-shrink-0 w-6 h-6 bg-primary-blue/10 border border-primary-blue/30 rounded flex items-center justify-center text-primary-blue mt-0.5">
                              {subItem.icon}
                            </div>
                            <p className="text-text-secondary">{subItem.text}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Competition Format */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-text-primary mb-8 text-center">
                Hình thức và nội dung thi
              </h2>

              <Card className="bg-gradient-to-r from-primary-blue/10 to-accent-cyan/10 border-primary-blue/20 mb-8">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-text-primary mb-3 flex items-center space-x-3">
                        <Users className="w-6 h-6 text-primary-blue" />
                        <span>Hình thức thi đấu</span>
                      </h3>
                      <p className="text-text-secondary leading-relaxed ml-9">
                        Thi đấu online, theo đội từ 1–3 học sinh. Mỗi thí sinh chỉ được tham gia 01 đội,
                        đội được cố định sau khi kỳ thi bắt đầu.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-text-primary mb-3 flex items-center space-x-3">
                        <Target className="w-6 h-6 text-primary-blue" />
                        <span>Cấu trúc cuộc thi</span>
                      </h3>
                      <p className="text-text-secondary leading-relaxed ml-9 mb-4">
                        Cuộc thi gồm 02 vòng:
                      </p>

                      <div className="ml-9 space-y-4">
                        <div className="bg-dark-surface/50 rounded-lg p-6 border border-dark-border/30">
                          <h4 className="text-lg font-semibold text-text-primary mb-2 flex items-center space-x-2">
                            <BarChart3 className="w-5 h-5 text-success" />
                            <span>Vòng Public</span>
                          </h4>
                          <p className="text-sm text-text-secondary mb-2">
                            <strong>Thời gian:</strong> Thứ Hai 05/01/2026 – Thứ Bảy 17/01/2026
                          </p>
                          <p className="text-text-secondary text-sm leading-relaxed">
                            Ban tổ chức cung cấp tập dữ liệu huấn luyện và tập test public.
                            Thí sinh xây dựng mô hình AI, nộp kết quả để được chấm điểm và xếp hạng tạm thời.
                          </p>
                        </div>

                        <div className="bg-dark-surface/50 rounded-lg p-6 border border-dark-border/30">
                          <h4 className="text-lg font-semibold text-text-primary mb-2 flex items-center space-x-2">
                            <Zap className="w-5 h-5 text-warning" />
                            <span>Vòng Private</span>
                          </h4>
                          <p className="text-sm text-text-secondary mb-2">
                            <strong>Thời gian:</strong> Chủ nhật 18/01/2026
                          </p>
                          <p className="text-text-secondary text-sm leading-relaxed">
                            Ban tổ chức mở thêm dữ liệu và thay đổi tập test.
                            Thí sinh có 24 giờ để tiếp tục cải thiện mô hình và nộp kết quả cuối cùng.
                          </p>
                        </div>
                      </div>

                      <div className="ml-9 mt-4 p-4 bg-primary-blue/10 border border-primary-blue/30 rounded-lg">
                        <p className="text-text-secondary text-sm">
                          <Trophy className="w-4 h-4 inline mr-2 text-primary-blue" />
                          <strong className="text-text-primary">Bảng xếp hạng chung cuộc</strong> được tính dựa trên điểm trung bình của vòng Public và vòng Private.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Support Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-dark-surface/30">
          <div className="container mx-auto">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-text-primary mb-8 text-center">
                Hỗ trợ thí sinh
              </h2>
              <p className="text-text-secondary text-center mb-8">
                Ban tổ chức cung cấp đầy đủ tài nguyên để người mới vẫn có thể tham gia
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {supportItems.map((item, index) => (
                  <Card key={index} variant="hover" className="hover-lift">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary-blue/20 to-accent-cyan/10 border border-primary-blue/30 rounded-xl flex items-center justify-center text-primary-blue">
                          {item.icon}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-text-primary mb-2">
                            {item.title}
                          </h3>
                          <p className="text-text-secondary text-sm leading-relaxed">
                            {item.description}
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

        {/* Prizes Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                Giải thưởng
              </h2>
              <p className="text-text-secondary text-lg">
                Giải thưởng được tính theo đội • Tổng giải thưởng <span className="text-primary-blue font-bold">1,600,000 VNĐ</span>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {prizes.map((prize, index) => (
                <Card
                  key={index}
                  className={`group relative overflow-hidden bg-gradient-to-br ${prize.gradient} border-2 ${prize.border} hover:shadow-2xl transition-all duration-300 ${index === 0 ? 'md:scale-105' : ''}`}
                >
                  <CardContent className="p-12 relative z-10">
                    {/* Icon */}
                    <div className="flex justify-center mb-8">
                      <div className="relative">
                        {prize.icon}
                        {index === 0 && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                            <Trophy className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Rank */}
                    <h3 className="text-2xl md:text-3xl font-bold text-text-primary mb-3 text-center">
                      {prize.rank}
                    </h3>

                    {/* Count */}
                    <p className="text-text-secondary text-sm mb-6 text-center font-medium">
                      {prize.count}
                    </p>

                    {/* Prize Amount */}
                    <div className="bg-dark-surface/50 rounded-xl p-6 border border-dark-border/30 mb-4">
                      <div className="text-4xl font-bold text-primary-blue text-center">
                        {prize.prize}
                      </div>
                    </div>

                    {/* Highlight for top prize */}
                    {index === 0 && (
                      <div className="mt-4 py-2 px-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                        <p className="text-yellow-500 text-sm font-medium text-center">Giải cao nhất</p>
                      </div>
                    )}
                  </CardContent>

                  {/* Animated gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-blue/5 via-transparent to-accent-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  {/* Shine effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Total Prize Pool */}
            <div className="mt-12 text-center">
              <Card className="inline-block bg-gradient-to-r from-primary-blue/20 to-accent-cyan/20 border-primary-blue/40">
                <CardContent className="py-6 px-12">
                  <p className="text-text-secondary text-sm mb-2">Tổng giá trị giải thưởng</p>
                  <p className="text-5xl font-bold bg-gradient-to-r from-primary-blue to-accent-cyan bg-clip-text text-transparent">
                    1,600,000 VNĐ
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-dark-surface/30">
          <div className="container mx-auto">
            <Card className="text-center bg-gradient-to-r from-primary-blue/10 to-accent-cyan/10 border-primary-blue/20">
              <CardContent className="p-12">
                <h2 className="text-3xl font-bold text-text-primary mb-4">
                  Sẵn sàng tham gia?
                </h2>
                <p className="text-text-secondary text-lg mb-8 max-w-2xl mx-auto">
                  Đăng ký tham gia PAIC 2026 - Kỳ thi học thuật về AI do The Noders tổ chức.
                  Trải nghiệm quy trình AI thực tế và tranh tài cùng các học sinh PTNK!
                </p>
                <Link href="https://forms.gle/4PnaDe4DXQk41Q6t8" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="group">
                    Đăng ký ngay
                    <ExternalLink className="ml-2 w-4 h-4 group-hover:scale-110 transition-transform" />
                  </Button>
                </Link>
                <p className="text-text-secondary text-sm mt-4">
                  Thời gian đăng ký: 28/12/2025 - 03/01/2026
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </>
  )
}
