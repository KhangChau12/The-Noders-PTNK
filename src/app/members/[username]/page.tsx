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
  Star,
  ExternalLink
} from 'lucide-react'

interface SkillChartProps {
  skills: string[]
}

function SkillChart({ skills }: SkillChartProps) {
  if (!skills || skills.length === 0) return null

  // Mock skill levels (in real app, this would come from database)
  const skillsWithLevels = skills.map((skill, index) => ({
    name: skill,
    level: Math.floor(Math.random() * 5) + 1, // 1-5 stars
    category: getSkillCategory(skill)
  }))

  return (
    <div className="space-y-4">
      {skillsWithLevels.map((skill, index) => (
        <div key={index} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="tech" size="sm">
              {skill.name}
            </Badge>
            <span className="text-xs text-text-tertiary capitalize">
              {skill.category}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < skill.level
                    ? 'text-yellow-500 fill-yellow-500'
                    : 'text-dark-border'
                }`}
              />
            ))}
          </div>
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
  const contributedProjects = projects.filter(p => p.project)
  const createdProjects = projects.filter(p => !p.project)

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
              const project = contribution.project
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
                        <span>{contribution.role_in_project}</span>
                        <span>{contribution.contribution_percentage}% contribution</span>
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
            {createdProjects.slice(0, 3).map((project, index) => (
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
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface ActivityTimelineProps {
  member: any
}

function ActivityTimeline({ member }: ActivityTimelineProps) {
  // Mock timeline data (in real app, this would come from database)
  const timelineItems = [
    {
      date: new Date().toDateString(),
      type: 'project',
      title: 'Contributed to AI Chat Assistant',
      description: 'Added natural language processing features'
    },
    {
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toDateString(),
      type: 'join',
      title: 'Joined AI Agent Club',
      description: `Welcome ${member.full_name || member.username} to the team!`
    }
  ]

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

  const { member, loading, error } = useMember(username)

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
  const totalProjects = (member.contributed_projects?.length || 0) + (member.created_projects?.length || 0)

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
                    name={member.avatar_url ? null : member.full_name}
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
                      {member.skills?.length || 0}
                    </div>
                    <div className="text-xs text-text-tertiary">Skills</div>
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
                  <span className="text-text-secondary">Contributions</span>
                  <span className="font-semibold text-text-primary">
                    {member.contributed_projects?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Created Projects</span>
                  <span className="font-semibold text-text-primary">
                    {member.created_projects?.length || 0}
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
                    projects={[...(member.contributed_projects || []), ...(member.created_projects || [])]}
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

            {/* Activity Timeline */}
            <Card>
              <CardHeader>
                <h3 className="text-xl font-semibold text-text-primary">Recent Activity</h3>
              </CardHeader>
              <CardContent>
                <ActivityTimeline member={member} />
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