export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      projects: {
        Row: Project
        Insert: Omit<Project, 'id' | 'created_at'>
        Update: Partial<Omit<Project, 'id' | 'created_at'>>
      }
      project_contributors: {
        Row: ProjectContributor
        Insert: Omit<ProjectContributor, 'id' | 'created_at'>
        Update: Partial<Omit<ProjectContributor, 'id' | 'created_at'>>
      }
    }
  }
}

export interface Profile {
  id: string
  username: string
  full_name: string
  avatar_url: string | null
  bio: string | null
  skills: string[] | null
  role: 'admin' | 'member'
  social_links: SocialLinks | null
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  title: string
  description: string | null
  details: string | null
  thumbnail_url: string | null
  thumbnail_image_id: string | null
  video_url: string | null
  repo_url: string | null
  demo_url: string | null
  tech_stack: string[] | null
  status: 'active' | 'archived'
  featured: boolean
  created_by: string | null
  created_at: string
}

export interface ProjectContributor {
  id: string
  project_id: string
  user_id: string
  contribution_percentage: number
  role_in_project: string | null
  created_at: string
  description: string
}

export interface SocialLinks {
  github?: string
  linkedin?: string
  twitter?: string
  facebook?: string
  website?: string
}

// Extended types with joined data
export interface ProjectWithContributors extends Project {
  contributors: (ProjectContributor & {
    profile: Profile
  })[]
  created_by_profile?: Profile
}

export interface ProfileWithProjects extends Profile {
  email?: string | null
  contributed_projects: (ProjectContributor & {
    project: Project
  })[]
}

// =====================================================
// POST TYPES
// =====================================================

export interface Post {
  id: string
  slug: string
  title: string
  title_vi: string
  summary: string
  summary_vi: string
  thumbnail_image_id: string | null
  category: 'News' | 'You may want to know' | 'Member Spotlight' | 'Community Activities'
  author_id: string
  status: 'draft' | 'published' | 'archived'
  related_post_id_1: string | null
  related_post_id_2: string | null
  reading_time: number
  view_count: number
  upvote_count: number
  featured: boolean
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface PostBlock {
  id: string
  post_id: string
  type: 'text' | 'quote' | 'image' | 'youtube'
  order_index: number
  content: TextBlockContent | QuoteBlockContent | ImageBlockContent | YouTubeBlockContent
  created_at: string
  updated_at: string
}

export interface PostUpvote {
  id: string
  post_id: string
  user_id: string
  created_at: string
}

// Block content types
export interface TextBlockContent {
  html: string
  html_vi: string
  word_count: number
  word_count_vi: number
}

export interface QuoteBlockContent {
  quote: string
  author?: string
  source?: string
}

export interface ImageBlockContent {
  image_id: string
  caption?: string
  alt_text?: string
}

export interface YouTubeBlockContent {
  youtube_url: string
  video_id: string
  title?: string
  thumbnail?: string
}

// Extended types with joined data
export interface PostWithAuthor extends Post {
  author: Profile
  thumbnail_image?: {
    id: string
    filename: string
    public_url: string
    width: number
    height: number
    alt_text: string | null
  }
}

export interface PostWithBlocks extends PostWithAuthor {
  blocks: PostBlock[]
  related_posts?: Post[]
  user_has_upvoted?: boolean
}

export interface PostWithRelations extends PostWithAuthor {
  related_post_1?: Post | null
  related_post_2?: Post | null
}