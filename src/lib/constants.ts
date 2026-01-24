export const SITE_CONFIG = {
  name: 'The Noders PTNK',
  shortName: 'The Noders',
  description: 'A technology club at VNUHCM High School for the Gifted, building practical AI solutions, organizing workshops, and connecting young developers in PTNK.',
  tagline: 'Connecting Minds, Creating Intelligence',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.thenodersptnk.com',
  keywords: [
    'The Noders',
    'PTNK',
    'VNUHCM High School for the Gifted',
    'technology club',
    'AI innovation',
    'student developers',
    'coding workshops',
    'tech community',
    'Vietnam tech students',
    'high school programming',
    'AI projects',
    'web development',
    'mobile development',
    'machine learning',
    'student projects'
  ],
  author: 'The Noders PTNK',
  twitterHandle: '@thenoders_ptnk',
  ogImage: 'https://qaiziusbqefdgnebbocm.supabase.co/storage/v1/object/public/images/e72a4551-46a2-40c3-a9b9-ac91540e5003/1759994134563-v9qulq24k8.png',
  locale: 'en_US',
  type: 'website',
}

export const NAVIGATION_ITEMS = [
  { name: 'Contest', href: '/contest' },
  { name: 'Education', href: '/education' },
  { name: 'Projects', href: '/projects' },
  { name: 'Posts', href: '/posts' },
  {
    name: 'About',
    href: '#',
    children: [
      { name: 'Members', href: '/members' },
      { name: 'Verify Certificate', href: '/verify' },
      { name: 'Contact', href: '/contact' },
    ]
  },
]

export const SOCIAL_LINKS = {
  email: 'phuckhangtdn@gmail.com',
  facebook: 'https://facebook.com', // Will be updated with real link
}

export const USER_ROLES = {
  ADMIN: 'admin',
  MEMBER: 'member',
} as const

export const PROJECT_STATUS = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
} as const

export const POST_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const

export const POST_CATEGORIES = [
  'News',
  'You may want to know',
  'Member Spotlight',
  'Community Activities',
] as const

export const BLOCK_TYPES = {
  TEXT: 'text',
  QUOTE: 'quote',
  IMAGE: 'image',
  YOUTUBE: 'youtube',
} as const

export const POST_CONSTRAINTS = {
  MAX_TITLE_LENGTH: 100,
  MAX_SUMMARY_LENGTH: 300,
  MAX_TEXT_WORDS: 800,
  MAX_IMAGE_BLOCKS: 5,
  MAX_RELATED_POSTS: 2,
  MIN_BLOCKS: 1,
  MAX_BLOCKS: 15,
  NO_CONSECUTIVE_TEXT: true,
} as const

export const TECH_STACK_COLORS = {
  'React': '#61DAFB',
  'Next.js': '#000000',
  'TypeScript': '#3178C6',
  'JavaScript': '#F7DF1E',
  'Python': '#3776AB',
  'Node.js': '#339933',
  'Express': '#000000',
  'FastAPI': '#009688',
  'PostgreSQL': '#336791',
  'MongoDB': '#47A248',
  'Supabase': '#3ECF8E',
  'Tailwind CSS': '#06B6D4',
  'Prisma': '#2D3748',
  'Docker': '#2496ED',
  'AWS': '#FF9900',
  'Vercel': '#FFFFFF',
  'Vue.js': '#4FC08D',
  'Angular': '#DD0031',
  'Svelte': '#FF3E00',
  'Flutter': '#02569B',
  'React Native': '#61DAFB',
} as Record<string, string>

export const DEFAULT_AVATAR_COLORS = [
  '#2563EB', // Blue
  '#059669', // Green
  '#D97706', // Orange
  '#DC2626', // Red
  '#7C3AED', // Purple
  '#0891B2', // Cyan
  '#EA580C', // Orange-600
  '#BE123C', // Rose
]

export const SKILLS_CATEGORIES = {
  'Frontend': ['React', 'Next.js', 'Vue.js', 'Angular', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Tailwind CSS'],
  'Backend': ['Node.js', 'Python', 'Express', 'FastAPI', 'Django', 'Flask', 'PostgreSQL', 'MongoDB'],
  'Mobile': ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Ionic'],
  'DevOps': ['Docker', 'AWS', 'Google Cloud', 'Azure', 'Kubernetes', 'CI/CD'],
  'AI/ML': ['TensorFlow', 'PyTorch', 'Scikit-learn', 'OpenAI', 'Hugging Face', 'Computer Vision'],
  'Design': ['Figma', 'Adobe XD', 'Sketch', 'Photoshop', 'Illustrator'],
  'Others': ['Git', 'REST API', 'GraphQL', 'Testing', 'Agile', 'Scrum']
}

export const CONTRIBUTION_ROLES = [
  'Project Lead',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'UI/UX Designer',
  'DevOps Engineer',
  'Data Scientist',
  'AI/ML Engineer',
  'Mobile Developer',
  'QA Engineer',
  'Technical Writer',
  'Mentor',
  'Contributor'
]

export const FILTER_OPTIONS = {
  PROJECT_STATUS: [
    { label: 'All Projects', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Archived', value: 'archived' },
  ],
  MEMBER_ROLES: [
    { label: 'All Members', value: 'all' },
    { label: 'Admins', value: 'admin' },
    { label: 'Members', value: 'member' },
  ],
  SORT_OPTIONS: [
    { label: 'Newest First', value: 'created_at_desc' },
    { label: 'Oldest First', value: 'created_at_asc' },
    { label: 'Name A-Z', value: 'title_asc' },
    { label: 'Name Z-A', value: 'title_desc' },
  ]
}