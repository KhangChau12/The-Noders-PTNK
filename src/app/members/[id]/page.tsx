'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useMember } from '@/lib/hooks'
import { Card, CardContent, CardHeader } from '@/components/Card'
import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'
import { Loading } from '@/components/Loading'
import { Avatar } from '@/components/Avatar'
import {
  ArrowLeft,
  Award,
  BadgeCheck,
  Calendar,
  Clock,
  BookOpen,
  Users,
  ChevronDown,
  ExternalLink,
  FileText,
  Github,
  Linkedin,
  Twitter,
  Facebook,
  Globe,
  Mail,
} from 'lucide-react'

interface Certificate {
  id: string
  certificate_id: string
  title: string
  gen_number: number
  issued_at: string
}

function MemberCertificates({ certificates }: { certificates: Certificate[] }) {
  const hasCertificates = certificates && certificates.length > 0

  return (
    <Card className="mb-8 border-l-4 border-l-accent-purple bg-dark-surface/50 hover:bg-dark-surface transition-colors">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-text-primary flex items-center gap-2">
            <Award className="w-5 h-5 text-accent-purple" />
            Certificates & Achievements
          </h3>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-medium text-emerald-400">
              {hasCertificates ? certificates.length : 0} Verified
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {hasCertificates ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
            {certificates.map((cert) => (
              <Link key={cert.id} href={`/verify/${cert.certificate_id}`} className="h-full">
                <div className="group relative h-full bg-dark-bg rounded-xl border border-dark-border overflow-hidden transition-all duration-300 hover:border-accent-purple/40 hover:[box-shadow:0_0_20px_-4px_rgba(139,92,246,0.35)]">
                  {/* left accent bar */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-accent-purple via-indigo-500 to-accent-purple/30 rounded-l-xl" />

                  <div className="flex items-center gap-4 p-4 pl-5 h-full">
                    {/* icon */}
                    <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-accent-purple/20 to-indigo-500/20 border border-accent-purple/20 flex items-center justify-center group-hover:from-accent-purple/30 group-hover:to-indigo-500/30 transition-colors">
                      <Award className="w-5 h-5 text-accent-purple" />
                    </div>

                    {/* text */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between gap-2">
                      <h4 className="text-text-primary font-semibold text-sm leading-snug line-clamp-2 group-hover:text-accent-purple transition-colors">
                        {cert.title}
                      </h4>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[10px] text-text-tertiary bg-dark-surface px-1.5 py-0.5 rounded border border-dark-border truncate max-w-[120px]">
                          {cert.certificate_id}
                        </span>
                        <span className="text-[10px] text-text-tertiary whitespace-nowrap flex-shrink-0">
                          {new Date(cert.issued_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    {/* external link indicator */}
                    <ExternalLink className="w-3.5 h-3.5 text-text-tertiary opacity-0 group-hover:opacity-100 flex-shrink-0 transition-opacity" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 rounded-xl border-2 border-dashed border-dark-border">
            <div className="w-14 h-14 rounded-full bg-dark-surface border border-dark-border flex items-center justify-center mb-4">
              <Award className="w-7 h-7 text-text-tertiary opacity-40" />
            </div>
            <h4 className="text-text-primary font-medium mb-1">No Certificates Yet</h4>
            <p className="text-text-tertiary text-sm max-w-xs text-center">
              This member hasn't added any certificates or achievements.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function TaskStatistics({ taskStats }: { taskStats: { task_name: string; repetitions: number; total_points: number }[] }) {
  const hasTasks = taskStats.length > 0

  return (
    <Card className="mb-8 border-l-4 border-l-primary-blue bg-dark-surface/50 hover:bg-dark-surface transition-colors">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-text-primary flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary-blue" />
            Task Statistics
          </h3>
          <Badge variant="secondary" className="bg-primary-blue/10 text-primary-blue border-primary-blue/20">
            {hasTasks ? taskStats.length : 0} Task Types
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {hasTasks ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-dark-border text-text-tertiary uppercase tracking-wider text-xs">
                  <th className="py-3 pr-4 text-left">Task</th>
                  <th className="py-3 px-4 text-center">Times Done</th>
                  <th className="py-3 pl-4 text-right">Total Points</th>
                </tr>
              </thead>
              <tbody>
                {taskStats.map((task) => (
                  <tr key={task.task_name} className="border-b border-dark-border/50 last:border-b-0">
                    <td className="py-4 pr-4">
                      <div className="font-medium text-text-primary">{task.task_name}</div>
                    </td>
                    <td className="py-4 px-4 text-center text-text-secondary tabular-nums">{task.repetitions}</td>
                    <td className="py-4 pl-4 text-right font-semibold text-primary-blue tabular-nums">
                      {task.total_points.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-dark-bg border border-dark-border flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6 text-text-tertiary opacity-50" />
            </div>
            <h4 className="text-text-primary font-medium mb-1">No Task Activity Yet</h4>
            <p className="text-text-tertiary text-sm max-w-sm mx-auto">
              This member has not been assigned any scored tasks yet.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ProjectHistory({ projects }: { projects: any[] }) {
  const contributedProjects = projects.filter((p) => p.role_in_project !== 'Creator')
  const createdProjects = projects.filter((p) => p.role_in_project === 'Creator')

  return (
    <div className="space-y-6">
      {contributedProjects.length > 0 && (
        <div>
          <h4 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Contributed Projects ({contributedProjects.length})
          </h4>
          <div className="space-y-4">
            {contributedProjects.slice(0, 3).map((contribution, index) => {
              const project = contribution.projects || contribution.project
              if (!project) return null

              return (
                <Link
                  key={index}
                  href={`/products/${project.id}`}
                  className="group block p-4 rounded-lg bg-dark-surface border border-dark-border hover:bg-dark-border/50 transition-all duration-200"
                >
                  <div className="flex gap-4">
                    {project.thumbnail_url && (
                      <div className="w-32 h-24 relative rounded-lg overflow-hidden flex-shrink-0 bg-dark-bg border border-dark-border/30">
                        <Image
                          src={project.thumbnail_url}
                          alt={project.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-text-primary mb-2 group-hover:text-primary-blue transition-colors text-lg truncate">
                        {project.title}
                      </h5>
                      <p className="text-sm text-text-secondary mb-3 line-clamp-2">
                        {project.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-text-tertiary">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-dark-border rounded-full h-1.5">
                            <div
                              className="bg-primary-blue h-1.5 rounded-full transition-all"
                              style={{ width: `${contribution.contribution_percentage}%` }}
                            />
                          </div>
                          <span>{contribution.contribution_percentage}%</span>
                        </div>
                        <Badge variant="secondary" size="sm">
                          {project.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {createdProjects.length > 0 && (
        <div>
          <h4 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Award className="w-4 h-4" />
            Created Projects ({createdProjects.length})
          </h4>
          <div className="space-y-4">
            {createdProjects.slice(0, 3).map((contribution, index) => {
              const project = contribution.projects || contribution.project
              if (!project) return null

              return (
                <Link
                  key={index}
                  href={`/products/${project.id}`}
                  className="group block p-4 rounded-lg bg-dark-surface border border-dark-border hover:bg-dark-border/50 transition-all duration-200"
                >
                  <div className="flex gap-4">
                    {project.thumbnail_url && (
                      <div className="w-32 h-24 relative rounded-lg overflow-hidden flex-shrink-0 bg-dark-bg border border-dark-border/30">
                        <Image
                          src={project.thumbnail_url}
                          alt={project.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-text-primary mb-2 group-hover:text-primary-blue transition-colors text-lg truncate">
                        {project.title}
                      </h5>
                      <p className="text-sm text-text-secondary mb-3 line-clamp-2">
                        {project.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-text-tertiary">
                        <span>Project Lead</span>
                        <Badge variant="secondary" size="sm">
                          {project.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function MemberPosts({ posts }: { posts: any[] }) {
  const [visibleCount, setVisibleCount] = useState(3)

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-12 h-12 text-text-tertiary mx-auto mb-4 opacity-50" />
        <p className="text-text-secondary">No posts published yet</p>
      </div>
    )
  }

  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200
    const words = content?.split(/\s+/).length || 0
    return Math.ceil(words / wordsPerMinute)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return 'Yesterday'
    if (diffInDays < 7) return `${diffInDays} days ago`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const visiblePosts = posts.slice(0, visibleCount)

  return (
    <div className="space-y-4">
      {visiblePosts.map((post) => {
        const thumbnailSrc = post.thumbnail_image?.public_url || post.thumbnail_url
        const readingTime = calculateReadingTime(post.content || '')

        return (
          <Link key={post.id} href={`/posts/${post.slug}`} className="group block">
            <article className="flex gap-4 p-4 rounded-lg border border-dark-border bg-dark-surface hover:bg-dark-border/50 transition-all duration-200">
              {thumbnailSrc && (
                <div className="flex-shrink-0 w-32 h-24 relative rounded-lg overflow-hidden bg-gradient-to-br from-primary-blue/20 to-accent-cyan/20">
                  <img
                    src={thumbnailSrc}
                    alt={post.thumbnail_image?.alt_text || post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}

              <div className="flex-1 min-w-0">
                {post.category && (
                  <Badge variant="secondary" size="sm" className="mb-2">
                    {post.category}
                  </Badge>
                )}

                <h3 className="font-semibold text-text-primary text-lg mb-2 line-clamp-2 group-hover:text-primary-blue transition-colors">
                  {post.title}
                </h3>

                {post.summary && (
                  <p className="text-sm text-text-secondary mb-3 line-clamp-2">
                    {post.summary}
                  </p>
                )}

                <div className="flex items-center gap-4 text-xs text-text-tertiary">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(post.published_at || post.created_at)}</span>
                  </div>

                  {readingTime > 0 && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{readingTime} min read</span>
                    </div>
                  )}

                  <Badge variant={post.status === 'published' ? 'success' : 'secondary'} size="sm">
                    {post.status}
                  </Badge>
                </div>
              </div>
            </article>
          </Link>
        )
      })}

      {visibleCount < posts.length && (
        <div className="text-center pt-4">
          <Button variant="ghost" onClick={() => setVisibleCount((prev) => prev + 3)} className="w-full">
            Load More Posts <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  )
}

export default function MemberProfilePage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const { member, loading, error } = useMember(id)
  const [posts, setPosts] = useState<any[]>([])
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [postsLoading, setPostsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!member?.id) return

      try {
        const supabase = createClient()
        const { postQueries } = await import('@/lib/queries')
        const { posts: fetchedPosts, error: postsError } = await postQueries.getUserPosts(member.id)

        if (!postsError && fetchedPosts) {
          setPosts(fetchedPosts.filter((post) => post.status === 'published'))
        }

        const { data: certs } = await supabase
          .from('certificates')
          .select('id, certificate_id, title, gen_number, issued_at')
          .eq('user_id', member.id)
          .order('issued_at', { ascending: false })

        if (certs) {
          setCertificates(certs)
        }
      } catch (fetchError) {
        console.error('Error fetching member detail data:', fetchError)
      } finally {
        setPostsLoading(false)
      }
    }

    fetchData()
  }, [member?.id])

  if (loading) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <Loading />
        </div>
      </div>
    )
  }

  if (error || !member) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-6xl mb-4 opacity-50">👤</div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">Member Not Found</h2>
              <p className="text-text-secondary mb-6">
                The member profile you're looking for doesn't exist.
              </p>
              <Button onClick={() => router.push('/members')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Members
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const socialLinks = member.social_links || {}
  const totalPoints = member.total_points || 0
  const taskStats = member.task_stats || []

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="mb-8">
          <Link href="/members" className="inline-flex items-center text-text-secondary hover:text-primary-blue transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Members
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <Card className="overflow-hidden">
              {/* decorative glow orbs */}
              <div className="absolute -top-10 -left-10 w-48 h-48 rounded-full bg-primary-blue/35 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full bg-accent-purple/35 blur-3xl pointer-events-none" />

              <CardContent className="relative text-center p-8">
                <div className="relative mx-auto mb-6 flex justify-center">
                  <Avatar
                    name={member.full_name}
                    src={member.avatar_url}
                    size="xl"
                    className="w-32 h-32"
                  />
                </div>

                <h1 className="text-2xl font-bold text-text-primary mb-2">{member.full_name || member.username}</h1>
                <p className="text-text-secondary mb-1">@{member.username}</p>
                <Badge variant={member.role === 'admin' ? 'primary' : 'secondary'} className="mb-4">
                  {member.role === 'admin' ? 'Core Team' : 'Member'}
                </Badge>

                {member.bio && (
                  <p className="text-text-secondary text-sm leading-relaxed mb-6">{member.bio}</p>
                )}

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-blue">{totalPoints.toLocaleString()}</div>
                    <div className="text-xs text-text-tertiary">Points</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-blue">{postsLoading ? '...' : posts.length}</div>
                    <div className="text-xs text-text-tertiary">Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-blue">{member.contest_count || 0}</div>
                    <div className="text-xs text-text-tertiary">Contests</div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-sm text-text-tertiary mb-6">
                  <Calendar className="w-4 h-4" />
                  Joined {new Date(member.created_at).toLocaleDateString()}
                </div>

                <div className="flex justify-center space-x-4">
                  <a href="mailto:phuckhangtdn@gmail.com" className="text-text-tertiary hover:text-primary-blue transition-colors" title="Email">
                    <Mail className="w-5 h-5" />
                  </a>
                  {socialLinks.github && (
                    <a href={socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-text-tertiary hover:text-primary-blue transition-colors" title="GitHub">
                      <Github className="w-5 h-5" />
                    </a>
                  )}
                  {socialLinks.linkedin && (
                    <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-text-tertiary hover:text-primary-blue transition-colors" title="LinkedIn">
                      <Linkedin className="w-5 h-5" />
                    </a>
                  )}
                  {socialLinks.twitter && (
                    <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-text-tertiary hover:text-primary-blue transition-colors" title="Twitter">
                      <Twitter className="w-5 h-5" />
                    </a>
                  )}
                  {socialLinks.facebook && (
                    <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-text-tertiary hover:text-primary-blue transition-colors" title="Facebook">
                      <Facebook className="w-5 h-5" />
                    </a>
                  )}
                  {socialLinks.website && (
                    <a href={socialLinks.website} target="_blank" rel="noopener noreferrer" className="text-text-tertiary hover:text-primary-blue transition-colors" title="Website">
                      <Globe className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <MemberCertificates certificates={certificates} />
            <TaskStatistics taskStats={taskStats} />

            {member.contributed_projects?.length > 0 && (
              <Card>
                <CardHeader>
                  <h3 className="text-xl font-semibold text-text-primary">Project Portfolio</h3>
                </CardHeader>
                <CardContent>
                  <ProjectHistory projects={member.contributed_projects} />
                </CardContent>
              </Card>
            )}

            {posts.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-text-primary flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      Published Articles
                    </h3>
                    <span className="text-sm text-text-tertiary">
                      {posts.length} {posts.length === 1 ? 'article' : 'articles'}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  {postsLoading ? (
                    <div className="text-center py-8">
                      <Loading size="md" />
                    </div>
                  ) : (
                    <MemberPosts posts={posts} />
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
