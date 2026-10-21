/** Client helper for POST /api/upload/image (resized and stored server-side). */
export interface UploadedImage {
  id: string
  public_url: string
  width?: number
  height?: number
}

const ALLOWED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
const MAX_BYTES = 5 * 1024 * 1024

export function checkImage(file: File): string | null {
  if (!ALLOWED.includes(file.type)) return 'Use a JPG, PNG, WebP or GIF image.'
  if (file.size > MAX_BYTES) return 'Images must be under 5 MB.'
  return null
}

export async function uploadImage(
  file: File,
  usage: 'avatar' | 'project_thumbnail' | 'news_image' | 'general' | 'certificate',
  token: string
): Promise<UploadedImage> {
  const problem = checkImage(file)
  if (problem) throw new Error(problem)
  const body = new FormData()
  body.append('file', file)
  body.append('usage', usage)
  const res = await fetch('/api/upload/image', { method: 'POST', body, headers: { Authorization: `Bearer ${token}` } })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error || 'Upload failed')
  return json as UploadedImage
}

/** POST /api/upload/pdf (certificates bucket). */
export async function uploadPdf(file: File, token: string): Promise<UploadedImage> {
  if (file.type !== 'application/pdf') throw new Error('Use a PDF file.')
  const body = new FormData()
  body.append('file', file)
  const res = await fetch('/api/upload/pdf', { method: 'POST', body, headers: { Authorization: `Bearer ${token}` } })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error || 'Upload failed')
  return json as UploadedImage
}
