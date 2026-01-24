'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuth } from '@/components/AuthProvider'
import { Card, CardContent } from '@/components/Card'
import { Button } from '@/components/Button'
import { Badge } from '@/components/Badge'
import { Loading } from '@/components/Loading'
import { createClient } from '@/lib/supabase'
import {
  Award,
  Calendar,
  ExternalLink,
  Copy,
  CheckCircle,
  Download,
  ArrowLeft,
  Share2
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useToast } from '@/components/Toast'

interface Certificate {
  id: string
  certificate_id: string
  title: string
  description: string | null
  gen_number: number
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
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="mb-4 pl-0 hover:pl-2 transition-all">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-text-primary mb-2 flex items-center">
                  <Award className="w-8 h-8 mr-3 text-accent-purple" />
                  My Certificates
                </h1>
                <p className="text-text-secondary">
                  View and manage your verified achievements from The Noders PTNK.
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map((cert) => (
                <Card key={cert.id} className="group hover:border-accent-purple transition-all duration-300 flex flex-col h-full bg-dark-surface">
                  {/* Certificate Preview */}
                  <div className="aspect-[1.414/1] relative overflow-hidden border-b border-dark-border bg-black/20">
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
                    
                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                      <Link href={`/verify?id=${cert.certificate_id}`} target="_blank">
                        <Button variant="secondary" size="sm" className="bg-white/10 hover:bg-white/20 border-white/20 text-white">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Verify
                        </Button>
                      </Link>
                      {(cert.image?.public_url || cert.file_url) && (
                         <a href={cert.image?.public_url || cert.file_url || ''} target="_blank" download>
                          <Button variant="primary" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                         </a>
                      )}
                    </div>
                  </div>

                  <CardContent className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                       <Badge variant="secondary" size="sm" className="font-mono">
                         GEN {cert.gen_number}
                       </Badge>
                       <span className="text-xs text-text-tertiary flex items-center">
                         <Calendar className="w-3 h-3 mr-1" />
                         {new Date(cert.issued_at).toLocaleDateString()}
                       </span>
                    </div>

                    <h3 className="text-lg font-bold text-text-primary mb-2 line-clamp-2" title={cert.title}>
                      {cert.title}
                    </h3>
                    
                    {cert.description && (
                      <p className="text-sm text-text-secondary line-clamp-2 mb-4 flex-1">
                        {cert.description}
                      </p>
                    )}

                    <div className="pt-4 mt-auto border-t border-dark-border">
                      <div className="bg-dark-bg rounded-lg p-2.5 flex items-center justify-between group-hover:bg-dark-bg/80 transition-colors">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase text-text-tertiary font-bold tracking-wider">Certificate ID</span>
                          <code className="text-sm font-mono text-accent-purple font-semibold">{cert.certificate_id}</code>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(cert.certificate_id)}
                          className="h-8 w-8 p-0"
                          title="Copy ID"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
