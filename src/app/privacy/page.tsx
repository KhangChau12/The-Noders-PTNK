import { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card'
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'

export const metadata: Metadata = generateSEOMetadata({
  title: 'Privacy Policy',
  description: 'Privacy Policy for The Noders PTNK website and services.',
  url: '/privacy',
  noIndex: true,
})

export default function PrivacyPage() {
  return (
    <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold text-text-primary mb-4">Privacy Policy</h1>
        <p className="text-text-secondary mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p className="text-text-secondary">
                We collect information you provide directly to us, such as when you create an account,
                subscribe to our newsletter, request customer support, or otherwise communicate with us.
              </p>
              <p className="text-text-secondary mt-2">
                The types of information we may collect include your name, email address, and any other
                information you choose to provide.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p className="text-text-secondary">
                We use the information we collect to provide, maintain, and improve our services, including to:
              </p>
              <ul className="list-disc list-inside text-text-secondary space-y-2 mt-2">
                <li>Send you technical notices, updates, security alerts, and support messages</li>
                <li>Respond to your comments, questions, and requests</li>
                <li>Communicate with you about products, services, offers, and events</li>
                <li>Monitor and analyze trends, usage, and activities in connection with our services</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Information Sharing</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p className="text-text-secondary">
                We do not share your personal information with third parties except as described in this privacy policy
                or with your consent. We may share information with vendors, consultants, and other service providers
                who need access to such information to carry out work on our behalf.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p className="text-text-secondary">
                If you have any questions about this Privacy Policy, please contact us.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
