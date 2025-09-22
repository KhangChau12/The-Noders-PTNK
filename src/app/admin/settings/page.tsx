'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Badge } from '@/components/Badge'
import { Loading } from '@/components/Loading'
import {
  Settings,
  Save,
  RefreshCw,
  Database,
  Shield,
  Mail,
  Globe,
  Users,
  FileText,
  CheckCircle,
  AlertCircle,
  Server,
  Key,
  Bell,
  Palette,
  Zap
} from 'lucide-react'

interface SystemConfig {
  id: string
  key: string
  value: string
  description: string
  category: 'general' | 'security' | 'email' | 'database' | 'features'
  type: 'text' | 'number' | 'boolean' | 'email' | 'url'
  is_public: boolean
  updated_at: string
}

function SystemSettingsPage() {
  const [settings, setSettings] = useState<SystemConfig[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string>('general')

  // Auto-load data on component mount
  useEffect(() => {
    if (!dataLoaded) {
      loadSettings()
    }
  }, [])

  // Mock system settings data
  const mockSettings: SystemConfig[] = [
    // General Settings
    {
      id: '1',
      key: 'site_name',
      value: 'The Noders PTNK',
      description: 'The name of your organization',
      category: 'general',
      type: 'text',
      is_public: true,
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      key: 'site_description',
      value: 'A community of AI enthusiasts building the future',
      description: 'Short description of your organization',
      category: 'general',
      type: 'text',
      is_public: true,
      updated_at: new Date().toISOString()
    },
    {
      id: '3',
      key: 'contact_email',
      value: 'phuckhangtdn@gmail.com',
      description: 'Primary contact email for the organization',
      category: 'general',
      type: 'email',
      is_public: true,
      updated_at: new Date().toISOString()
    },
    {
      id: '4',
      key: 'max_members',
      value: '100',
      description: 'Maximum number of members allowed',
      category: 'general',
      type: 'number',
      is_public: false,
      updated_at: new Date().toISOString()
    },

    // Security Settings
    {
      id: '5',
      key: 'session_timeout',
      value: '24',
      description: 'Session timeout in hours',
      category: 'security',
      type: 'number',
      is_public: false,
      updated_at: new Date().toISOString()
    },
    {
      id: '6',
      key: 'require_email_verification',
      value: 'true',
      description: 'Require email verification for new accounts',
      category: 'security',
      type: 'boolean',
      is_public: false,
      updated_at: new Date().toISOString()
    },
    {
      id: '7',
      key: 'enable_two_factor',
      value: 'false',
      description: 'Enable two-factor authentication',
      category: 'security',
      type: 'boolean',
      is_public: false,
      updated_at: new Date().toISOString()
    },

    // Email Settings
    {
      id: '8',
      key: 'smtp_host',
      value: 'smtp.gmail.com',
      description: 'SMTP server hostname',
      category: 'email',
      type: 'text',
      is_public: false,
      updated_at: new Date().toISOString()
    },
    {
      id: '9',
      key: 'smtp_port',
      value: '587',
      description: 'SMTP server port',
      category: 'email',
      type: 'number',
      is_public: false,
      updated_at: new Date().toISOString()
    },
    {
      id: '10',
      key: 'from_email',
      value: 'noreply@aiagentclub.com',
      description: 'Email address for outgoing emails',
      category: 'email',
      type: 'email',
      is_public: false,
      updated_at: new Date().toISOString()
    },

    // Feature Settings
    {
      id: '11',
      key: 'enable_public_registration',
      value: 'false',
      description: 'Allow public user registration',
      category: 'features',
      type: 'boolean',
      is_public: false,
      updated_at: new Date().toISOString()
    },
    {
      id: '12',
      key: 'enable_project_submissions',
      value: 'true',
      description: 'Allow members to submit projects',
      category: 'features',
      type: 'boolean',
      is_public: false,
      updated_at: new Date().toISOString()
    }
  ]

  const loadSettings = async () => {
    try {
      setLoading(true)
      setError(null)

      // Quick load for demo - simulate fast API
      await new Promise(resolve => setTimeout(resolve, 300))

      setSettings(mockSettings)
      setDataLoaded(true)
    } catch (err) {
      setError('Failed to load system settings')
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    try {
      setSaving(true)
      setError(null)

      // Quick save for demo
      await new Promise(resolve => setTimeout(resolve, 500))

      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
    } catch (err) {
      setError('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (id: string, value: string) => {
    setSettings(prev =>
      prev.map(setting =>
        setting.id === id
          ? { ...setting, value, updated_at: new Date().toISOString() }
          : setting
      )
    )
  }

  const categories = [
    { id: 'general', name: 'General', icon: Settings, color: 'text-primary-blue' },
    { id: 'security', name: 'Security', icon: Shield, color: 'text-error' },
    { id: 'email', name: 'Email', icon: Mail, color: 'text-accent-cyan' },
    { id: 'features', name: 'Features', icon: Zap, color: 'text-success' }
  ]

  const filteredSettings = settings.filter(setting => setting.category === activeCategory)

  const renderSettingInput = (setting: SystemConfig) => {
    switch (setting.type) {
      case 'boolean':
        return (
          <select
            value={setting.value}
            onChange={(e) => updateSetting(setting.id, e.target.value)}
            className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-blue/50 focus:border-primary-blue"
          >
            <option value="true">Enabled</option>
            <option value="false">Disabled</option>
          </select>
        )
      case 'number':
        return (
          <Input
            type="number"
            value={setting.value}
            onChange={(e) => updateSetting(setting.id, e.target.value)}
          />
        )
      case 'email':
        return (
          <Input
            type="email"
            value={setting.value}
            onChange={(e) => updateSetting(setting.id, e.target.value)}
          />
        )
      case 'url':
        return (
          <Input
            type="url"
            value={setting.value}
            onChange={(e) => updateSetting(setting.id, e.target.value)}
          />
        )
      default:
        return (
          <Input
            type="text"
            value={setting.value}
            onChange={(e) => updateSetting(setting.id, e.target.value)}
          />
        )
    }
  }

  if (loading && !dataLoaded) {
    return (
      <ProtectedRoute requireAdmin={true}>
        <div className="min-h-screen flex items-center justify-center">
          <Loading size="lg" text="Loading system settings..." />
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">
                System Settings
              </h1>
              <p className="text-text-secondary">
                Configure system-wide settings and preferences
              </p>
            </div>
            <div className="flex gap-3">
              {!dataLoaded && (
                <Button
                  onClick={loadSettings}
                  variant="primary"
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Load Settings
                </Button>
              )}
              {dataLoaded && (
                <>
                  <Button
                    onClick={loadSettings}
                    variant="secondary"
                    disabled={loading}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <Button
                    onClick={saveSettings}
                    variant="primary"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <Card className="mb-6 border-success/20 bg-success/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="text-success font-medium">
                    Settings saved successfully!
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Data Loading Notice */}
          {!dataLoaded && !loading && (
            <Card className="mb-8 border-primary-blue/20 bg-primary-blue/5">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">⚙️</div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  System Settings Ready
                </h3>
                <p className="text-text-secondary mb-4">
                  Click "Load Settings" to fetch current system configuration.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Settings Interface */}
          {dataLoaded && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Category Sidebar */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {categories.map((category) => {
                        const Icon = category.icon
                        const isActive = activeCategory === category.id
                        const settingsInCategory = settings.filter(s => s.category === category.id).length

                        return (
                          <button
                            key={category.id}
                            onClick={() => setActiveCategory(category.id)}
                            className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                              isActive
                                ? 'border-primary-blue bg-primary-blue/10 text-primary-blue'
                                : 'border-dark-border hover:border-dark-border/60 text-text-secondary hover:text-text-primary'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Icon className={`w-4 h-4 ${isActive ? 'text-primary-blue' : category.color}`} />
                              <span className="font-medium">{category.name}</span>
                            </div>
                            <Badge variant="secondary" size="sm">
                              {settingsInCategory}
                            </Badge>
                          </button>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Panel */}
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {(() => {
                        const category = categories.find(c => c.id === activeCategory)
                        const Icon = category?.icon || Settings
                        return (
                          <>
                            <Icon className="w-5 h-5" />
                            {category?.name} Settings
                          </>
                        )
                      })()}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {error && (
                      <div className="mb-6 p-4 bg-error/20 border border-error/30 rounded-lg text-error text-sm">
                        {error}
                      </div>
                    )}

                    <div className="space-y-6">
                      {filteredSettings.map((setting) => (
                        <div key={setting.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="block text-sm font-medium text-text-primary">
                              {setting.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </label>
                            <div className="flex items-center gap-2">
                              {!setting.is_public && (
                                <Badge variant="secondary" size="sm">
                                  <Key className="w-3 h-3 mr-1" />
                                  Private
                                </Badge>
                              )}
                            </div>
                          </div>

                          {renderSettingInput(setting)}

                          <p className="text-xs text-text-tertiary">
                            {setting.description}
                          </p>
                        </div>
                      ))}

                      {filteredSettings.length === 0 && (
                        <div className="text-center py-8">
                          <Settings className="w-12 h-12 text-text-tertiary mx-auto mb-3" />
                          <h3 className="text-lg font-semibold text-text-primary mb-2">
                            No Settings Found
                          </h3>
                          <p className="text-text-secondary">
                            This category doesn't have any configurable settings yet.
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}

export default SystemSettingsPage