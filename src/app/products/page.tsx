import { NeuralNetworkBackground } from '@/components/NeuralNetworkBackground'
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
      <div className="relative min-h-screen py-12 px-4 sm:px-6 lg:px-8 z-10">
        <div className="container mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold font-heading text-text-primary mb-4">
              Our Products
            </h1>
            <p className="text-text-secondary text-lg max-w-3xl mx-auto">
              Explore the innovative products created by our The Noders Community members.
              From machine learning models to web applications, discover our collaborative work.
            </p>
          </div>

          <ProjectsClient initialProjects={initialProjects} />
        </div>
      </div>
    </>
  )
}
