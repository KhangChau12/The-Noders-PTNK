import Link from 'next/link'
import { SITE_CONFIG, SOCIAL_LINKS } from '@/lib/constants'
import { Mail, Facebook } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-dark-surface border-t border-dark-border mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <span className="font-bold text-text-primary text-xl font-[family-name:var(--font-shrikhand)]">
                {SITE_CONFIG.name}
              </span>
            </div>
            <p className="text-text-secondary mb-4 max-w-md">
              {SITE_CONFIG.description}. Showcasing innovative projects and talented members from our AI Agent Workshop community.
            </p>
            <p className="text-text-tertiary text-sm">
              {SITE_CONFIG.tagline}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-text-primary mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/contest" className="text-text-secondary hover:text-primary-blue transition-colors">
                  Contests
                </Link>
              </li>
              <li>
                <Link href="/projects" className="text-text-secondary hover:text-primary-blue transition-colors">
                  Projects
                </Link>
              </li>
              <li>
                <Link href="/education" className="text-text-secondary hover:text-primary-blue transition-colors">
                  Education
                </Link>
              </li>
              <li>
                <Link href="/members" className="text-text-secondary hover:text-primary-blue transition-colors">
                  Members
                </Link>
              </li>
              <li>
                <Link href="/posts" className="text-text-secondary hover:text-primary-blue transition-colors">
                  News
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="font-semibold text-text-primary mb-4">Connect</h3>
            <div className="flex space-x-4">
              <a
                href={`mailto:${SOCIAL_LINKS.email}`}
                className="text-text-secondary hover:text-primary-blue transition-colors"
              >
                <Mail className="w-5 h-5" />
              </a>
              <a
                href={SOCIAL_LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-secondary hover:text-primary-blue transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-dark-border mt-8 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-text-tertiary text-sm">
              © {currentYear} {SITE_CONFIG.name}. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <Link href="/privacy" className="text-text-tertiary hover:text-text-secondary text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-text-tertiary hover:text-text-secondary text-sm transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}