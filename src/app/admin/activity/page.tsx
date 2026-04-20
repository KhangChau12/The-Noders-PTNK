'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Card, CardContent, CardHeader } from '@/components/Card'
import { Button } from '@/components/Button'
import { Badge } from '@/components/Badge'
import { Input } from '@/components/Input'
import { Loading } from '@/components/Loading'
import { Avatar } from '@/components/Avatar'
import { Plus, Search, Users, Sparkles, BookOpen, ClipboardList, Check } from 'lucide-react'

interface ActivityTemplate {
  id: string
  name: string
  description: string
  usage_count?: number
}

interface ActivityMember {
  id: string
  username: string
  full_name: string
  avatar_url: string | null
  role: 'admin' | 'member'
  contest_count?: number
}

interface ActivityLogMember {
  member_id: string
  username: string
  full_name: string
  avatar_url: string | null
  role: 'admin' | 'member'
  points: number
}

interface ActivityLog {
  id: string
  task_template_id: string | null
  task_name: string
  task_description: string
  points: number
  member_count?: number
  total_points?: number
  members?: ActivityLogMember[]
}

function AdminActivityContent() {
  const { session } = useAuth()
  const [templates, setTemplates] = useState<ActivityTemplate[]>([])
  const [members, setMembers] = useState<ActivityMember[]>([])
  const [taskLogs, setTaskLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [selectedTemplateId, setSelectedTemplateId] = useState('')
  const [taskName, setTaskName] = useState('')
  const [taskDescription, setTaskDescription] = useState('')
  const [points, setPoints] = useState('')
  const [memberSearch, setMemberSearch] = useState('')
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([])

  const fetchData = async () => {
    if (!session?.access_token) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/admin/activity', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      const data = await response.json()
      if (!response.ok || !data.success) {
        setError(data.error || 'Failed to load activity data')
        return
      }

      setTemplates(data.templates || [])
      setMembers(data.members || [])
      setTaskLogs(data.task_logs || [])
    } catch (fetchError) {
      console.error('Error loading activity data:', fetchError)
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.access_token) {
      fetchData()
    }
  }, [session?.access_token])

  const filteredMembers = useMemo(() => {
    const search = memberSearch.trim().toLowerCase()
    if (!search) return members

    return members.filter((member) => {
      return (
        member.full_name?.toLowerCase().includes(search) ||
        member.username?.toLowerCase().includes(search)
      )
    })
  }, [members, memberSearch])

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId)
    const template = templates.find((item) => item.id === templateId)
    if (!template) {
      setTaskName('')
      setTaskDescription('')
      return
    }

    setTaskName(template.name)
    setTaskDescription(template.description || '')
  }

  const toggleMember = (memberId: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    )
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!session?.access_token) return

    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      const response = await fetch('/api/admin/activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          templateId: selectedTemplateId || undefined,
          taskName,
          taskDescription,
          points: Number(points),
          memberIds: selectedMemberIds,
        }),
      })

      const data = await response.json()
      if (!response.ok || !data.success) {
        setError(data.error || 'Failed to create task log')
        return
      }

      setSuccess('Task points saved successfully')
      setSelectedTemplateId('')
      setTaskName('')
      setTaskDescription('')
      setPoints('')
      setSelectedMemberIds([])
      await fetchData()
    } catch (submitError) {
      console.error('Error saving task log:', submitError)
      setError('Network error occurred')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" text="Loading activity manager..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl space-y-8">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
              <ClipboardList className="w-8 h-8 text-accent-orange" />
              Activity Points Manager
            </h1>
            <p className="text-text-secondary mt-2 max-w-2xl">
              Create scored tasks, reuse old templates, and assign points to multiple members in one entry.
            </p>
          </div>
          <Button onClick={fetchData} variant="secondary">
            Refresh
          </Button>
        </div>

        {error && (
          <Card className="border border-red-500/40 bg-red-500/10">
            <CardContent className="p-4 text-red-200">{error}</CardContent>
          </Card>
        )}

        {success && (
          <Card className="border border-green-500/40 bg-green-500/10">
            <CardContent className="p-4 text-green-200">{success}</CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-dark-border bg-dark-surface/70">
              <CardHeader>
                <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-accent-orange" />
                  Create Task Entry
                </h2>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">Reuse old task</label>
                      <select
                        value={selectedTemplateId}
                        onChange={(event) => handleTemplateSelect(event.target.value)}
                        className="w-full rounded-lg border border-dark-border bg-dark-bg px-3 py-2 text-text-primary"
                      >
                        <option value="">Create new task</option>
                        {templates.map((template) => (
                          <option key={template.id} value={template.id}>
                            {template.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">Points</label>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={points}
                        onChange={(event) => setPoints(event.target.value)}
                        placeholder="e.g. 10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">Task name</label>
                    <Input
                      value={taskName}
                      onChange={(event) => setTaskName(event.target.value)}
                      placeholder="Enter task name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">Description (optional)</label>
                    <textarea
                      value={taskDescription}
                      onChange={(event) => setTaskDescription(event.target.value)}
                      placeholder="Describe the task"
                      rows={4}
                      className="w-full rounded-lg border border-dark-border bg-dark-bg px-3 py-2 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-blue/50"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-text-secondary">Members</label>
                      <Badge variant="secondary">{selectedMemberIds.length} selected</Badge>
                    </div>
                    <Input
                      value={memberSearch}
                      onChange={(event) => setMemberSearch(event.target.value)}
                      placeholder="Search members..."
                      icon={<Search className="w-4 h-4" />}
                    />
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
                      {filteredMembers.map((member) => {
                        const selected = selectedMemberIds.includes(member.id)
                        return (
                          <button
                            key={member.id}
                            type="button"
                            onClick={() => toggleMember(member.id)}
                            className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-colors ${selected ? 'border-accent-orange bg-accent-orange/10' : 'border-dark-border bg-dark-bg hover:bg-dark-surface'}`}
                          >
                            <Avatar name={member.full_name} src={member.avatar_url} size="sm" />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-text-primary truncate">{member.full_name || member.username}</p>
                                {member.role === 'admin' && <Badge size="sm">Core Team</Badge>}
                              </div>
                              <p className="text-xs text-text-tertiary truncate">@{member.username}</p>
                            </div>
                            {selected && <Check className="w-4 h-4 text-accent-orange flex-shrink-0" />}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <Button type="submit" disabled={saving || !taskName || !points || selectedMemberIds.length === 0}>
                      <Plus className="w-4 h-4 mr-2" />
                      {saving ? 'Saving...' : 'Save Task Points'}
                    </Button>
                    <span className="text-sm text-text-tertiary">
                      Same task name can be reused with a different point value.
                    </span>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="border-dark-border bg-dark-surface/70">
              <CardHeader>
                <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary-blue" />
                  Recorded Task Entries
                </h2>
              </CardHeader>
              <CardContent>
                {taskLogs.length > 0 ? (
                  <div className="space-y-4">
                    {taskLogs.map((log) => (
                      <div key={log.id} className="rounded-xl border border-dark-border bg-dark-bg p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-text-primary">{log.task_name}</h3>
                            {log.task_description && <p className="text-sm text-text-secondary mt-1">{log.task_description}</p>}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="primary">{log.points} pts each</Badge>
                            <Badge variant="secondary">{log.member_count || 0} members</Badge>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(log.members || []).map((member) => (
                            <span key={`${log.id}-${member.member_id}`} className="inline-flex items-center gap-2 rounded-full bg-dark-surface border border-dark-border px-3 py-1 text-xs text-text-secondary">
                              <span>{member.full_name || member.username}</span>
                              <span className="text-text-tertiary">+{member.points}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-text-tertiary">
                    No task entries yet.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="border-dark-border bg-dark-surface/70">
              <CardHeader>
                <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-accent-orange" />
                  Saved Templates
                </h2>
              </CardHeader>
              <CardContent>
                {templates.length > 0 ? (
                  <div className="space-y-3">
                    {templates.map((template) => (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => handleTemplateSelect(template.id)}
                        className={`w-full rounded-xl border p-3 text-left transition-colors ${selectedTemplateId === template.id ? 'border-accent-orange bg-accent-orange/10' : 'border-dark-border bg-dark-bg hover:bg-dark-surface'}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-medium text-text-primary">{template.name}</h3>
                            {template.description && <p className="text-sm text-text-secondary mt-1 line-clamp-2">{template.description}</p>}
                          </div>
                          <Badge variant="secondary">{template.usage_count || 0}</Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-text-tertiary">No templates saved yet.</div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminActivityPage() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminActivityContent />
    </ProtectedRoute>
  )
}
