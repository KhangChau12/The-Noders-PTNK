'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuth } from '@/components/AuthProvider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Badge } from '@/components/Badge'
import { Loading } from '@/components/Loading'
import { Avatar } from '@/components/Avatar'
import {
  Award,
  Plus,
  Trash2,
  Search,
  AlertCircle,
  CheckCircle,
  X,
  RefreshCw,
  ExternalLink,
  Copy,
  Shuffle,
  ArrowLeft
} from 'lucide-react'
import { useToast } from '@/components/Toast'
import { useConfirm } from '@/components/ConfirmDialog'
import { ImageUpload } from '@/components/ImageUpload'
import type { Profile } from '@/types/database'
import Link from 'next/link'

interface ImageData {
  id: string
  filename: string
  original_name: string
  public_url: string
  file_size: number
  width?: number
  height?: number
  alt_text?: string
}

interface CertificateData {
  id: string
  certificate_id: string
  gen_number: number
  suffix: string
  file_url: string | null
  file_type: 'image' | 'pdf'
  title: string
  description: string | null
  issued_at: string
  created_at: string
  member: {
    id: string
    username: string
    full_name: string
    avatar_url: string | null
  }
  issuer: {
    id: string
    username: string
    full_name: string
  } | null
  image: {
    id: string
    public_url: string
    mime_type: string
  } | null
}

interface CreateCertificateFormData {
  user_id: string
  gen_number: number
  suffix: string
  image_id: string
  file_url: string
  file_type: 'image' | 'pdf'
  title: string
  description: string
}

function CreateCertificateModal({ isOpen, onClose, onCertificateCreated, members }: {
  isOpen: boolean
  onClose: () => void
  onCertificateCreated: () => void
  members: Profile[]
}) {
  const { session } = useAuth()
  const { showToast } = useToast()
  const [formData, setFormData] = useState<CreateCertificateFormData>({
    user_id: '',
    gen_number: 0,
    suffix: '',
    image_id: '',
    file_url: '',
    file_type: 'image',
    title: 'Chứng nhận hoàn thành khóa học',
    description: ''
  })
  const [uploadedImage, setUploadedImage] = useState<ImageData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [generatingSuffix, setGeneratingSuffix] = useState(false)

  const handleChange = (field: keyof CreateCertificateFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleImageChange = (imageData: ImageData | null) => {
    setUploadedImage(imageData)
    if (imageData) {
      setFormData(prev => ({
        ...prev,
        image_id: imageData.id,
        file_url: imageData.public_url
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        image_id: '',
        file_url: ''
      }))
    }
  }

  const generateRandomSuffix = async () => {
    try {
      setGeneratingSuffix(true)
      const response = await fetch(`/api/admin/certificates/generate-suffix?gen=${formData.gen_number}`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      })
      const result = await response.json()
      if (result.success) {
        setFormData(prev => ({ ...prev, suffix: result.suffix }))
      } else {
        showToast('error', 'Failed to generate suffix')
      }
    } catch {
      showToast('error', 'Network error')
    } finally {
      setGeneratingSuffix(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!session?.access_token) {
        setError('Authentication required. Please refresh the page.')
        return
      }

      const response = await fetch('/api/admin/certificates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          user_id: formData.user_id,
          gen_number: formData.gen_number,
          suffix: formData.suffix || undefined,
          image_id: formData.image_id || undefined,
          file_url: formData.file_url || undefined,
          file_type: formData.file_type,
          title: formData.title,
          description: formData.description || undefined
        })
      })

      const result = await response.json()

      if (result.success) {
        setSuccess(true)
        showToast('success', `Certificate ${result.certificate.certificate_id} created!`)
        setTimeout(() => {
          onCertificateCreated()
          onClose()
          setSuccess(false)
          setUploadedImage(null)
          setFormData({
            user_id: '',
            gen_number: 0,
            suffix: '',
            image_id: '',
            file_url: '',
            file_type: 'image',
            title: 'Chứng nhận hoàn thành khóa học',
            description: ''
          })
        }, 1500)
      } else {
        setError(result.error || 'Failed to create certificate')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const previewCertificateId = formData.suffix
    ? `TN-GEN${formData.gen_number}-${formData.suffix.toUpperCase()}`
    : `TN-GEN${formData.gen_number}-????`

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create Certificate
            </CardTitle>
            <button
              onClick={onClose}
              className="text-text-tertiary hover:text-text-primary"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                Certificate Created!
              </h3>
              <p className="text-text-secondary">
                The certificate has been issued successfully.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Certificate ID Preview */}
              <div className="p-4 bg-primary-blue/10 border border-primary-blue/30 rounded-lg text-center">
                <p className="text-sm text-text-secondary mb-1">Certificate ID Preview</p>
                <p className="text-2xl font-mono font-bold text-primary-blue">
                  {previewCertificateId}
                </p>
              </div>

              {/* Member Selection */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Member *
                </label>
                <select
                  required
                  value={formData.user_id}
                  onChange={(e) => handleChange('user_id', e.target.value)}
                  className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-blue/50 focus:border-primary-blue"
                >
                  <option value="">Select a member...</option>
                  {members.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.full_name} (@{member.username})
                    </option>
                  ))}
                </select>
              </div>

              {/* Generation Number and Suffix */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Generation Number *
                  </label>
                  <Input
                    type="number"
                    required
                    min={0}
                    value={formData.gen_number}
                    onChange={(e) => handleChange('gen_number', parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                  <p className="text-xs text-text-tertiary mt-1">
                    Gen 0, Gen 1, Gen 2...
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Suffix (4 characters)
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={formData.suffix}
                      onChange={(e) => handleChange('suffix', e.target.value.toUpperCase().slice(0, 4))}
                      placeholder="AUTO"
                      maxLength={4}
                      className="flex-1 font-mono uppercase"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={generateRandomSuffix}
                      disabled={generatingSuffix}
                    >
                      {generatingSuffix ? (
                        <div className="w-4 h-4 border-2 border-text-tertiary/30 border-t-text-tertiary rounded-full animate-spin" />
                      ) : (
                        <Shuffle className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-text-tertiary mt-1">
                    Leave empty for auto-generate
                  </p>
                </div>
              </div>

              {/* Certificate File Upload */}
              <ImageUpload
                value={uploadedImage}
                onChange={handleImageChange}
                usage="certificate"
                placeholder="Upload Certificate Image"
                maxSize={10 * 1024 * 1024}
              />

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Certificate Title
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Course Completion Certificate"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Additional notes about this certificate..."
                  rows={3}
                  className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-blue/50 focus:border-primary-blue"
                />
              </div>

              {error && (
                <div className="p-4 bg-error/20 border border-error/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-error">{error}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Award className="w-4 h-4 mr-2" />
                      Issue Certificate
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function CertificateManagementPage() {
  const { session } = useAuth()
  const { showToast } = useToast()
  const { confirm } = useConfirm()
  const [certificates, setCertificates] = useState<CertificateData[]>([])
  const [members, setMembers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGen, setSelectedGen] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [dataLoaded, setDataLoaded] = useState(false)

  const fetchCertificates = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!session?.access_token) {
        setError('Authentication required. Please refresh the page.')
        return
      }

      const params = new URLSearchParams()
      if (searchTerm) params.set('search', searchTerm)
      if (selectedGen !== 'all') params.set('gen', selectedGen)

      const response = await fetch(`/api/admin/certificates?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        }
      })
      const result = await response.json()

      if (result.success) {
        setCertificates(result.certificates)
        setDataLoaded(true)
        setError(null)
      } else {
        setError(result.error)
      }
    } catch {
      setError('Failed to fetch certificates')
    } finally {
      setLoading(false)
    }
  }

  const fetchMembers = async () => {
    try {
      if (!session?.access_token) return

      const response = await fetch('/api/members', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        }
      })
      const result = await response.json()

      if (result.success) {
        setMembers(result.members)
      }
    } catch {
      console.error('Failed to fetch members')
    }
  }

  const deleteCertificate = async (id: string, certificateId: string) => {
    const confirmed = await confirm({
      title: 'Delete Certificate',
      message: `Are you sure you want to delete certificate ${certificateId}? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    })

    if (!confirmed) return

    try {
      setDeletingId(id)

      if (!session?.access_token) {
        showToast('error', 'Authentication required')
        return
      }

      const response = await fetch(`/api/admin/certificates/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        }
      })

      const result = await response.json()

      if (result.success) {
        showToast('success', 'Certificate deleted successfully')
        await fetchCertificates()
      } else {
        showToast('error', result.error || 'Failed to delete certificate')
      }
    } catch {
      showToast('error', 'Network error')
    } finally {
      setDeletingId(null)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    showToast('success', 'Copied to clipboard!')
  }

  useEffect(() => {
    if (session) {
      fetchMembers()
    }
  }, [session])

  useEffect(() => {
    if (dataLoaded) {
      fetchCertificates()
    }
  }, [selectedGen])

  // Get unique gen numbers for filter
  const genNumbers = [...new Set(certificates.map(c => c.gen_number))].sort((a, b) => a - b)

  const filteredCertificates = certificates.filter(cert =>
    cert.certificate_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.member?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.member?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading && !dataLoaded) {
    return (
      <ProtectedRoute requireAdmin={true}>
        <div className="min-h-screen flex items-center justify-center">
          <Loading size="lg" text="Loading certificates..." />
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          {/* Back to Dashboard */}
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="mb-4 pl-0 hover:pl-2 transition-all">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">
                Certificate Management
              </h1>
              <p className="text-text-secondary">
                Issue and manage member certificates
              </p>
            </div>
            <div className="flex gap-3">
              {!dataLoaded && (
                <Button
                  onClick={fetchCertificates}
                  variant="primary"
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Load Certificates
                </Button>
              )}
              {dataLoaded && (
                <Button
                  onClick={fetchCertificates}
                  variant="secondary"
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              )}
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Issue Certificate
              </Button>
            </div>
          </div>

          {/* Data Loading Notice */}
          {!dataLoaded && !loading && (
            <Card className="mb-8 border-primary-blue/20 bg-primary-blue/5">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">🎓</div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  Certificate Management Ready
                </h3>
                <p className="text-text-secondary mb-4">
                  Click "Load Certificates" to view all issued certificates.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Search and Filter */}
          {dataLoaded && (
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex-1 min-w-[200px]">
                    <Input
                      placeholder="Search by ID or member name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      icon={<Search className="w-4 h-4" />}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedGen('all')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        selectedGen === 'all'
                          ? 'bg-primary-blue text-white'
                          : 'bg-dark-surface text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      All Gens
                    </button>
                    {genNumbers.map(gen => (
                      <button
                        key={gen}
                        onClick={() => setSelectedGen(gen.toString())}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          selectedGen === gen.toString()
                            ? 'bg-primary-blue text-white'
                            : 'bg-dark-surface text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        Gen {gen}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Certificates List */}
          {dataLoaded && error ? (
            <Card className="text-center py-12">
              <CardContent>
                <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  Error Loading Certificates
                </h3>
                <p className="text-text-secondary mb-4">{error}</p>
                <Button onClick={fetchCertificates}>Retry</Button>
              </CardContent>
            </Card>
          ) : dataLoaded ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Certificates ({filteredCertificates.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-dark-border">
                        <th className="text-left py-3 text-text-primary font-semibold">Certificate ID</th>
                        <th className="text-left py-3 text-text-primary font-semibold">Member</th>
                        <th className="text-left py-3 text-text-primary font-semibold">Gen</th>
                        <th className="text-left py-3 text-text-primary font-semibold">Title</th>
                        <th className="text-left py-3 text-text-primary font-semibold">Issued</th>
                        <th className="text-right py-3 text-text-primary font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCertificates.map((cert) => (
                        <tr key={cert.id} className="border-b border-dark-border/50 hover:bg-dark-surface/50">
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              <code className="px-2 py-1 bg-primary-blue/10 text-primary-blue rounded font-mono text-sm">
                                {cert.certificate_id}
                              </code>
                              <button
                                onClick={() => copyToClipboard(cert.certificate_id)}
                                className="text-text-tertiary hover:text-text-primary"
                                title="Copy ID"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <Avatar
                                name={cert.member?.full_name}
                                src={cert.member?.avatar_url}
                                size="sm"
                              />
                              <div>
                                <p className="font-medium text-text-primary">
                                  {cert.member?.full_name || 'Unknown'}
                                </p>
                                <p className="text-sm text-text-tertiary">
                                  @{cert.member?.username || 'unknown'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4">
                            <Badge variant="primary">
                              Gen {cert.gen_number}
                            </Badge>
                          </td>
                          <td className="py-4 text-text-secondary">
                            {cert.title}
                          </td>
                          <td className="py-4 text-text-secondary text-sm">
                            {new Date(cert.issued_at).toLocaleDateString('vi-VN')}
                          </td>
                          <td className="py-4">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(`/verify/${cert.certificate_id}`, '_blank')}
                                title="View Certificate"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteCertificate(cert.id, cert.certificate_id)}
                                disabled={deletingId === cert.id}
                                className="text-error hover:text-error hover:bg-error/10"
                              >
                                {deletingId === cert.id ? (
                                  <div className="w-4 h-4 border-2 border-error/30 border-t-error rounded-full animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredCertificates.length === 0 && (
                  <div className="text-center py-12">
                    <Award className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-text-primary mb-2">
                      No Certificates Found
                    </h3>
                    <p className="text-text-secondary">
                      {searchTerm ? 'Try adjusting your search criteria.' : 'Get started by issuing your first certificate.'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : null}

          {/* Create Certificate Modal */}
          <CreateCertificateModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onCertificateCreated={fetchCertificates}
            members={members}
          />
        </div>
      </div>
    </ProtectedRoute>
  )
}

export default CertificateManagementPage
