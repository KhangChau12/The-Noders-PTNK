# Hệ thống Đăng nhập & Quản trị - Supabase

## Tổng quan
Hệ thống authentication đơn giản sử dụng Supabase Auth với role-based access control cho website câu lạc bộ AI Agent.

## Database Schema (Supabase)

### 1. Users Table (Supabase Auth tích hợp sẵn)
```sql
-- Supabase tự động tạo auth.users
-- Chỉ cần extend với public.profiles
```

### 2. Profiles Table
```sql
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users(id) PRIMARY KEY,
  username text UNIQUE,
  full_name text,
  avatar_url text,
  bio text,
  skills text[], -- Array of skills
  role text DEFAULT 'member', -- 'admin', 'member'
  social_links jsonb, -- {github, linkedin, twitter}
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
```

### 3. Projects Table
```sql
CREATE TABLE public.projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  thumbnail_url text,
  video_url text,
  repo_url text,
  tech_stack text[],
  status text DEFAULT 'active', -- 'active', 'archived'
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now()
);
```

### 4. Project Contributors Table
```sql
CREATE TABLE public.project_contributors (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  contribution_percentage integer DEFAULT 0,
  role_in_project text, -- 'lead', 'frontend', 'backend', etc.
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(project_id, user_id)
);
```

## Authentication Flow

### 1. Admin-Only Registration System
```javascript
// Tắt public registration - chỉ admin tạo tài khoản
// Trong Supabase Dashboard: Authentication > Settings > Disable "Enable email confirmations"
// và set "Site URL" restrictions

// Admin creates accounts (server-side function hoặc admin dashboard)
const createMemberAccount = async (adminUser, memberData) => {
  // Verify admin permission
  const isAdmin = await checkAdminRole(adminUser.id)
  if (!isAdmin) throw new Error('Unauthorized')

  // Create auth user
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: memberData.email,
    password: generateTempPassword(), // Auto-generated temp password
    email_confirm: true // Skip email confirmation
  })

  if (!error) {
    // Create profile
    await supabase.from('profiles').insert({
      id: data.user.id,
      username: memberData.username,
      full_name: memberData.full_name,
      role: 'member'
    })

    // Send welcome email with login instructions
    await sendWelcomeEmail(memberData.email, tempPassword)
  }
}

// Regular sign in (available to everyone with accounts)
const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
}
```

### 2. Role-based Access Control

#### Row Level Security (RLS) Policies
```sql
-- Profiles: Users can read all, update own
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
ON public.profiles FOR SELECT
USING (true);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- Projects: Everyone can read, only admins can create/update
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Projects are viewable by everyone"
ON public.projects FOR SELECT
USING (true);

CREATE POLICY "Only admins can manage projects"
ON public.projects FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
```

## Admin Dashboard Features

### 1. Quản lý thành viên
- **Tạo tài khoản mới**: Form thêm thành viên với email, tên, username
- **Xem danh sách tất cả thành viên**: Bảng hiển thị info, role, status
- **Cấp/thu hồi quyền admin**: Toggle role giữa admin/member
- **Xóa tài khoản**: Remove member khỏi hệ thống
- **Reset password**: Generate mật khẩu tạm thời mới

### 2. Quản lý dự án
- Thêm/sửa/xóa dự án
- Phân công thành viên cho dự án
- Cập nhật contribution percentage
- Upload thumbnail, video demo

### 3. Dashboard Analytics
- Số lượng thành viên
- Số dự án hoàn thành
- Top contributors
- Hoạt động gần đây

## Frontend Implementation

### 1. Public vs Protected Routes
```jsx
// App.jsx - Main routing logic
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* PUBLIC ROUTES - Không cần đăng nhập */}
          <Route path="/" element={<HomePage />} />
          <Route path="/projects" element={<ProjectLibrary />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/members" element={<MemberProfiles />} />

          {/* AUTH ROUTES */}
          <Route path="/login" element={<LoginPage />} />

          {/* PROTECTED ROUTES - Cần đăng nhập */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/profile/edit" element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          } />

          {/* ADMIN ONLY ROUTES */}
          <Route path="/admin/*" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  )
}
```

### 2. Auth Context
```jsx
// AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          fetchProfile(session.user.id)
        } else {
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    setProfile(data)
    setLoading(false)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
```

### 3. Protected Routes Component
```jsx
// ProtectedRoute.jsx
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, profile, loading } = useAuth()

  if (loading) return <div>Loading...</div>
  if (!user) return <Navigate to="/login" />
  if (adminOnly && profile?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to view this page.</p>
      </div>
    )
  }

  return children
}

export default ProtectedRoute
```

### 4. No Registration Page
```jsx
// Không có SignUp component - chỉ có Login
// LoginPage.jsx
const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      setError('Invalid credentials')
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleLogin} className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Member Login</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Login</button>

        {error && <p className="text-red-500">{error}</p>}

        <p className="text-sm text-gray-600 mt-4">
          Don't have an account? Contact an admin to get access.
        </p>
      </form>
    </div>
  )
}
```

## Deployment Strategy

### 1. Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 2. Supabase Setup
1. Tạo project trên Supabase
2. Chạy migrations tạo tables
3. Enable RLS và setup policies
4. Configure email templates
5. Setup storage buckets cho images/videos

### 3. Complete Database Setup (Copy-paste to Supabase SQL Editor)
```sql
-- 1. Create tables
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users(id) PRIMARY KEY,
  username text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  bio text,
  skills text[],
  role text DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  social_links jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  thumbnail_url text,
  video_type text DEFAULT 'youtube' CHECK (video_type IN ('youtube', 'vimeo', 'direct')),
  video_id_or_url text,
  repo_url text,
  tech_stack text[],
  status text DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.project_contributors (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  contribution_percentage integer DEFAULT 0 CHECK (contribution_percentage >= 0 AND contribution_percentage <= 100),
  role_in_project text,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(project_id, user_id)
);

-- 2. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_contributors ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
CREATE POLICY "Profiles viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Projects viewable by everyone" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Only admins can manage projects" ON public.projects FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Contributors viewable by everyone" ON public.project_contributors FOR SELECT USING (true);
CREATE POLICY "Only admins can manage contributors" ON public.project_contributors FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- 4. Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
```

### 4. Create First Admin User
After creating your auth account, run:
```sql
-- Replace 'your-user-uuid' with actual UUID from auth.users
INSERT INTO public.profiles (id, username, full_name, role)
VALUES (
  'your-user-uuid',
  'admin',
  'Admin Name',
  'admin'
);
```

## Security Features

### 1. Email Verification
- Bắt buộc verify email khi đăng ký
- Reset password qua email

### 2. Rate Limiting
- Supabase tự động handle
- Có thể config thêm edge functions

### 3. Data Validation
- Client-side: React Hook Form + Zod
- Server-side: Supabase functions validation

## Tech Stack Summary
- **Auth**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Frontend**: React/Next.js
- **State**: React Context/Zustand
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod
- **Deployment**: Vercel + Supabase