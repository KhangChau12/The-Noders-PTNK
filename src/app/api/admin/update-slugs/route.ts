import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

// POST /api/admin/update-slugs - Regenerate slugs for all posts from their English title
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const supabase = createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    await supabase.auth.setSession({
      access_token: token,
      refresh_token: token
    })

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 })
    }

    // Fetch all posts that have a title
    const { data: posts, error: fetchError } = await supabase
      .from('posts')
      .select('id, title, slug')
      .not('title', 'is', null)
      .order('created_at', { ascending: true })

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    if (!posts || posts.length === 0) {
      return NextResponse.json({ message: 'No posts to update', updated: 0 })
    }

    const results: { id: string; oldSlug: string; newSlug: string }[] = []
    const errors: { id: string; error: string }[] = []
    const usedSlugs = new Set<string>()

    for (const post of posts) {
      if (!post.title || post.title.trim() === '') continue

      let newSlug = post.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')

      // Handle duplicates within this batch
      if (usedSlugs.has(newSlug)) {
        let counter = 2
        while (usedSlugs.has(`${newSlug}-${counter}`)) {
          counter++
        }
        newSlug = `${newSlug}-${counter}`
      }

      usedSlugs.add(newSlug)

      // Skip if slug is already correct
      if (post.slug === newSlug) continue

      const { error: updateError } = await supabase
        .from('posts')
        .update({ slug: newSlug })
        .eq('id', post.id)

      if (updateError) {
        errors.push({ id: post.id, error: updateError.message })
      } else {
        results.push({ id: post.id, oldSlug: post.slug, newSlug })
      }
    }

    return NextResponse.json({
      message: `Updated ${results.length} slugs`,
      updated: results.length,
      skipped: posts.length - results.length - errors.length,
      errors: errors.length,
      details: results,
      errorDetails: errors,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
