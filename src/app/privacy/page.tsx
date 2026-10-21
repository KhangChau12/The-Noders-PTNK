import { Metadata } from 'next'
import Link from 'next/link'
import { LegalPage } from '@/components/LegalPage'
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'

export const metadata: Metadata = generateSEOMetadata({
  title: 'Privacy Policy',
  description: 'Privacy Policy for The Noders Community website and services.',
  url: '/privacy',
  noIndex: true,
})

export default function PrivacyPage() {
  return (
    <LegalPage
      active="/privacy"
      title="Privacy policy"
      sections={[
        {
          id: 'collect',
          title: 'Information we collect',
          body: (
            <>
              <p>
                We collect information you provide directly to us, such as when you create an account, subscribe to our newsletter, request customer
                support, or otherwise communicate with us.
              </p>
              <p>The types of information we may collect include your name, email address, and any other information you choose to provide.</p>
            </>
          ),
        },
        {
          id: 'use',
          title: 'How we use your information',
          body: (
            <>
              <p>We use the information we collect to provide, maintain, and improve our services, including to:</p>
              <ul>
                <li>Send you technical notices, updates, security alerts, and support messages</li>
                <li>Respond to your comments, questions, and requests</li>
                <li>Communicate with you about products, services, offers, and events</li>
                <li>Monitor and analyze trends, usage, and activities in connection with our services</li>
              </ul>
            </>
          ),
        },
        {
          id: 'sharing',
          title: 'Information sharing',
          body: (
            <p>
              We do not share your personal information with third parties except as described in this privacy policy or with your consent. We may share
              information with vendors, consultants, and other service providers who need access to such information to carry out work on our behalf.
            </p>
          ),
        },
        {
          id: 'contact',
          title: 'Contact us',
          body: (
            <p>
              If you have any questions about this privacy policy, <Link href="/contact" className="text-link hover:text-text-primary">contact us</Link>.
            </p>
          ),
        },
      ]}
    />
  )
}
