import { Metadata } from 'next'
import { createClient } from '@/lib/supabase'
import { generateMetadata as generateSEOMetadata, generatePersonSchema, generateBreadcrumbSchema } from '@/lib/seo'

interface Props {
  params: { username: string }
  children: React.ReactNode
}

// Generate dynamic metadata for each member
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient()

  // Fetch member by username
  const { data: member } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', params.username)
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
    description: member.bio || `${member.full_name || member.username} - Member of The Noders PTNK technology club`,
    keywords: ['team member', 'developer', 'PTNK student', ...skillsKeywords],
    image: member.avatar_url,
    url: `/members/${member.username}`,
    type: 'profile',
  })
}

export default function MemberLayout({ params, children }: Props) {
  return (
    <>
      {/* Add JSON-LD structured data */}
      <MemberStructuredData username={params.username} />
      {children}
    </>
  )
}

// Server component to add structured data
async function MemberStructuredData({ username }: { username: string }) {
  const supabase = createClient()

  const { data: member } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (!member) return null

  const personSchema = generatePersonSchema({
    name: member.full_name || member.username,
    username: member.username,
    bio: member.bio,
    image: member.avatar_url,
    url: `/members/${member.username}`,
  })

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Members', url: '/members' },
    { name: member.full_name || member.username, url: `/members/${member.username}` },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(personSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema)
        }}
      />
    </>
  )
}
