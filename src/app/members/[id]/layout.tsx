import { Metadata } from 'next'
import { createClient } from '@/lib/supabase'
import { generateMetadata as generateSEOMetadata, generatePersonSchema, generateBreadcrumbSchema } from '@/lib/seo'

interface Props {
  params: { id: string }
  children: React.ReactNode
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient()

  const { data: member } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!member) {
    return generateSEOMetadata({
      title: 'Member Not Found',
      noIndex: true,
    })
  }

  const skillsKeywords = member.skills || []

  return generateSEOMetadata({
    title: member.full_name || member.username,
    description: member.bio || `${member.full_name || member.username} - Member of The Noders Community technology club`,
    keywords: ['team member', 'developer', 'PTNK student', ...skillsKeywords],
    image: member.avatar_url,
    url: `/members/${member.id}`,
    type: 'profile',
  })
}

export default function MemberLayout({ params, children }: Props) {
  return (
    <>
      <MemberStructuredData id={params.id} />
      {children}
    </>
  )
}

async function MemberStructuredData({ id }: { id: string }) {
  const supabase = createClient()

  const { data: member } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (!member) return null

  const personSchema = generatePersonSchema({
    name: member.full_name || member.username,
    username: member.username,
    bio: member.bio,
    image: member.avatar_url,
    url: `/members/${member.id}`,
  })

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Members', url: '/members' },
    { name: member.full_name || member.username, url: `/members/${member.id}` },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  )
}
