'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/components/AuthProvider'
import { Card, CardContent, CardHeader } from '@/components/Card'
import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Loading } from '@/components/Loading'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Avatar } from '@/components/Avatar'
import { UpdateProfileData } from '@/types/member'
import {
  ArrowLeft,
  Save,
  Upload,
  X,
  Plus,
  Github,
  Linkedin,
  Twitter,
  Facebook,
  Globe,
  User,
  Mail,
  FileText,
  Shield,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react'

interface SkillsEditorProps {
  skills: string[]
  onChange: (skills: string[]) => void
}

function SkillsEditor({ skills, onChange }: SkillsEditorProps) {
  const [newSkill, setNewSkill] = useState('')

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      onChange([...skills, newSkill.trim()])
      setNewSkill('')
    }
  }

  const removeSkill = (skillToRemove: string) => {
    onChange(skills.filter(skill => skill !== skillToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addSkill()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Add a skill (e.g. React, Python, AI)"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1"
        />
        <Button
          type="button"
          onClick={addSkill}
          variant="secondary"
          size="sm"
          disabled={!newSkill.trim()}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <Badge key={index} variant="tech" className="flex items-center gap-1">
              {skill}
              <Button
                type="button"
                onClick={() => removeSkill(skill)}
                variant="ghost"
                size="sm"
                className="ml-1 hover:text-error transition-colors p-0 h-auto"
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

interface SocialLinksEditorProps {
  socialLinks: UpdateProfileData['social_links']
  onChange: (socialLinks: UpdateProfileData['social_links']) => void
}

function SocialLinksEditor({ socialLinks, onChange }: SocialLinksEditorProps) {
  const handleChange = (platform: string, value: string) => {
    onChange({
      ...socialLinks,
      [platform]: value || undefined
    })
  }

  const socialPlatforms = [
    { key: 'github', label: 'GitHub', icon: Github, placeholder: 'https://github.com/username' },
    { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/in/username' },
    { key: 'twitter', label: 'Twitter', icon: Twitter, placeholder: 'https://twitter.com/username' },
    { key: 'facebook', label: 'Facebook', icon: Facebook, placeholder: 'https://facebook.com/username' },
    { key: 'website', label: 'Website', icon: Globe, placeholder: 'https://yourwebsite.com' }
  ]

  return (
    <div className="space-y-4">
      {socialPlatforms.map(({ key, label, icon: Icon, placeholder }) => (
        <div key={key}>
          <label className="block text-sm font-medium text-text-primary mb-2">
            <Icon className="w-4 h-4 inline mr-2" />
            {label}
          </label>
          <Input
            type="url"
            placeholder={placeholder}
            value={socialLinks?.[key as keyof typeof socialLinks] || ''}
            onChange={(e) => handleChange(key, e.target.value)}
          />
        </div>
      ))}
    </div>
  )
}

function ProfileEditPage() {
  const router = useRouter()
  const { profile, user, updateProfile, changePassword } = useAuth()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Password change state
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [formData, setFormData] = useState<UpdateProfileData>({
    full_name: profile?.full_name || '',
    username: profile?.username || '',
    bio: profile?.bio || '',
    skills: profile?.skills || [],
    avatar_url: profile?.avatar_url || '',
    social_links: profile?.social_links || {}
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const result = await updateProfile(formData)

      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof UpdateProfileData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handlePasswordChange = async () => {
    setPasswordLoading(true)
    setPasswordError(null)
    setPasswordSuccess(false)

    try {
      // Validation
      if (passwordData.newPassword.length < 6) {
        setPasswordError('Password must be at least 6 characters long')
        setPasswordLoading(false)
        return
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setPasswordError('New passwords do not match')
        setPasswordLoading(false)
        return
      }

      const result = await changePassword(passwordData.currentPassword, passwordData.newPassword)

      if (result.error) {
        setPasswordError(result.error)
        return
      }

      setPasswordSuccess(true)
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })

      setTimeout(() => setPasswordSuccess(false), 5000)
    } catch (err) {
      setPasswordError('An unexpected error occurred')
    } finally {
      setPasswordLoading(false)
    }
  }

  if (!profile) {
    return <Loading />
  }

  // Use CSS Avatar component instead of external image

  return (
    <ProtectedRoute>
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <Button
              onClick={() => router.back()}
              variant="ghost"
              size="sm"
              className="inline-flex items-center text-text-secondary hover:text-primary-blue transition-colors mb-4 px-0"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <h1 className="text-3xl font-bold text-text-primary">Edit Profile</h1>
            <p className="text-text-secondary mt-2">
              Update your profile information and preferences.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Preview */}
              <div className="lg:col-span-1">
                <Card className="sticky top-8">
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-text-primary">Preview</h3>
                  </CardHeader>
                  <CardContent className="text-center">
                    {/* Avatar */}
                    <div className="mx-auto mb-4 flex justify-center">
                      <Avatar
                        name={formData.avatar_url ? null : formData.full_name}
                        size="xl"
                      />
                    </div>

                    {/* Basic Info */}
                    <h4 className="font-semibold text-text-primary mb-1">
                      {formData.full_name || 'Your Name'}
                    </h4>
                    <p className="text-text-secondary text-sm mb-2">
                      @{formData.username || 'username'}
                    </p>
                    <Badge variant={profile.role === 'admin' ? 'primary' : 'secondary'} size="sm">
                      {profile.role === 'admin' ? 'Admin' : 'Member'}
                    </Badge>

                    {/* Bio Preview */}
                    {formData.bio && (
                      <p className="text-text-secondary text-xs mt-4 leading-relaxed">
                        {formData.bio}
                      </p>
                    )}

                    {/* Skills Preview */}
                    {formData.skills && formData.skills.length > 0 && (
                      <div className="mt-4">
                        <div className="flex flex-wrap gap-1 justify-center">
                          {formData.skills.slice(0, 4).map((skill, index) => (
                            <Badge key={index} variant="tech" size="sm">
                              {skill}
                            </Badge>
                          ))}
                          {formData.skills.length > 4 && (
                            <Badge variant="secondary" size="sm">
                              +{formData.skills.length - 4}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Form Fields */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Basic Information
                    </h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">
                          Full Name
                        </label>
                        <Input
                          required
                          placeholder="Your full name"
                          value={formData.full_name || ''}
                          onChange={(e) => handleChange('full_name', e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">
                          Username
                        </label>
                        <Input
                          required
                          placeholder="username"
                          value={formData.username || ''}
                          onChange={(e) => handleChange('username', e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Email Address
                      </label>
                      <Input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="bg-dark-surface opacity-75"
                        icon={<Mail className="w-4 h-4" />}
                      />
                      <p className="text-xs text-text-tertiary mt-1">
                        Email cannot be changed. Contact admin if needed.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Bio
                      </label>
                      <textarea
                        placeholder="Tell us about yourself..."
                        value={formData.bio || ''}
                        onChange={(e) => handleChange('bio', e.target.value)}
                        rows={4}
                        maxLength={500}
                        className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-blue/50 focus:border-primary-blue"
                      />
                      <p className="text-xs text-text-tertiary mt-1">
                        {formData.bio?.length || 0}/500 characters
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Avatar URL (Optional)
                      </label>
                      <Input
                        type="url"
                        placeholder="https://example.com/avatar.jpg"
                        value={formData.avatar_url || ''}
                        onChange={(e) => handleChange('avatar_url', e.target.value)}
                        icon={<Upload className="w-4 h-4" />}
                      />
                      <p className="text-xs text-text-tertiary mt-1">
                        Leave empty to use auto-generated avatar
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Skills */}
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Skills & Expertise
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <SkillsEditor
                      skills={formData.skills || []}
                      onChange={(skills) => handleChange('skills', skills)}
                    />
                  </CardContent>
                </Card>

                {/* Social Links */}
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Social Links
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <SocialLinksEditor
                      socialLinks={formData.social_links}
                      onChange={(socialLinks) => handleChange('social_links', socialLinks)}
                    />
                  </CardContent>
                </Card>

                {/* Security Settings */}
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Security Settings
                    </h3>
                    <p className="text-text-secondary text-sm mt-1">
                      Change your account password to keep your account secure.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <Input
                          type={showPasswords.current ? "text" : "password"}
                          placeholder="Enter current password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData(prev => ({
                            ...prev,
                            currentPassword: e.target.value
                          }))}
                          icon={<Lock className="w-4 h-4" />}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({
                            ...prev,
                            current: !prev.current
                          }))}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors"
                        >
                          {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <Input
                          type={showPasswords.new ? "text" : "password"}
                          placeholder="Enter new password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData(prev => ({
                            ...prev,
                            newPassword: e.target.value
                          }))}
                          icon={<Lock className="w-4 h-4" />}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({
                            ...prev,
                            new: !prev.new
                          }))}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors"
                        >
                          {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-xs text-text-tertiary mt-1">
                        Password must be at least 6 characters long
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <Input
                          type={showPasswords.confirm ? "text" : "password"}
                          placeholder="Confirm new password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData(prev => ({
                            ...prev,
                            confirmPassword: e.target.value
                          }))}
                          icon={<Lock className="w-4 h-4" />}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({
                            ...prev,
                            confirm: !prev.confirm
                          }))}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors"
                        >
                          {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-dark-border">
                      <Button
                        type="button"
                        onClick={handlePasswordChange}
                        disabled={passwordLoading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                        variant="secondary"
                        className="w-full sm:w-auto"
                      >
                        {passwordLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                            Changing Password...
                          </>
                        ) : (
                          <>
                            <Shield className="w-4 h-4 mr-2" />
                            Change Password
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Password Success/Error Messages */}
                    {passwordSuccess && (
                      <div className="p-4 bg-success/20 border border-success/30 rounded-lg text-success text-sm">
                        Password changed successfully!
                      </div>
                    )}

                    {passwordError && (
                      <div className="p-4 bg-error/20 border border-error/30 rounded-lg text-error text-sm">
                        {passwordError}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Submit */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 sm:flex-none"
                  >
                    {loading ? (
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

                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => router.push('/dashboard')}
                  >
                    Cancel
                  </Button>
                </div>

                {/* Success/Error Messages */}
                {success && (
                  <div className="p-4 bg-success/20 border border-success/30 rounded-lg text-success text-sm">
                    Profile updated successfully!
                  </div>
                )}

                {error && (
                  <div className="p-4 bg-error/20 border border-error/30 rounded-lg text-error text-sm">
                    {error}
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  )
}

export default ProfileEditPage