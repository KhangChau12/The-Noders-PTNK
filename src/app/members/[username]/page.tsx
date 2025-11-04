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
  BookOpen
} from 'lucide-react'

interface SkillChartProps {
  skills: string[]
}

function SkillChart({ skills }: SkillChartProps) {
  if (!skills || skills.length === 0) return null

  const skillsWithCategories = skills.map((skill, index) => ({
    name: skill,
    category: getSkillCategory(skill)
  }))

  return (
    <div className="flex flex-wrap gap-2">
      {skillsWithCategories.map((skill, index) => (
        <div key={index} className="flex items-center gap-2">
          <Badge variant="tech" size="sm">
            {skill.name}
          </Badge>
          <span className="text-xs text-text-tertiary capitalize">
            {skill.category}
          </span>
        </div>
      ))}
    </div>
  )
}

function getSkillCategory(skill: string): string {
  const frontendSkills = ['React', 'Next.js', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Tailwind']
  const backendSkills = ['Node.js', 'Python', 'FastAPI', 'Express', 'Django', 'Java', 'C#']
  const aiMlSkills = ['Machine Learning', 'TensorFlow', 'PyTorch', 'AI', 'NLP', 'Computer Vision']
  const devopsSkills = ['Docker', 'Kubernetes', 'AWS', 'GCP', 'CI/CD', 'DevOps']

  if (frontendSkills.some(s => skill.toLowerCase().includes(s.toLowerCase()))) return 'frontend'
  if (backendSkills.some(s => skill.toLowerCase().includes(s.toLowerCase()))) return 'backend'
  if (aiMlSkills.some(s => skill.toLowerCase().includes(s.toLowerCase()))) return 'ai/ml'
  if (devopsSkills.some(s => skill.toLowerCase().includes(s.toLowerCase()))) return 'devops'
  return 'other'
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
                  className="block p-4 rounded-lg bg-dark-surface hover:bg-dark-border transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h5 className="font-medium text-text-primary mb-1">
                        {project.title}
                      </h5>
                      <p className="text-sm text-text-secondary mb-2 line-clamp-2">
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
                    {project.thumbnail_url && (
                      <div className="w-16 h-12 relative rounded overflow-hidden flex-shrink-0">
                        <Image
                          src={project.thumbnail_url}
                          alt={project.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
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
                  className="block px-4 py-3 rounded-lg bg-dark-surface border hover:bg-dark-border transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h5 className="font-medium text-text-primary mb-1">
                        {project.title}
                      </h5>
                      <p className="text-sm text-text-secondary mb-2 line-clamp-2">
                        {project.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-text-tertiary">
                        <span>Project Lead</span>
                        <Badge variant="secondary" size="sm">
                          {project.status}
                        </Badge>
                      </div>
                    </div>
                    {project.thumbnail_url && (
                      <div className="w-16 h-12 relative rounded overflow-hidden flex-shrink-0">
                        <Image
                          src={project.thumbnail_url}
                          alt={project.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
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

  return (
    <div className="space-y-4">
      {posts.map((post) => {
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
  const [postsLoading, setPostsLoading] = useState(true)

  console.log(member);

  // Fetch member's posts with full data
  useEffect(() => {
    const fetchMemberPosts = async () => {
      if (!member?.id) return

      try {
        const { postQueries } = await import('@/lib/queries')
        const { posts: fetchedPosts, error: postsError } = await postQueries.getUserPosts(member.id)

        if (!postsError && fetchedPosts) {
          // Only show published posts for non-owner viewers
          const publishedPosts = fetchedPosts.filter(p => p.status === 'published')
          setPosts(publishedPosts)
        }
      } catch (error) {
        console.error('Error fetching member posts:', error)
      } finally {
        setPostsLoading(false)
      }
    }

    fetchMemberPosts()
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
          <div className="space-y-6">
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
                  {member.role === 'admin' ? 'Admin' : 'Member'}
                </Badge>

                {/* Bio */}
                {member.bio && (
                  <p className="text-text-secondary text-sm leading-relaxed mb-6">
                    {member.bio}
                  </p>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
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

            {/* Skills */}
            {member.skills && member.skills.length > 0 && (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                    <Code className="w-4 h-4" />
                    Skills & Expertise
                  </h3>
                </CardHeader>
                <CardContent>
                  <SkillChart skills={member.skills} />
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Statistics
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Total Projects</span>
                  <span className="font-semibold text-text-primary">{totalProjects}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Posts Written</span>
                  <span className="font-semibold text-text-primary">
                    {postsLoading ? '...' : posts.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Created Projects</span>
                  <span className="font-semibold text-text-primary">
                    {member.contributed_projects?.filter(a => a.role_in_project === 'Creator').length || 0}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Project History */}
            <Card>
              <CardHeader>
                <h3 className="text-xl font-semibold text-text-primary">Project Portfolio</h3>
              </CardHeader>
              <CardContent>
                {totalProjects > 0 ? (
                  <ProjectHistory
                    projects={member.contributed_projects}
                    username={member.username}
                  />
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4 opacity-50">📁</div>
                    <p className="text-text-secondary">No projects yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Published Articles */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-text-primary flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Published Articles
                  </h3>
                  {posts.length > 0 && (
                    <span className="text-sm text-text-tertiary">
                      {posts.length} {posts.length === 1 ? 'article' : 'articles'}
                    </span>
                  )}
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

            {/* Contact Section */}
            <Card className="bg-gradient-to-r from-primary-blue/10 to-accent-cyan/10 border-primary-blue/20">
              <CardContent className="text-center p-8">
                <h3 className="text-xl font-semibold text-text-primary mb-4">
                  Get In Touch
                </h3>
                <p className="text-text-secondary mb-6">
                  Interested in collaborating or learning more about {member.full_name || member.username}'s work?
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Button asChild variant="secondary">
                    <a href="mailto:phuckhangtdn@gmail.com" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Send Email
                    </a>
                  </Button>
                  {socialLinks.github && (
                    <Button asChild variant="secondary">
                      <a
                        href={socialLinks.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <Github className="w-4 h-4" />
                        GitHub
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}