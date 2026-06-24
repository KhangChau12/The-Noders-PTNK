import { NeuralNetworkBackground } from '@/components/NeuralNetworkBackground'
import { PageHero } from '@/components/PageHero'
import ProjectsClient from '@/components/ProjectsClient'

async function getInitialProjects() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/products`, {
      next: { revalidate: 60 }
    })
    if (!res.ok) return []
    const { projects } = await res.json()
    return projects || []
  } catch {
    return []
  }
}

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
