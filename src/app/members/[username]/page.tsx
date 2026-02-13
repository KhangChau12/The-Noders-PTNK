'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useMember } from '@/lib/hooks'
import { Card, CardContent, CardHeader } from '@/components/Card'
import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'
import { Loading } from '@/components/Loading'
import { Avatar } from '@/components/Avatar'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import {
  ArrowLeft,
  Mail,
  Github,
  Linkedin,
  Twitter,
  Facebook,
  Globe,
  MapPin,
  Calendar,
  Award,
  TrendingUp,
  Users,
  Code,
  ExternalLink,
  Clock,
  BookOpen,
  ChevronDown,
  GraduationCap
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
          <Badge variant="secondary" className="bg-accent-purple/10 text-accent-purple border-accent-purple/20">
             {hasCertificates ? certificates.length : 0} Verified
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {hasCertificates ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certificates.map((cert) => (
               <Link key={cert.id} href={`/verify/${cert.certificate_id}`}>
                  <div className="bg-dark-bg p-4 rounded-xl border border-dark-border hover:border-accent-purple/50 transition-all group">
                     <div className="flex items-start justify-between mb-2">
                        <div className="w-10 h-10 rounded-lg bg-accent-purple/10 flex items-center justify-center group-hover:bg-accent-purple/20 transition-colors">
                           <Award className="w-5 h-5 text-accent-purple" />
                        </div>
                        <Badge variant="outline" size="sm" className="font-mono text-xs">
                           {cert.certificate_id}
                        </Badge>
                     </div>
                     <h4 className="text-text-primary font-medium group-hover:text-accent-purple transition-colors line-clamp-1">{cert.title}</h4>
                     <p className="text-text-tertiary text-xs mt-1">Issued {new Date(cert.issued_at).toLocaleDateString()}</p>
                  </div>
               </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-dark-bg border border-dark-border flex items-center justify-center mx-auto mb-3">
              <Award className="w-6 h-6 text-text-tertiary opacity-50" />
            </div>
            <h4 className="text-text-primary font-medium mb-1">No Certificates Yet</h4>
            <p className="text-text-tertiary text-sm max-w-sm mx-auto">
              This member hasn't added any certificates or achievements.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface SkillChartProps {
  skills: string[]
}





interface ProjectHistoryProps {
  projects: any[]
  username: string
}

function ProjectHistory({ projects, username }: ProjectHistoryProps) {
  const contributedProjects = projects.filter(p => p.role_in_project !== 'Creator')
  const createdProjects = projects.filter(p => p.role_in_project === 'Creator')

  return (
    <div className="space-y-6">
      {/* Contributed Projects */}
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
                  href={`/projects/${project.id}`}
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
          {contributedProjects.length > 3 && (
            <Link
              href="/projects"
              className="block text-center text-primary-blue hover:text-primary-blue/80 transition-colors mt-4"
            >
              View all contributed projects →
            </Link>
          )}
        </div>
      )}

      {/* Created Projects */}
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
                  href={`/projects/${project.id}`}
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

interface MemberPostsProps {
  posts: any[]
  memberName: string
}

function MemberPosts({ posts, memberName }: MemberPostsProps) {
  const [visibleCount, setVisibleCount] = useState(3)

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-12 h-12 text-text-tertiary mx-auto mb-4 opacity-50" />
        <p className="text-text-secondary">No posts published yet</p>
      </div>
    )
  }

  // Helper to calculate reading time
  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200
    const words = content?.split(/\s+/).length || 0
    const minutes = Math.ceil(words / wordsPerMinute)
    return minutes
  }

  // Helper to format date
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
          <Link
            key={post.id}
            href={`/posts/${post.slug}`}
            className="group block"
          >
            <article className="flex gap-4 p-4 rounded-lg border border-dark-border bg-dark-surface hover:bg-dark-border/50 transition-all duration-200">
              {/* Thumbnail */}
              {thumbnailSrc && (
                <div className="flex-shrink-0 w-32 h-24 relative rounded-lg overflow-hidden bg-gradient-to-br from-primary-blue/20 to-accent-cyan/20">
                  <img
                    src={thumbnailSrc}
                    alt={post.thumbnail_image?.alt_text || post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Category Badge */}
                {post.category && (
                  <Badge variant="secondary" size="sm" className="mb-2">
                    {post.category}
                  </Badge>
                )}

                {/* Title */}
                <h3 className="font-semibold text-text-primary text-lg mb-2 line-clamp-2 group-hover:text-primary-blue transition-colors">
                  {post.title}
                </h3>

                {/* Excerpt */}
                {post.excerpt && (
                  <p className="text-sm text-text-secondary mb-3 line-clamp-2">
                    {post.excerpt}
                  </p>
                )}

                {/* Metadata */}
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

                  <Badge
                    variant={post.status === 'published' ? 'success' : 'secondary'}
                    size="sm"
                  >
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
          <Button 
            variant="ghost" 
            onClick={() => setVisibleCount(prev => prev + 3)}
            className="w-full"
          >
            Load More Posts <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  )
}

interface ActivityTimelineProps {
  member: any
}

function ActivityTimeline({ member }: ActivityTimelineProps) {
  const timelineItems = [
    // Map from member.created_projects as bonus timeline items
    ...(Array.isArray(member.contributed_projects)
      ? member.contributed_projects.map((project: any) => ({
          date: new Date(project.created_at).toDateString(),
          type: 'project',
          title: `Created project ${project.projects.title}`,
          description: project.description || ''
        }))
      : []),
    ...(Array.isArray(member.created_projects)
      ? member.created_projects.map((project: any) => ({
          date: new Date(project.created_at).toDateString(),
          type: 'project',
          title: `Created project ${project.projects.title}`,
          description: project.description || ''
        }))
      : []),
    {
      date: new Date(member.created_at).toDateString(),
      type: 'join',
      title: 'Joined The Noders PTNK',
      description: `Welcome ${member.full_name || member.username} to the team!`
    }
  ]

  // Sort timelineItems by date descending (most recent first)
  timelineItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      {timelineItems.map((item, index) => (
        <div key={index} className="flex gap-4">
          <div className="flex-shrink-0 w-10 h-10 bg-primary-blue/20 rounded-full flex items-center justify-center">
            {item.type === 'project' ? (
              <Code className="w-4 h-4 text-primary-blue" />
            ) : (
              <Users className="w-4 h-4 text-primary-blue" />
            )}
          </div>
          <div className="flex-1">
            <h5 className="font-medium text-text-primary">{item.title}</h5>
            <p className="text-sm text-text-secondary mb-1">{item.description}</p>
            <p className="text-xs text-text-tertiary">{item.date}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function MemberProfilePage() {
  const params = useParams()
  const router = useRouter()
  const username = params.username as string

  const { member, loading, error } = useMember(username);
  const [posts, setPosts] = useState<any[]>([])
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [postsLoading, setPostsLoading] = useState(true)

  console.log(member);

  // Fetch member's posts and certificates
  useEffect(() => {
    const fetchData = async () => {
      if (!member?.id) return

      try {
        const supabase = createClient()
        
        // Fetch Posts
        const { postQueries } = await import('@/lib/queries')
        const { posts: fetchedPosts, error: postsError } = await postQueries.getUserPosts(member.id)

        if (!postsError && fetchedPosts) {
          // Only show published posts for non-owner viewers
          const publishedPosts = fetchedPosts.filter(p => p.status === 'published')
          setPosts(publishedPosts)
        }

        // Fetch Certificates
        const { data: certs } = await supabase
          .from('certificates')
          .select('id, certificate_id, title, gen_number, issued_at')
          .eq('user_id', member.id)
          .order('issued_at', { ascending: false })
        
        if (certs) {
          setCertificates(certs)
        }

      } catch (error) {
        console.error('Error fetching data:', error)
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
              <h2 className="text-2xl font-bold text-text-primary mb-2">
                Member Not Found
              </h2>
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

  // Use CSS Avatar component instead of external image
  const socialLinks = member.social_links || {}
  const totalProjects = (member.contributed_projects?.length || 0);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        {/* Back Navigation */}
        <div className="mb-8">
          <Link
            href="/members"
            className="inline-flex items-center text-text-secondary hover:text-primary-blue transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Members
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Sidebar */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            {/* Basic Info */}
            <Card>
              <CardContent className="text-center p-8">
                {/* Avatar */}
                <div className="relative mx-auto mb-6 flex justify-center">
                  <Avatar
                    name={member.full_name}
                    src={member.avatar_url}
                    size="xl"
                    className="w-32 h-32"
                  />
                  {member.role === 'admin' && (
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary-blue rounded-full flex items-center justify-center">
                      <Award className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>

                {/* Name and Role */}
                <h1 className="text-2xl font-bold text-text-primary mb-2">
                  {member.full_name || member.username}
                </h1>
                <p className="text-text-secondary mb-1">@{member.username}</p>
                <Badge variant={member.role === 'admin' ? 'primary' : 'secondary'} className="mb-4">
                  {member.role === 'admin' ? 'Core Team' : 'Member'}
                </Badge>

                {/* Bio */}
                {member.bio && (
                  <p className="text-text-secondary text-sm leading-relaxed mb-6">
                    {member.bio}
                  </p>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-blue">
                      {totalProjects}
                    </div>
                    <div className="text-xs text-text-tertiary">Projects</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-blue">
                      {postsLoading ? '...' : posts.length}
                    </div>
                    <div className="text-xs text-text-tertiary">Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-blue">
                      {member.contest_count || 0}
                    </div>
                    <div className="text-xs text-text-tertiary">Contests</div>
                  </div>
                </div>

                {/* Join Date */}
                <div className="flex items-center justify-center gap-2 text-sm text-text-tertiary mb-6">
                  <Calendar className="w-4 h-4" />
                  Joined {new Date(member.created_at).toLocaleDateString()}
                </div>

                {/* Social Links */}
                <div className="flex justify-center space-x-4">
                  <a
                    href="mailto:phuckhangtdn@gmail.com"
                    className="text-text-tertiary hover:text-primary-blue transition-colors"
                    title="Email"
                  >
                    <Mail className="w-5 h-5" />
                  </a>
                  {socialLinks.github && (
                    <a
                      href={socialLinks.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-text-tertiary hover:text-primary-blue transition-colors"
                      title="GitHub"
                    >
                      <Github className="w-5 h-5" />
                    </a>
                  )}
                  {socialLinks.linkedin && (
                    <a
                      href={socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-text-tertiary hover:text-primary-blue transition-colors"
                      title="LinkedIn"
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                  )}
                  {socialLinks.twitter && (
                    <a
                      href={socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-text-tertiary hover:text-primary-blue transition-colors"
                      title="Twitter"
                    >
                      <Twitter className="w-5 h-5" />
                    </a>
                  )}
                  {socialLinks.facebook && (
                    <a
                      href={socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-text-tertiary hover:text-primary-blue transition-colors"
                      title="Facebook"
                    >
                      <Facebook className="w-5 h-5" />
                    </a>
                  )}
                  {socialLinks.website && (
                    <a
                      href={socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-text-tertiary hover:text-primary-blue transition-colors"
                      title="Website"
                    >
                      <Globe className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Certificates - Top Importance */}
            <MemberCertificates certificates={certificates} />

            {/* Project History */}
            {totalProjects > 0 && (
              <Card>
                <CardHeader>
                  <h3 className="text-xl font-semibold text-text-primary">Project Portfolio</h3>
                </CardHeader>
                <CardContent>
                  <ProjectHistory
                    projects={member.contributed_projects}
                    username={member.username}
                  />
                </CardContent>
              </Card>
            )}

            {/* Published Articles */}
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
                    <MemberPosts
                      posts={posts}
                      memberName={member.full_name || member.username}
                    />
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