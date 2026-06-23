import Link from 'next/link'
import { SITE_CONFIG, SOCIAL_LINKS } from '@/lib/constants'
import { Mail, Facebook } from 'lucide-react'

const LinkDot = () => (
  <span className="w-1.5 h-1.5 rounded-full bg-primary-blue/30 group-hover:bg-primary-blue transition-colors"></span>
)

const quickLinks = [
  { href: '/contest', label: 'Contests' },
  { href: '/products', label: 'Products' },
  { href: '/education', label: 'Education' },
  { href: '/members', label: 'Members' },
  { href: '/posts', label: 'News' },
]

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-dark-border bg-gradient-to-b from-dark-surface to-bg-elevated mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <h3 className="font-[family-name:var(--font-shrikhand)] text-2xl gradient-text mb-3">
              {SITE_CONFIG.name}
            </h3>
            <p className="text-text-tertiary text-sm leading-relaxed mb-4 max-w-md">
              {SITE_CONFIG.description}
            </p>
            <p className="text-text-tertiary text-sm mb-4 italic">
              {SITE_CONFIG.tagline}
            </p>
            <div className="flex gap-3">
              <a
                href={`mailto:${SOCIAL_LINKS.email}`}
                className="w-9 h-9 rounded-lg bg-dark-surface border border-dark-border hover:border-primary-blue hover:bg-primary-blue/10 flex items-center justify-center transition-all group"
                title="Email"
              >
                <Mail className="w-4 h-4 text-text-secondary group-hover:text-primary-blue transition-colors" />
              </a>
              <a
                href={SOCIAL_LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-dark-surface border border-dark-border hover:border-primary-blue hover:bg-primary-blue/10 flex items-center justify-center transition-all group"
                title="Facebook"
              >
                <Facebook className="w-4 h-4 text-text-secondary group-hover:text-primary-blue transition-colors" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-base font-semibold text-text-primary mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-text-secondary hover:text-primary-blue transition-colors text-sm font-medium flex items-center gap-2 group"
                  >
                    <LinkDot />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-base font-semibold text-text-primary mb-4">Resources</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/verify" className="text-text-secondary hover:text-primary-blue transition-colors text-sm font-medium flex items-center gap-2 group">
                  <LinkDot />
                  Verify Certificate
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-text-secondary hover:text-primary-blue transition-colors text-sm font-medium flex items-center gap-2 group">
                  <LinkDot />
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-text-secondary hover:text-primary-blue transition-colors text-sm font-medium flex items-center gap-2 group">
                  <LinkDot />
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-text-secondary hover:text-primary-blue transition-colors text-sm font-medium flex items-center gap-2 group">
                  <LinkDot />
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-dark-border mt-10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-text-tertiary text-sm text-center sm:text-left">
            © {currentYear}{' '}
            <span className="font-semibold text-text-secondary">{SITE_CONFIG.name}</span>. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-text-tertiary hover:text-text-secondary text-sm transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-text-tertiary hover:text-text-secondary text-sm transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
