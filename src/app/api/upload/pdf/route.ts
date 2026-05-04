import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized: No auth token provided' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const authClient = createClient()

    const { data: { user }, error: authError } = await authClient.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid token' },
        { status: 401 }
      )
    }

    const supabase = createAdminClient()

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a PDF file' },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
        { status: 400 }
      )
    }

    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const filename = `${timestamp}-${randomString}.pdf`
    const filePath = `${user.id}/${filename}`

    const fileBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(fileBuffer)

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, buffer, {
        contentType: 'application/pdf',
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload PDF' }, { status: 500 })
    }

    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(filePath)

    if (!urlData.publicUrl) {
      return NextResponse.json({ error: 'Failed to get PDF URL' }, { status: 500 })
    }

    const { data: imageData, error: dbError } = await supabase
      .from('images')
      .insert({
        filename,
        original_name: file.name,
        file_size: buffer.length,
        mime_type: 'application/pdf',
        width: null,
        height: null,
        file_path: filePath,
        public_url: urlData.publicUrl,
        uploaded_by: user.id,
        usage_type: 'certificate'
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      await supabase.storage.from('images').remove([filePath])
      return NextResponse.json({ error: 'Failed to save PDF metadata' }, { status: 500 })
    }

    return NextResponse.json({
      id: imageData.id,
      filename: imageData.filename,
      original_name: imageData.original_name,
      public_url: imageData.public_url,
      file_size: imageData.file_size,
      usage_type: imageData.usage_type,
      created_at: imageData.created_at
    })

  } catch (error) {
    console.error('PDF upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
