'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useProject } from '@/lib/hooks'
import { Avatar } from '@/components/Avatar'
import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'
import { Card, CardContent } from '@/components/Card'
import { Loading } from '@/components/Loading'
import { NeuralNetworkBackground } from '@/components/NeuralNetworkBackground'
import {
  ArrowLeft,
  Calendar,
  Globe,
  Github,
  Layout,
  Video,
  Users
} from 'lucide-react'

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { project, loading, error } = useProject(params.id as string)

  if (loading) return <Loading />
  
  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg text-text-primary">
         <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Project not found</h2>
            <Button onClick={() => router.push('/projects')}>Return to Gallery</Button>
         </div>
      </div>
    )
  }

  // Basic date formatting
  const formattedDate = new Date(project.created_at).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric'
  })

  // Safe contributor rendering helper
  const renderContributors = () => {
    if (!project.contributors || project.contributors.length === 0) return null;
    
    return (
      <div className="flex flex-col gap-2">
        <span className="text-sm text-text-secondary uppercase tracking-wider font-semibold flex items-center">
           <Users className="w-4 h-4 mr-2" />
           Built by
        </span>
        <div className="flex -space-x-3 hover:space-x-1 transition-all duration-300">
          {project.contributors.map((contributor: any) => {
             // Handle inconsistent Supabase return types (alias mapping vs raw table name)
             // Check both 'profile' (typed) and 'profiles' (raw Supabase return)
             // Also handle if it's returned as an array (sometimes happens with joins)
             let profileData = contributor.profile || contributor.profiles;
             
             if (Array.isArray(profileData)) {
               profileData = profileData[0];
             }

             if (!profileData) return null;
             
             return (
              <div key={contributor.id} className="relative group/avatar cursor-pointer">
                 <Avatar 
                  src={profileData.avatar_url} 
                  name={profileData.full_name}
                  className="w-12 h-12 border-2 border-dark-bg group-hover/avatar:border-primary-blue transition-colors"
                  size="md"
                />
                <div className="absolute opacity-0 group-hover/avatar:opacity-100 bottom-full mb-2 left-1/2 -translate-x-1/2 bg-dark-surface border border-white/10 px-2 py-1 rounded text-xs whitespace-nowrap z-50 pointer-events-none transition-opacity shadow-xl">
                  <p className="font-bold text-white">{profileData.full_name}</p>
                  <p className="text-text-secondary">{contributor.role_in_project || 'Member'}</p>
                </div>
              </div>
             )
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg text-text-primary relative selection:bg-primary-blue/30">
      <NeuralNetworkBackground />
      
      {/* Cinematic Hero Section */}
      <div className="relative w-full min-h-[400px] flex items-end py-12">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          {project.thumbnail_url ? (
            <Image
              src={project.thumbnail_url}
              alt={project.title}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-blue/20 to-purple-900/20" /> 
          )}
          {/* Gradients to ensure text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-dark-bg/50 via-transparent to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="container mx-auto px-4 sm:px-6 z-10 w-full">
            <Link href="/projects" className="inline-block mb-8">
              <Button variant="ghost" className="hover:bg-white/10 text-white/80 hover:text-white backdrop-blur-sm transition-all border border-transparent hover:border-white/20">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Projects
              </Button>
            </Link>

            <div className="max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700"> {/* Removed max-w-5xl, using max-w-7xl */}
              
              {/* Header Badges & Date */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <Badge 
                  variant={project.status === 'active' ? 'success' : 'secondary'}
                  className="uppercase tracking-wider text-xs font-bold px-3 py-1"
                >
                  {project.status}
                </Badge>
                {project.featured && (
                  <Badge variant="warning" className="uppercase tracking-wider text-xs font-bold px-3 py-1 bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                    Featured
                  </Badge>
                )}
                <div className="h-4 w-px bg-white/20 mx-2 hidden sm:block"></div>
                <div className="flex items-center text-text-secondary text-sm">
                   <Calendar className="w-4 h-4 mr-2" />
                   {formattedDate}
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-6 font-heading leading-tight drop-shadow-xl tracking-tight">
                {project.title}
              </h1>

              {/* Description without strict max-width to allow longer lines */}
              <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed drop-shadow-md pr-4 max-w-none">
                {project.description}
              </p>

              {/* Contributors In Hero */}
               <div className="mb-8">
                  {renderContributors()}
               </div>

              <div className="flex flex-wrap gap-4">
                {project.demo_url && (
                  <a href={project.demo_url} target="_blank" rel="noopener noreferrer">
                    <Button size="lg" className="bg-primary-blue hover:bg-primary-blue/90 border-0 shadow-lg shadow-primary-blue/25 px-8">
                      <Globe className="w-5 h-5 mr-2" />
                      Live Demo
                    </Button>
                  </a>
                )}
                
                {project.repo_url && (
                  <a href={project.repo_url} target="_blank" rel="noopener noreferrer">
                    <Button size="lg" variant="ghost" className="bg-white/5 backdrop-blur-md border border-white/20 hover:bg-white/10 text-white px-8">
                      <Github className="w-5 h-5 mr-2" />
                      Source Code
                    </Button>
                  </a>
                )}
              </div>
            </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-12 relative z-10">
        {/* Layout Split: Video Left (60%) / Desc Right (40%) */}
        {/* Removed items-start to allow columns to stretch, enabling sticky behavior */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 xl:gap-12">
          
          {/* Left Column: Demo Video (60%) - Sticky */}
          <div className="lg:col-span-3">
             <div className="sticky top-24 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                 <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Video className="w-6 h-6 mr-3 text-accent-purple" />
                  Project Demo
                </h2>
                
                {project.video_url ? (
                   <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black/50 aspect-video relative group">
                    <iframe
                      src={project.video_url.replace('watch?v=', 'embed/')}
                      title={`${project.title} Demo`}
                      className="w-full h-full"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  </div>
                ) : (
                  <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-dark-surface/50 aspect-video relative group flex items-center justify-center">
                      {project.thumbnail_url && (
                        <Image 
                          src={project.thumbnail_url} 
                          alt="Background" 
                          fill 
                          className="object-cover opacity-20 blur-sm"
                        />
                      )}
                      <div className="text-center p-6 relative z-10">
                         <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md border border-white/10">
                            <Video className="w-8 h-8 text-text-secondary" />
                         </div>
                         <h3 className="text-xl font-bold text-white mb-2">We are still making demo video</h3>
                         <p className="text-text-secondary">Check back soon for a walkthrough!</p>
                      </div>
                  </div>
                )}
             </div>
          </div>

          {/* Right Column: Description (40%) - Scrolling */}
          <div className="lg:col-span-2 space-y-8">
            <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Layout className="w-6 h-6 mr-3 text-primary-blue" />
                Project Details
              </h2>
              <Card padding="none" className="bg-dark-surface/40 backdrop-blur-sm border-white/5 overflow-hidden">
                <CardContent className="p-6 md:p-8">
                  <div className="prose prose-invert prose-lg max-w-none text-text-secondary">
                    {project.details ? (
                      <div 
                        dangerouslySetInnerHTML={{ __html: project.details }} 
                        className="[&>h1]:text-3xl [&>h1]:font-bold [&>h1]:text-white [&>h1]:mb-6 [&>h1]:mt-8
                                   [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-white [&>h2]:mb-4 [&>h2]:mt-8
                                   [&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-white [&>h3]:mb-3 [&>h3]:mt-6
                                   [&>p]:leading-relaxed [&>p]:mb-4
                                   [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-4
                                   [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-4
                                   [&>li]:mb-2
                                   [&>strong]:text-white [&>strong]:font-semibold
                                   [&>a]:text-primary-blue [&>a]:underline [&>a]:decoration-primary-blue/30 [&>a]:underline-offset-2 hover:[&>a]:decoration-primary-blue
                                   [&>blockquote]:border-l-4 [&>blockquote]:border-primary-blue [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:bg-white/5 [&>blockquote]:py-2 [&>blockquote]:pr-4 [&>blockquote]:my-6 [&>blockquote]:rounded-r-lg"
                      />
                    ) : (
                      <p className="italic opacity-60">No detailed description available for this project yet.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>

        </div>
      </div>
    </div>
  )
}
