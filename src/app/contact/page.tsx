'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/Card'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Badge } from '@/components/Badge'
import {
  Mail,
  Send,
  MessageCircle,
  Users,
  Code,
  Bug,
  CheckCircle,
  AlertCircle,
  Facebook,
  MapPin,
  Phone,
  Clock
} from 'lucide-react'

interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
}

const subjectOptions = [
  { value: 'general', label: 'General Inquiry', icon: MessageCircle },
  { value: 'join', label: 'Join Our Club', icon: Users },
  { value: 'collaboration', label: 'Collaboration', icon: Code },
  { value: 'bug', label: 'Bug Report', icon: Bug }
]

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: 'general',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Using Web3Forms service for email submission
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          access_key: process.env.NEXT_PUBLIC_WEB3FORMS_KEY || 'YOUR_WEB3FORMS_ACCESS_KEY',
          name: formData.name,
          email: formData.email,
          subject: `🔔 The Noders PTNK - ${subjectOptions.find(s => s.value === formData.subject)?.label}`,
          message: `
═══════════════════════════════════════
🌟 NEW MESSAGE FROM THE NODERS PTNK WEBSITE
═══════════════════════════════════════

📋 INQUIRY TYPE: ${subjectOptions.find(s => s.value === formData.subject)?.label}

👤 CONTACT INFORMATION:
   Name: ${formData.name}
   Email: ${formData.email}

💬 MESSAGE:
${formData.message}

═══════════════════════════════════════
📧 Sent via The Noders PTNK Contact Form
🌐 Website: ${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}
⏰ Timestamp: ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}
═══════════════════════════════════════
          `.trim(),
          to: 'phuckhangtdn@gmail.com'
        })
      })

      const result = await response.json()

      if (result.success) {
        setSuccess(true)
        setFormData({ name: '', email: '', subject: 'general', message: '' })
      } else {
        setError('Failed to send message. Please try again.')
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-2xl">
          <Card className="text-center">
            <CardContent className="p-12">
              <div className="mx-auto w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>

              <h1 className="text-3xl font-bold text-text-primary mb-4">
                Message Sent Successfully!
              </h1>

              <p className="text-text-secondary text-lg mb-8">
                Thank you for reaching out to The Noders PTNK. We've received your message
                and will get back to you within 24 hours.
              </p>

              <div className="space-y-4">
                <Button
                  onClick={() => setSuccess(false)}
                  size="lg"
                >
                  Send Another Message
                </Button>

                <div className="flex justify-center gap-6 text-sm text-text-tertiary">
                  <a
                    href="/"
                    className="hover:text-primary-blue transition-colors"
                  >
                    Go Home
                  </a>
                  <a
                    href="/projects"
                    className="hover:text-primary-blue transition-colors"
                  >
                    Browse Projects
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
            Contact Us
          </h1>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Have a question, want to join our club, or interested in collaboration?
            We'd love to hear from you!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="space-y-6">
            {/* Contact Details */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-text-primary">
                  Get in Touch
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-blue/20 rounded-lg flex items-center justify-center">
                    <Mail className="w-4 h-4 text-primary-blue" />
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">Email</p>
                    <a
                      href="mailto:phuckhangtdn@gmail.com"
                      className="text-text-secondary hover:text-primary-blue transition-colors"
                    >
                      phuckhangtdn@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-blue/20 rounded-lg flex items-center justify-center">
                    <Facebook className="w-4 h-4 text-primary-blue" />
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">Facebook</p>
                    <a
                      href="https://facebook.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-text-secondary hover:text-primary-blue transition-colors"
                    >
                      The Noders PTNK
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-blue/20 rounded-lg flex items-center justify-center">
                    <Clock className="w-4 h-4 text-primary-blue" />
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">Response Time</p>
                    <p className="text-text-secondary">Within 24 hours</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-text-primary">
                  Frequently Asked
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="py-1 bg-dark-surface rounded-lg">
                  <h4 className="font-medium text-text-primary text-sm mb-1">
                    How can I join the club?
                  </h4>
                  <p className="text-text-secondary text-sm">
                    Contact us with subject "Join Our Club" and tell us about your background and interests.
                  </p>
                </div>

                <div className="py-1 bg-dark-surface rounded-lg">
                  <h4 className="font-medium text-text-primary text-sm mb-1">
                    Can I contribute to projects?
                  </h4>
                  <p className="text-text-secondary text-sm">
                    Yes! We welcome contributions from everyone. Reach out to discuss collaboration opportunities.
                  </p>
                </div>

                <div className="py-1 bg-dark-surface rounded-lg">
                  <h4 className="font-medium text-text-primary text-sm mb-1">
                    Do you offer mentorship?
                  </h4>
                  <p className="text-text-secondary text-sm">
                    We provide guidance and mentorship for AI/ML learning and project development.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <h3 className="text-xl font-semibold text-text-primary">
                  Send us a Message
                </h3>
                <p className="text-text-secondary">
                  Fill out the form below and we'll get back to you as soon as possible.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name and Email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Full Name *
                      </label>
                      <Input
                        required
                        placeholder="Your full name"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Email Address *
                      </label>
                      <Input
                        type="email"
                        required
                        placeholder="your.email@example.com"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        icon={<Mail className="w-4 h-4" />}
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-3">
                      Subject *
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {subjectOptions.map((option) => {
                        const Icon = option.icon
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => handleChange('subject', option.value)}
                            className={`px-3 py-2 flex items-center gap-2 rounded-lg border transition-colors text-left ${
                              formData.subject === option.value
                                ? 'border-primary-blue bg-primary-blue/10'
                                : 'border-dark-border hover:border-dark-border/60'
                            }`}
                          >
                            <Icon className={`w-4 h-4 ${
                              formData.subject === option.value ? 'text-primary-blue' : 'text-text-tertiary'
                            }`} />
                            <p className={`text-sm font-medium ${
                              formData.subject === option.value ? 'text-primary-blue' : 'text-text-primary'
                            }`}>
                              {option.label}
                            </p>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Message *
                    </label>
                    <textarea
                      required
                      placeholder="Tell us more about your inquiry..."
                      value={formData.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      rows={6}
                      className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-blue/50 focus:border-primary-blue resize-none"
                    />
                    <p className="text-xs text-text-tertiary mt-1">
                      {formData.message.length}/1000 characters
                    </p>
                  </div>

                  {/* Submit */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button
                      type="submit"
                      disabled={loading || !formData.name || !formData.email || !formData.message}
                      className="flex-1 sm:flex-none"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-text-tertiary self-center">
                      We'll respond within 24 hours
                    </p>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="flex items-center gap-2 p-4 bg-error/20 border border-error/30 rounded-lg text-error text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-primary-blue/10 to-accent-cyan/10 border-primary-blue/20">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold text-text-primary mb-4">
                Join Our Community
              </h3>
              <p className="text-text-secondary mb-6 max-w-2xl mx-auto">
                Whether you're a beginner or an expert, we welcome everyone who's passionate
                about AI and wants to learn, share, and build amazing projects together.
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                <Badge variant="tech" size="lg">AI & Machine Learning</Badge>
                <Badge variant="tech" size="lg">Collaborative Development</Badge>
                <Badge variant="tech" size="lg">Knowledge Sharing</Badge>
                <Badge variant="tech" size="lg">Innovation</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}