import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase'
import sharp from 'sharp'

interface ImageProcessConfig {
  maxWidth: number
  maxHeight: number
  quality: number
}

const USAGE_CONFIGS: Record<string, ImageProcessConfig> = {
  avatar: { maxWidth: 400, maxHeight: 400, quality: 90 },
  project_thumbnail: { maxWidth: 1200, maxHeight: 800, quality: 95 },
  news_image: { maxWidth: 1600, maxHeight: 1200, quality: 95 },
  general: { maxWidth: 1920, maxHeight: 1080, quality: 90 }
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']

export async function POST(request: NextRequest) {
  try {
    // Check authentication (same pattern as other APIs)
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized: No auth token provided' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')

    // Create regular client for auth verification
    const authClient = createClient()

    // Verify user with the provided token
    const { data: { user }, error: authError } = await authClient.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid token' },
        { status: 401 }
      )
    }

    // Use admin client for storage and database operations to bypass RLS
    const supabase = createAdminClient()

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const usage = (formData.get('usage') as string) || 'general'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({
        error: `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`
      }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({
        error: 'Invalid file type. Please upload JPEG, PNG, WebP, or GIF images'
      }, { status: 400 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const filename = `${timestamp}-${randomString}.${extension}`
    const filePath = `${user.id}/${filename}`

    // Process image with Sharp
    const config = USAGE_CONFIGS[usage] || USAGE_CONFIGS.general
    const fileBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(fileBuffer)

    let processedBuffer: Buffer
    let metadata: { width?: number; height?: number }

    try {
      const sharpInstance = sharp(buffer)
      metadata = await sharpInstance.metadata()

      // Process based on file type and config
      if (file.type === 'image/gif') {
        // Keep GIFs as-is but limit size
        processedBuffer = buffer
      } else {
        processedBuffer = await sharpInstance
          .resize(config.maxWidth, config.maxHeight, {
            fit: 'inside',
            withoutEnlargement: true,
            kernel: sharp.kernel.lanczos3 // Better quality resizing
          })
          .jpeg({
            quality: config.quality,
            progressive: true,
            mozjpeg: true // Better compression
          })
          .toBuffer()
      }
    } catch (sharpError) {
      console.error('Image processing error:', sharpError)
      return NextResponse.json({ error: 'Failed to process image' }, { status: 500 })
    }

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, processedBuffer, {
        contentType: file.type === 'image/gif' ? 'image/gif' : 'image/jpeg',
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(filePath)

    if (!urlData.publicUrl) {
      return NextResponse.json({ error: 'Failed to get image URL' }, { status: 500 })
    }

    // Save image metadata to database
    const { data: imageData, error: dbError } = await supabase
      .from('images')
      .insert({
        filename,
        original_name: file.name,
        file_size: processedBuffer.length,
        mime_type: file.type === 'image/gif' ? 'image/gif' : 'image/jpeg',
        width: metadata.width,
        height: metadata.height,
        file_path: filePath,
        public_url: urlData.publicUrl,
        uploaded_by: user.id,
        usage_type: usage
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      // Try to cleanup uploaded file
      await supabase.storage.from('images').remove([filePath])
      return NextResponse.json({ error: 'Failed to save image metadata' }, { status: 500 })
    }

    return NextResponse.json({
      id: imageData.id,
      filename: imageData.filename,
      original_name: imageData.original_name,
      public_url: imageData.public_url,
      file_size: imageData.file_size,
      width: imageData.width,
      height: imageData.height,
      usage_type: imageData.usage_type,
      created_at: imageData.created_at
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication (same pattern as other APIs)
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized: No auth token provided' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const authClient = createClient()

    // Verify user (same as other APIs)
    const { data: { user }, error: authError } = await authClient.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid token' },
        { status: 401 }
      )
    }

    // Use admin client for database and storage operations
    const supabase = createAdminClient()

    const { searchParams } = new URL(request.url)
    const imageId = searchParams.get('id')

    if (!imageId) {
      return NextResponse.json({ error: 'Image ID required' }, { status: 400 })
    }

    // Get image details
    const { data: imageData, error: fetchError } = await supabase
      .from('images')
      .select('*')
      .eq('id', imageId)
      .eq('uploaded_by', user.id) // Ensure user owns the image
      .single()

    if (fetchError || !imageData) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('images')
      .remove([imageData.file_path])

    if (storageError) {
      console.error('Storage deletion error:', storageError)
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('images')
      .delete()
      .eq('id', imageId)
      .eq('uploaded_by', user.id)

    if (dbError) {
      console.error('Database deletion error:', dbError)
      return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}