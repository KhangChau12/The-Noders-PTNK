import { Metadata } from 'next'
import { LegalPage } from '@/components/LegalPage'
import { SOCIAL_LINKS } from '@/lib/constants'
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'

export const metadata: Metadata = generateSEOMetadata({
  title: 'Terms of Service',
  description: 'Terms of Service for The Noders Community website and services.',
  url: '/terms',
  noIndex: true,
})

export default function TermsPage() {
  return (
    <LegalPage
      active="/terms"
      title="Terms of service"
      sections={[
        {
          id: 'acceptance',
          title: 'Acceptance of terms',
          body: (
            <p>
              By accessing and using The Noders Community website, you accept and agree to be bound by the terms and provision of this agreement. If you
              do not agree to abide by the above, please do not use this service.
            </p>
          ),
        },
        {
          id: 'license',
          title: 'Use license',
          body: (
            <>
              <p>
                Permission is granted to temporarily access the materials (information or software) on The Noders Community&apos;s website for personal,
                non-commercial use only.
              </p>
              <p>This is the grant of a license, not a transfer of title, and under this license you may not:</p>
              <ul>
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose</li>
                <li>Attempt to decompile or reverse engineer any software contained on the website</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </>
          ),
        },
        {
          id: 'content',
          title: 'User content',
          body: (
            <p>
              Members may post content including but not limited to projects, blog posts, and comments. You retain ownership of your content, but grant
              The Noders Community a license to display and distribute your content on our platform.
            </p>
          ),
        },
        {
          id: 'guidelines',
          title: 'Community guidelines',
          body: (
            <>
              <p>Users must:</p>
              <ul>
                <li>Be respectful to other members</li>
                <li>Not post spam or malicious content</li>
                <li>Not violate intellectual property rights</li>
                <li>Not share inappropriate or offensive content</li>
              </ul>
            </>
          ),
        },
        {
          id: 'disclaimer',
          title: 'Disclaimer',
          body: (
            <p>
              The materials on The Noders Community&apos;s website are provided on an &apos;as is&apos; basis. The Noders Community makes no warranties,
              expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions
              of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          ),
        },
        {
          id: 'limitations',
          title: 'Limitations',
          body: (
            <p>
              In no event shall The Noders Community or its suppliers be liable for any damages (including, without limitation, damages for loss of data
              or profit, or due to business interruption) arising out of the use or inability to use the materials on The Noders Community&apos;s website.
            </p>
          ),
        },
        {
          id: 'revisions',
          title: 'Revisions',
          body: (
            <p>
              The Noders Community may revise these terms of service for its website at any time without notice. By using this website you are agreeing
              to be bound by the then current version of these terms of service.
            </p>
          ),
        },
        {
          id: 'contact',
          title: 'Contact',
          body: (
            <p>
              If you have any questions about these Terms of Service, please contact us at{' '}
              <a href={`mailto:${SOCIAL_LINKS.email}`} className="text-link hover:text-text-primary">{SOCIAL_LINKS.email}</a>.
            </p>
          ),
        },
      ]}
    />
  )
}
