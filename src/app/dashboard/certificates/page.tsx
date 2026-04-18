'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuth } from '@/components/AuthProvider'
import { Card, CardContent } from '@/components/Card'
import { Button } from '@/components/Button'
import { Loading } from '@/components/Loading'
import { createClient } from '@/lib/supabase'
import {
  Award,
  Calendar,
  ExternalLink,
  Copy,
  Download,
  ArrowLeft,
  BadgeCheck
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useToast } from '@/components/Toast'

interface Certificate {
  id: string
  certificate_id: string
  title: string
  description: string | null
  suffix: string
  image_id: string | null
  file_url: string | null
  file_type: 'image' | 'pdf'
  issued_at: string
  created_at: string
  image?: {
    public_url: string
  }
}

export default function MyCertificatesPage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCertificates = async () => {
      if (!user) return

      try {
        setLoading(true)
        const supabase = createClient()
        
        const { data, error } = await supabase
          .from('certificates')
          .select(`
            *,
            image:image_id (
              public_url
            )
          `)
          .eq('user_id', user.id)
          .order('issued_at', { ascending: false })

        if (error) {
          throw error
        }

        setCertificates(data || [])
      } catch (err: any) {
        console.error('Error fetching certificates:', err)
        setError(err.message || 'Failed to load certificates')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchCertificates()
    }
  }, [user])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    showToast('success', 'Certificate ID copied to clipboard')
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <Loading size="lg" text="Loading your certificates..." />
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-[1500px] space-y-6 px-1 sm:px-2">
          {/* Header */}
          <div className="rounded-2xl border border-dark-border bg-dark-surface/40 backdrop-blur-sm p-6 md:p-8">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="mb-4 pl-0 hover:pl-2 transition-all">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-text-primary mb-2 flex items-center">
                  <Award className="w-8 h-8 mr-3 text-primary-blue" />
                  My Certificates
                </h1>
                <p className="text-text-secondary max-w-2xl">
                  View and manage your verified achievements from The Noders Community.
                </p>
              </div>
            </div>
          </div>

          {certificates.length === 0 ? (
            <Card className="border-dashed border-2 border-dark-border bg-transparent">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 bg-dark-surface rounded-full flex items-center justify-center mb-6">
                  <Award className="w-10 h-10 text-text-tertiary" />
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">No Certificates Yet</h3>
                <p className="text-text-secondary max-w-md mx-auto mb-6">
                  You haven't earned any certificates yet. Participate in our courses, workshops, and competitions to earn verified certificates.
                </p>
                <Link href="/education">
                  <Button variant="primary">
                    Explore Education
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {certificates.map((cert) => (
                <Card key={cert.id} className="group h-full min-h-[315px] overflow-hidden bg-dark-surface/95 border-dark-border/80 hover:border-primary-blue/50 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/20 transition-all duration-300">
                  <div className="flex flex-col sm:flex-row h-full">
                  {/* Certificate Preview */}
                  <div className="relative overflow-hidden border-b sm:border-b-0 sm:border-r border-dark-border/80 bg-black/20 sm:w-[58%] min-h-[195px] sm:min-h-full">
                    {cert.image?.public_url || cert.file_url ? (
                      <Image
                        src={cert.image?.public_url || cert.file_url || ''}
                        alt={cert.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center flex-col text-text-tertiary bg-dark-bg/50">
                        <Award className="w-12 h-12 mb-2 opacity-50" />
                        <span className="text-sm">No Preview Available</span>
                      </div>
                    )}

                    <div className="absolute top-3 left-3 flex items-center rounded-md border border-primary-blue/30 bg-dark-bg/80 backdrop-blur-sm px-2 py-1 text-xs text-primary-blue font-medium">
                      <BadgeCheck className="w-3.5 h-3.5" />
                    </div>

                    <div className="absolute top-3 right-3 rounded-md border border-dark-border bg-dark-bg/80 backdrop-blur-sm px-2.5 py-1 text-xs text-text-secondary flex items-center">
                      <Calendar className="w-3 h-3 mr-1.5" />
                      {new Date(cert.issued_at).toLocaleDateString('vi-VN')}
                    </div>
                  </div>

                  <CardContent className="p-5 md:p-6 flex-1 flex flex-col sm:w-[42%]">
                    <h3 className="text-lg md:text-xl font-semibold text-text-primary mb-2 line-clamp-2 leading-tight" title={cert.title}>
                      {cert.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-4 text-xs text-text-tertiary">
                      <span className="font-semibold text-primary-blue font-mono tracking-wide">
                        {cert.certificate_id}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(cert.certificate_id)}
                        className="inline-flex items-center gap-1 hover:text-text-primary transition-colors"
                        title="Copy certificate ID"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        Copy ID
                      </button>
                    </div>
                    
                    {cert.description && (
                      <p className="text-sm text-text-secondary line-clamp-3 mb-5 flex-1 leading-relaxed">
                        {cert.description}
                      </p>
                    )}

                    <div className="pt-4 mt-auto border-t border-dark-border/80">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <Link href={`/verify/${cert.certificate_id}`} target="_blank" className="sm:col-span-1">
                          <Button variant="secondary" size="sm" className="w-full h-9">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Verify
                          </Button>
                        </Link>
                        {(cert.image?.public_url || cert.file_url) && (
                          <a href={cert.image?.public_url || cert.file_url || ''} target="_blank" download className="sm:col-span-1">
                            <Button variant="primary" size="sm" className="w-full h-9">
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
