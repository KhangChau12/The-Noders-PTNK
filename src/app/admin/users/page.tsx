'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuth } from '@/components/AuthProvider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Badge } from '@/components/Badge'
import { ClickableBadge } from '@/components/ClickableBadge'
import { Loading } from '@/components/Loading'
import { Avatar } from '@/components/Avatar'
import {
  Users,
  Plus,
  Trash2,
  Mail,
  Calendar,
  Shield,
  User,
  Edit,
  Search,
  AlertCircle,
  CheckCircle,
  X,
  RefreshCw,
  ArrowLeft
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface AuthUser {
  id: string
  email: string
  email_confirmed_at: string | null
  last_sign_in_at: string | null
  created_at: string
  profile: {
    id: string
    username: string | null
    full_name: string | null
    avatar_url: string | null
    bio: string | null
    skills: string[] | null
    role: 'admin' | 'member'
    social_links: any
    created_at: string
    updated_at: string
  } | null
}

interface CreateUserFormData {
  email: string
  password: string
  full_name: string
  username: string
  bio: string
  role: 'admin' | 'member'
  avatar_url: string
}

function CreateUserModal({ isOpen, onClose, onUserCreated }: {
  isOpen: boolean
  onClose: () => void
  onUserCreated: () => void
}) {
  const { session, user, profile, loading: authLoading, isAdmin } = useAuth()
  const [formData, setFormData] = useState<CreateUserFormData>({
    email: '',
    password: '',
    full_name: '',
    username: '',
    bio: '',
    role: 'member',
    avatar_url: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleChange = (field: keyof CreateUserFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Enhanced authentication validation with detailed logging
      console.log('CreateUser: Authentication check starting...')
      console.log('CreateUser: Session exists:', !!session)
      console.log('CreateUser: Access token exists:', !!session?.access_token)

      if (!session) {
        setError('No active session found. Please log in again.')
        console.error('CreateUser: No session available')
        return
      }

      if (!session.access_token) {
        setError('No authentication token found. Please refresh the page and try again.')
        console.error('CreateUser: No access token in session')
        return
      }

      console.log('CreateUser: Authentication validation passed')

      // Prepare request data
      const requestData = {
        email: formData.email,
        password: formData.password,
        profileData: {
          full_name: formData.full_name,
          username: formData.username,
          bio: formData.bio || null,
          role: formData.role,
          skills: [],
          avatar_url: formData.avatar_url || null,
          social_links: {}
        }
      }

      console.log('CreateUser: Sending request to API...')
      console.log('CreateUser: Request data (without password):', {
        ...requestData,
        password: '[REDACTED]'
      })

      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(requestData)
      })

      console.log('CreateUser: Response status:', response.status)
      console.log('CreateUser: Response ok:', response.ok)

      const result = await response.json()
      console.log('CreateUser: Response data:', result)

      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          onUserCreated()
          onClose()
          setSuccess(false)
          setFormData({
            email: '',
            password: '',
            full_name: '',
            username: '',
            bio: '',
            role: 'member',
            avatar_url: ''
          })
        }, 2000)
      } else {
        const errorMessage = result.error || 'Unknown error occurred'
        console.error('CreateUser: API returned error:', errorMessage)
        setError(`Failed to create user: ${errorMessage}`)
      }
    } catch (err) {
      console.error('CreateUser: Network/parsing error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown network error'
      setError(`Network error: ${errorMessage}. Please check your connection and try again.`)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  // Check authentication status before rendering
  if (authLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="w-8 h-8 border-2 border-primary-blue/30 border-t-primary-blue rounded-full animate-spin mx-auto mb-4" />
            <p className="text-text-secondary">Verifying authentication...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user || !session) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
            <h3 className="font-semibold text-text-primary mb-2">Authentication Required</h3>
            <p className="text-text-secondary mb-4">You need to be logged in to create users.</p>
            <Button onClick={onClose}>Close</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Shield className="w-12 h-12 text-warning mx-auto mb-4" />
            <h3 className="font-semibold text-text-primary mb-2">Admin Access Required</h3>
            <p className="text-text-secondary mb-4">
              You need admin privileges to create new users. Current role: {profile?.role || 'unknown'}
            </p>
            <Button onClick={onClose}>Close</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create New User
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
                User Created Successfully!
              </h3>
              <p className="text-text-secondary">
                The new user account has been created and they can now log in.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Authentication Info */}
              <div className="space-y-4">
                <h4 className="font-semibold text-text-primary border-b border-dark-border pb-2">
                  Authentication
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Email Address *
                    </label>
                    <Input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="user@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Password *
                    </label>
                    <Input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      placeholder="Strong password"
                      minLength={6}
                    />
                  </div>
                </div>
              </div>

              {/* Profile Info */}
              <div className="space-y-4">
                <h4 className="font-semibold text-text-primary border-b border-dark-border pb-2">
                  Profile Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Full Name *
                    </label>
                    <Input
                      required
                      value={formData.full_name}
                      onChange={(e) => handleChange('full_name', e.target.value)}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Username *
                    </label>
                    <Input
                      required
                      value={formData.username}
                      onChange={(e) => handleChange('username', e.target.value)}
                      placeholder="johndoe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => handleChange('bio', e.target.value)}
                    placeholder="Tell us about this user..."
                    rows={3}
                    className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-blue/50 focus:border-primary-blue"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Role
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => handleChange('role', e.target.value as 'admin' | 'member')}
                      className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-blue/50 focus:border-primary-blue"
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Avatar URL
                    </label>
                    <Input
                      type="url"
                      value={formData.avatar_url}
                      onChange={(e) => handleChange('avatar_url', e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>
                </div>

              </div>

              {error && (
                <div className="p-4 bg-error/20 border border-error/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-error mb-1">Error Creating User</h4>
                      <p className="text-sm text-error">{error}</p>
                      {error.includes('Authentication') && (
                        <p className="text-xs text-error/80 mt-1">
                          💡 Try refreshing the page and logging in again if authentication issues persist.
                        </p>
                      )}
                      {error.includes('Admin') && (
                        <p className="text-xs text-error/80 mt-1">
                          💡 Please ensure you have admin privileges to create users.
                        </p>
                      )}
                    </div>
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
                      <Plus className="w-4 h-4 mr-2" />
                      Create User
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

function UserManagementPage() {
  const { session } = useAuth()
  const [users, setUsers] = useState<AuthUser[]>([])
  const [loading, setLoading] = useState(false) // Changed to false - manual loading
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)
  const [dataLoaded, setDataLoaded] = useState(false) // Track if data has been loaded

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!session?.access_token) {
        setError('Authentication required. Please refresh the page.')
        return
      }

      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        }
      })
      const result = await response.json()

      if (result.success) {
        setUsers(result.users)
        setDataLoaded(true)
        setError(null)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    try {
      setDeletingUserId(userId)

      if (!session?.access_token) {
        alert('Authentication required. Please refresh the page.')
        return
      }

      const response = await fetch(`/api/admin/users?id=${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        }
      })

      const result = await response.json()

      if (result.success) {
        await fetchUsers() // Refresh list
      } else {
        alert('Failed to delete user: ' + result.error)
      }
    } catch (err) {
      alert('Network error occurred')
    } finally {
      setDeletingUserId(null)
    }
  }

  // Auto-load data on first page visit
  useEffect(() => {
    if (!dataLoaded && session) {
      fetchUsers()
    }
  }, [session, dataLoaded])

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.profile?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <ProtectedRoute requireAdmin={true}>
        <div className="min-h-screen flex items-center justify-center">
          <Loading size="lg" text="Loading users..." />
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
                User Management
              </h1>
              <p className="text-text-secondary">
                Create and manage user accounts
              </p>
            </div>
            <div className="flex gap-3">
              {!dataLoaded && (
                <Button
                  onClick={fetchUsers}
                  variant="primary"
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Load Users
                </Button>
              )}
              {dataLoaded && (
                <Button
                  onClick={fetchUsers}
                  variant="secondary"
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              )}
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create User
              </Button>
            </div>
          </div>

          {/* Data Loading Notice */}
          {!dataLoaded && !loading && (
            <Card className="mb-8 border-primary-blue/20 bg-primary-blue/5">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">👥</div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  User Management Ready
                </h3>
                <p className="text-text-secondary mb-4">
                  To prevent server overload, user data is loaded manually. Click "Load Users" to fetch
                  the latest user accounts from the database.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Search */}
          {dataLoaded && (
            <div className="mb-6">
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search className="w-4 h-4" />}
                className="max-w-md"
              />
            </div>
          )}

          {/* Users List */}
          {dataLoaded && error ? (
            <Card className="text-center py-12">
              <CardContent>
                <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  Error Loading Users
                </h3>
                <p className="text-text-secondary mb-4">{error}</p>
                <Button onClick={fetchUsers}>Retry</Button>
              </CardContent>
            </Card>
          ) : dataLoaded ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Users ({filteredUsers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-dark-border">
                        <th className="text-left py-3 text-text-primary font-semibold">User</th>
                        <th className="text-left py-3 text-text-primary font-semibold">Email</th>
                        <th className="text-left py-3 text-text-primary font-semibold">Role</th>
                        <th className="text-left py-3 text-text-primary font-semibold">Status</th>
                        <th className="text-left py-3 text-text-primary font-semibold">Created</th>
                        <th className="text-right py-3 text-text-primary font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => {
                        const profile = user.profile
                        // Use CSS Avatar component instead of external image

                        return (
                          <tr key={user.id} className="border-b border-dark-border/50 hover:bg-dark-surface/50">
                            <td className="py-4">
                              <div className="flex items-center gap-3">
                                <Avatar
                                  name={profile?.full_name}
                                  src={profile?.avatar_url}
                                  size="md"
                                />
                                <div>
                                  <p className="font-medium text-text-primary">
                                    {profile?.full_name || 'No Name'}
                                  </p>
                                  <p className="text-sm text-text-tertiary">
                                    @{profile?.username || 'no-username'}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 text-text-secondary">
                              {user.email}
                            </td>
                            <td className="py-4">
                              <Badge variant={profile?.role === 'admin' ? 'primary' : 'secondary'}>
                                {profile?.role === 'admin' ? (
                                  <>
                                    <Shield className="w-3 h-3 mr-1" />
                                    Admin
                                  </>
                                ) : (
                                  <>
                                    <User className="w-3 h-3 mr-1" />
                                    Member
                                  </>
                                )}
                              </Badge>
                            </td>
                            <td className="py-4">
                              <Badge variant={user.email_confirmed_at ? 'success' : 'warning'} size="sm">
                                {user.email_confirmed_at ? 'Verified' : 'Pending'}
                              </Badge>
                            </td>
                            <td className="py-4 text-text-secondary text-sm">
                              {new Date(user.created_at).toLocaleDateString()}
                            </td>
                            <td className="py-4">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteUser(user.id)}
                                  disabled={deletingUserId === user.id}
                                  className="text-error hover:text-error hover:bg-error/10"
                                >
                                  {deletingUserId === user.id ? (
                                    <div className="w-4 h-4 border-2 border-error/30 border-t-error rounded-full animate-spin" />
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {filteredUsers.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-text-primary mb-2">
                      No Users Found
                    </h3>
                    <p className="text-text-secondary">
                      {searchTerm ? 'Try adjusting your search criteria.' : 'Get started by creating your first user.'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : null}

          {/* Create User Modal */}
          <CreateUserModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onUserCreated={fetchUsers}
          />
        </div>
      </div>
    </ProtectedRoute>
  )
}

export default UserManagementPage