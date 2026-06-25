import { NeuralNetworkBackground } from '@/components/NeuralNetworkBackground'
import { PageHero } from '@/components/PageHero'
import ProjectsClient from '@/components/ProjectsClient'
import { createClient } from '@/lib/supabase'

async function getInitialProjects() {
  try {
    const supabase = createClient()
    const { data: projects, error } = await supabase
      .from('projects')
      .select(`
        *,
        created_by_profile:profiles(
          username,
          full_name,
          avatar_url
        ),
        project_contributors(
          contribution_percentage,
          role_in_project,
          profiles(username, full_name, avatar_url)
        ),
        thumbnail_image:images(
          id,
          filename,
          public_url,
          width,
          height,
          alt_text
        )
      `)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) return []
    return projects?.map(p => ({ ...p, contributors: p.project_contributors || [] })) || []
  } catch {
    return []
  }
}

export const revalidate = 60

export default async function ProjectsPage() {
  const initialProjects = await getInitialProjects()

  return (
    <>
      <NeuralNetworkBackground />
      <div className="relative min-h-screen z-10">
        <PageHero
          title="Our Products"
          subtitle="Built by Our Community"
          description="Explore the innovative products created by The Noders Community members — from machine learning models to web applications."
        />

        <section className="pb-10 sm:pb-12 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">
            <ProjectsClient initialProjects={initialProjects} />
          </div>
        </section>
      </div>
    </>
  )
}
