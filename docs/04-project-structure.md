# Balanced Project Structure - AI Agent Club Website

## Optimized for Claude Code + Team Development

```
ai-agent-club/
├── README.md
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── .env.local
├── .env.example
│
├── public/
│   ├── favicon.ico
│   ├── logo.png
│   └── images/
│       ├── placeholder-project.jpg
│       └── placeholder-avatar.jpg
│
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── globals.css
│   │   ├── layout.tsx                # Root layout with AuthProvider
│   │   ├── page.tsx                  # Homepage
│   │   ├── loading.tsx
│   │   ├── not-found.tsx
│   │   │
│   │   ├── login/
│   │   │   └── page.tsx              # Login page
│   │   │
│   │   ├── projects/
│   │   │   ├── page.tsx              # Project library
│   │   │   └── [id]/
│   │   │       └── page.tsx          # Project detail
│   │   │
│   │   ├── members/
│   │   │   ├── page.tsx              # Member list (public)
│   │   │   └── [username]/
│   │   │       └── page.tsx          # Member profile (public)
│   │   │
│   │   ├── dashboard/
│   │   │   ├── layout.tsx            # Protected layout
│   │   │   ├── page.tsx              # Member dashboard
│   │   │   └── profile/
│   │   │       └── page.tsx          # Edit own profile
│   │   │
│   │   └── admin/
│   │       ├── layout.tsx            # Admin layout
│   │       ├── page.tsx              # Admin dashboard
│   │       ├── members/
│   │       │   └── page.tsx          # Manage members
│   │       └── projects/
│   │           └── page.tsx          # Manage projects
│   │
│   ├── components/                   # All components (flattened)
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Navigation.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Loading.tsx
│   │   ├── Badge.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── AuthProvider.tsx
│   │   ├── LoginForm.tsx
│   │   ├── ProjectCard.tsx
│   │   ├── ProjectGrid.tsx
│   │   ├── ProjectDetail.tsx
│   │   ├── VideoPlayer.tsx
│   │   ├── ContributionChart.tsx
│   │   ├── TechStackBadges.tsx
│   │   ├── MemberCard.tsx
│   │   ├── MemberGrid.tsx
│   │   ├── MemberProfile.tsx
│   │   ├── SkillsDisplay.tsx
│   │   ├── SocialLinks.tsx
│   │   ├── MemberTable.tsx
│   │   ├── ProjectTable.tsx
│   │   ├── CreateMemberForm.tsx
│   │   ├── CreateProjectForm.tsx
│   │   └── StatsCards.tsx
│   │
│   ├── lib/                          # Utilities & configurations
│   │   ├── supabase.ts               # Supabase client config
│   │   ├── auth.ts                   # Auth utilities
│   │   ├── utils.ts                  # General utilities
│   │   ├── constants.ts              # App constants
│   │   ├── validations.ts            # Form schemas
│   │   ├── hooks.ts                  # Custom hooks
│   │   └── queries.ts                # Supabase queries
│   │
│   └── types/                        # TypeScript definitions
│       ├── auth.ts
│       ├── project.ts
│       ├── member.ts
│       └── database.ts
│
├── supabase/                         # Database schema
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_rls_policies.sql
│   │   └── 003_sample_data.sql
│   │
│   └── config.toml
│
└── docs/                             # Keep our planning docs
    ├── detailed_idea.md
    ├── auth_system_design.md
    ├── design_guidelines.md
    └── project_structure.md
```

## Key Simplifications

### 1. **Flattened Components Directory**
```typescript
// Before: src/components/project/ProjectCard.tsx
// After:  src/components/ProjectCard.tsx

// Import paths become shorter:
import { ProjectCard } from '@/components/ProjectCard'
import { MemberCard } from '@/components/MemberCard'
import { Button } from '@/components/Button'
```

### 2. **Consolidated Lib Directory**
```typescript
// All utilities in one place
// src/lib/hooks.ts
export function useAuth() { /* ... */ }
export function useProjects() { /* ... */ }
export function useMembers() { /* ... */ }

// src/lib/queries.ts
export const projectQueries = { /* ... */ }
export const memberQueries = { /* ... */ }

// src/lib/utils.ts
export function cn() { /* ... */ }
export function formatDate() { /* ... */ }
```

### 3. **Simplified Types Structure**
```typescript
// src/types/database.ts - All DB types
export interface Project { /* ... */ }
export interface Member { /* ... */ }
export interface ProjectContributor { /* ... */ }

// src/types/auth.ts - Auth types
export interface User { /* ... */ }
export interface Session { /* ... */ }
```

## Claude Code Optimization Benefits

### 🚀 **Faster File Discovery**
```bash
# Easy to find components
src/components/ProjectCard.tsx     # vs src/components/project/ProjectCard.tsx
src/components/MemberTable.tsx     # vs src/components/admin/MemberTable.tsx

# Simple imports
import { ProjectCard } from '@/components/ProjectCard'
# vs
import { ProjectCard } from '@/components/project/ProjectCard'
```

### 🎯 **Reduced Context Switching**
- Fewer folders to navigate
- Related files closer together
- Less mental overhead

### 🔧 **Better Tool Performance**
- Glob patterns simpler: `src/components/*.tsx`
- Grep searches faster with fewer nested directories
- MultiEdit operations more predictable

## File Naming Conventions

### **Components** (PascalCase)
- `ProjectCard.tsx` - Project card component
- `MemberTable.tsx` - Admin member table
- `CreateProjectForm.tsx` - Project creation form

### **Pages** (lowercase)
- `page.tsx` - Next.js page component
- `layout.tsx` - Next.js layout component
- `loading.tsx` - Loading UI

### **Utilities** (camelCase)
- `supabase.ts` - Database client
- `hooks.ts` - Custom React hooks
- `utils.ts` - Helper functions

### **Types** (camelCase)
- `project.ts` - Project-related types
- `auth.ts` - Authentication types

## Development Workflow

### **Quick Navigation**
```bash
# Find all components
ls src/components/

# Find specific component
find src/components -name "*Project*"

# Search for function usage
grep -r "useAuth" src/
```

### **File Creation Pattern**
```typescript
// 1. Create component in src/components/
export function NewComponent() { }

// 2. Add types in src/types/
export interface NewComponentProps { }

// 3. Add utilities in src/lib/
export function newHelper() { }

// 4. Use in pages src/app/
import { NewComponent } from '@/components/NewComponent'
```

## Scalability Strategy

### **When to Refactor**
- **30+ components** → Group by domain (`components/project/`, `components/admin/`)
- **10+ hooks** → Separate into `hooks/` directory
- **Team grows** → More granular organization

### **Easy Migration Path**
```bash
# Current structure allows easy reorganization
src/components/ProjectCard.tsx     → src/components/project/ProjectCard.tsx
src/components/MemberCard.tsx      → src/components/member/MemberCard.tsx
src/components/Button.tsx          → src/components/ui/Button.tsx
```

## Total Files: ~50 files
**Much more manageable than 100+ files in deeply nested structure!**

## Development Setup

### Local Development
```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Test production build locally
npm run start        # Run production build locally
```

### Database Setup
**Copy-paste SQL commands directly into Supabase SQL Editor:**
- Database schema (tables, RLS policies)
- Sample data for testing
- Any schema updates during development

### Pre-deployment Testing
Always test `npm run build && npm run start` locally before deploying to Vercel.

## Essential Dependencies

### package.json dependencies:
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@supabase/supabase-js": "^2.38.0",
    "@supabase/auth-ui-react": "^0.4.0",
    "lucide-react": "^0.294.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "autoprefixer": "^10.0.1",
    "postcss": "^8.0.0",
    "tailwindcss": "^3.3.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.0.0"
  }
}
```

This structure is **optimal for Claude Code performance** while maintaining good organization and scalability.