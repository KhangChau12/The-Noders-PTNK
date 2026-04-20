import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

function normalizeText(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

async function requireAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 }) }
  }

  const token = authHeader.replace('Bearer ', '')
  const supabase = createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return { error: NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 }) }
  }

  await supabase.auth.setSession({
    access_token: token,
    refresh_token: token,
  })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return { error: NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 }) }
  }

  return { supabase, userId: user.id }
}

export async function GET(request: NextRequest) {
  try {
    const access = await requireAdmin(request)
    if ('error' in access) {
      return access.error
    }

    const { supabase } = access

    const [templatesResult, taskLogsResult, taskLogMembersResult, membersResult] = await Promise.all([
      supabase
        .from('task_templates')
        .select('id, name, description')
        .order('name', { ascending: true }),
      supabase
        .from('task_logs')
        .select('id, task_template_id, task_name, task_description, points')
        .order('task_name', { ascending: true }),
      supabase
        .from('task_log_members')
        .select(`
          task_log_id,
          points,
          member:profiles (
            id,
            username,
            full_name,
            avatar_url,
            role
          )
        `),
      supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, role, contest_count')
        .order('full_name', { ascending: true }),
    ])

    if (templatesResult.error) {
      return NextResponse.json({ success: false, error: templatesResult.error.message }, { status: 500 })
    }

    if (taskLogsResult.error) {
      return NextResponse.json({ success: false, error: taskLogsResult.error.message }, { status: 500 })
    }

    if (taskLogMembersResult.error) {
      return NextResponse.json({ success: false, error: taskLogMembersResult.error.message }, { status: 500 })
    }

    if (membersResult.error) {
      return NextResponse.json({ success: false, error: membersResult.error.message }, { status: 500 })
    }

    const memberMap = new Map<string, any>()
    ;(taskLogMembersResult.data || []).forEach((row: any) => {
      const member = row.member
      if (!member?.id) return

      const existing = memberMap.get(row.task_log_id) || []
      existing.push({
        member_id: member.id,
        username: member.username,
        full_name: member.full_name,
        avatar_url: member.avatar_url,
        role: member.role,
        points: row.points,
      })
      memberMap.set(row.task_log_id, existing)
    })

    const logs = (taskLogsResult.data || []).map((log: any) => ({
      ...log,
      members: memberMap.get(log.id) || [],
      member_count: (memberMap.get(log.id) || []).length,
      total_points: (memberMap.get(log.id) || []).reduce((sum: number, item: any) => sum + (Number(item.points) || 0), 0),
    }))

    const templateUsage = new Map<string, number>()
    ;(taskLogsResult.data || []).forEach((log: any) => {
      if (!log.task_template_id) return
      templateUsage.set(log.task_template_id, (templateUsage.get(log.task_template_id) || 0) + 1)
    })

    const templates = (templatesResult.data || [])
      .map((template: any) => ({
        ...template,
        usage_count: templateUsage.get(template.id) || 0,
      }))
      .sort((a: any, b: any) => {
        if (b.usage_count !== a.usage_count) {
          return b.usage_count - a.usage_count
        }
        return a.name.localeCompare(b.name)
      })

    return NextResponse.json({
      success: true,
      templates,
      task_logs: logs,
      members: membersResult.data || [],
    })
  } catch (error) {
    console.error('Error fetching activity data:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const access = await requireAdmin(request)
    if ('error' in access) {
      return access.error
    }

    const { supabase } = access
    const body = await request.json()

    const templateId = normalizeText(body.templateId || body.task_template_id)
    const taskName = normalizeText(body.taskName || body.name)
    const taskDescription = normalizeText(body.taskDescription || body.description)
    const points = Number(body.points)
    const memberIds = Array.isArray(body.memberIds) ? Array.from(new Set(body.memberIds.filter(Boolean))) : []

    if (!taskName) {
      return NextResponse.json({ success: false, error: 'Task name is required' }, { status: 400 })
    }

    if (!Number.isInteger(points) || points < 0) {
      return NextResponse.json({ success: false, error: 'Points must be a non-negative integer' }, { status: 400 })
    }

    if (memberIds.length === 0) {
      return NextResponse.json({ success: false, error: 'At least one member must be selected' }, { status: 400 })
    }

    const { data: existingMembers, error: memberCheckError } = await supabase
      .from('profiles')
      .select('id')
      .in('id', memberIds)

    if (memberCheckError) {
      return NextResponse.json({ success: false, error: memberCheckError.message }, { status: 500 })
    }

    if ((existingMembers || []).length !== memberIds.length) {
      return NextResponse.json({ success: false, error: 'One or more selected members were not found' }, { status: 400 })
    }

    let finalTemplateId = templateId || null
    let templateName = taskName
    let templateDescription = taskDescription

    if (finalTemplateId) {
      const { data: existingTemplate, error: templateError } = await supabase
        .from('task_templates')
        .select('id, name, description')
        .eq('id', finalTemplateId)
        .single()

      if (templateError || !existingTemplate) {
        return NextResponse.json({ success: false, error: 'Task template not found' }, { status: 404 })
      }

      templateName = existingTemplate.name
      templateDescription = existingTemplate.description || ''
    } else {
      const { data: existingTemplate } = await supabase
        .from('task_templates')
        .select('id, name, description')
        .eq('name', taskName)
        .eq('description', taskDescription)
        .maybeSingle()

      if (existingTemplate?.id) {
        finalTemplateId = existingTemplate.id
      } else {
        const { data: createdTemplate, error: createTemplateError } = await supabase
          .from('task_templates')
          .insert({
            name: taskName,
            description: taskDescription,
          })
          .select('id, name, description')
          .single()

        if (createTemplateError || !createdTemplate) {
          return NextResponse.json(
            { success: false, error: createTemplateError?.message || 'Failed to create task template' },
            { status: 500 }
          )
        }

        finalTemplateId = createdTemplate.id
      }
    }

    const { data: createdLog, error: logError } = await supabase
      .from('task_logs')
      .insert({
        task_template_id: finalTemplateId,
        task_name: templateName,
        task_description: templateDescription,
        points,
      })
      .select('id, task_template_id, task_name, task_description, points')
      .single()

    if (logError || !createdLog) {
      return NextResponse.json(
        { success: false, error: logError?.message || 'Failed to create task log' },
        { status: 500 }
      )
    }

    const memberRows = memberIds.map((memberId: string) => ({
      task_log_id: createdLog.id,
      member_id: memberId,
      points,
    }))

    const { error: memberInsertError } = await supabase
      .from('task_log_members')
      .insert(memberRows)

    if (memberInsertError) {
      return NextResponse.json(
        { success: false, error: memberInsertError.message },
        { status: 500 }
      )
    }

    const { data: assignedMembers } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, role')
      .in('id', memberIds)

    return NextResponse.json({
      success: true,
      task_log: {
        ...createdLog,
        members: assignedMembers || [],
      },
    })
  } catch (error) {
    console.error('Error creating activity task:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
