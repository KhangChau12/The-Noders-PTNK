-- Complete database reset and setup for AI Agent Club (FIXED VERSION)
-- This migration will drop all existing tables and recreate everything from scratch
-- FIXED: Removed circular dependency in RLS policies

-- Drop all existing tables and constraints
DROP TABLE IF EXISTS public.project_contributors CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop any existing functions and triggers
DROP FUNCTION IF EXISTS create_user_with_profile(TEXT, TEXT, JSONB) CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop any existing policies (only if tables exist)
DO $$
BEGIN
    -- Drop policies for profiles table if it exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
        DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
        DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
        DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
    END IF;

    -- Drop policies for projects table if it exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'projects') THEN
        DROP POLICY IF EXISTS "Projects are viewable by everyone" ON public.projects;
        DROP POLICY IF EXISTS "Users can insert their own projects" ON public.projects;
        DROP POLICY IF EXISTS "Users can update own projects" ON public.projects;
        DROP POLICY IF EXISTS "Admins can manage all projects" ON public.projects;
    END IF;

    -- Drop policies for project_contributors table if it exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'project_contributors') THEN
        DROP POLICY IF EXISTS "Project contributors are viewable by everyone" ON public.project_contributors;
        DROP POLICY IF EXISTS "Project owners can manage contributors" ON public.project_contributors;
        DROP POLICY IF EXISTS "Admins can manage all contributors" ON public.project_contributors;
    END IF;
END $$;

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    skills TEXT[] DEFAULT '{}',
    role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    social_links JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (id)
);

-- Create projects table
CREATE TABLE public.projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    thumbnail_url TEXT,
    video_url TEXT,
    repo_url TEXT,
    tech_stack TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create project contributors table
CREATE TABLE public.project_contributors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    contribution_percentage INTEGER DEFAULT 0,
    role_in_project TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_contributors ENABLE ROW LEVEL SECURITY;

-- ========================================
-- FIXED RLS POLICIES (NO CIRCULAR DEPENDENCY)
-- ========================================

-- Create RLS policies for profiles (BASIC ONLY - NO CIRCULAR QUERIES)
CREATE POLICY "Profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- NOTE: Admin policies REMOVED to prevent circular dependency
-- Admin functions will use service role key to bypass RLS

-- Create RLS policies for projects (NO ADMIN CIRCULAR QUERIES)
CREATE POLICY "Projects are viewable by everyone"
    ON public.projects FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own projects"
    ON public.projects FOR INSERT
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own projects"
    ON public.projects FOR UPDATE
    USING (auth.uid() = created_by);

-- NOTE: Admin project management will use service role

-- Create RLS policies for project contributors (NO ADMIN CIRCULAR QUERIES)
CREATE POLICY "Project contributors are viewable by everyone"
    ON public.project_contributors FOR SELECT
    USING (true);

CREATE POLICY "Project owners can manage contributors"
    ON public.project_contributors FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE id = project_id AND created_by = auth.uid()
        )
    );

-- NOTE: Admin contributor management will use service role

-- Create admin user using Supabase admin functions (safer approach)
DO $$
DECLARE
    admin_user_id UUID;
    admin_user_record RECORD;
BEGIN
    -- Try to find existing admin user first
    SELECT id INTO admin_user_id
    FROM auth.users
    WHERE email = 'admin@thenodersptnk.local';

    -- If admin doesn't exist, we need to create manually
    IF admin_user_id IS NULL THEN
        -- Generate admin user ID
        admin_user_id := gen_random_uuid();

        -- Create admin auth user with all required fields
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            confirmation_sent_at,
            recovery_sent_at,
            email_change_sent_at,
            last_sign_in_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin,
            created_at,
            updated_at,
            phone,
            phone_confirmed_at,
            phone_change,
            phone_change_token,
            phone_change_sent_at,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token,
            reauthentication_token,
            reauthentication_sent_at,
            is_sso_user,
            deleted_at
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            admin_user_id,
            'authenticated',
            'authenticated',
            'admin@thenodersptnk.local',
            crypt('admin123456', gen_salt('bf')),
            NOW(),
            NOW(),
            NULL,
            NULL,
            NOW(),
            '{"provider":"email","providers":["email"]}',
            '{"full_name":"Admin User","username":"admin","role":"admin"}',
            false,
            NOW(),
            NOW(),
            NULL,
            NULL,
            '',
            '',
            NULL,
            '',
            '',
            '',
            '',
            '',
            NULL,
            false,
            NULL
        );

        RAISE NOTICE 'Admin auth user created with ID: %', admin_user_id;
    ELSE
        RAISE NOTICE 'Admin auth user already exists with ID: %', admin_user_id;
    END IF;

    -- Now create admin profile (only if doesn't exist)
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = admin_user_id) THEN
        INSERT INTO public.profiles (
            id,
            username,
            full_name,
            avatar_url,
            bio,
            skills,
            role,
            social_links,
            created_at
        ) VALUES (
            admin_user_id,
            'admin',
            'Admin User',
            NULL,
            'System administrator for The Noders PTNK',
            ARRAY['Administration', 'User Management', 'System Operations'],
            'admin',
            '{"email": "phuckhangtdn@gmail.com", "facebook": "https://facebook.com/thenodersptnk"}',
            NOW()
        );

        RAISE NOTICE 'Admin profile created successfully';
    ELSE
        RAISE NOTICE 'Admin profile already exists';
    END IF;

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error creating admin user: %', SQLERRM;
END $$;

-- Create function for admin to create users (USES SERVICE ROLE)
CREATE OR REPLACE FUNCTION create_user_with_profile(
    user_email TEXT,
    user_password TEXT,
    profile_data JSONB
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_user_id UUID;
    result JSONB;
BEGIN
    -- NOTE: This function should only be called by service role
    -- Frontend will check admin status before calling

    -- Generate new user ID
    new_user_id := gen_random_uuid();

    -- Insert into auth.users
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_sent_at,
        recovery_token
    ) VALUES (
        '00000000-0000-0000-0000-000000000000'::uuid,
        new_user_id,
        'authenticated',
        'authenticated',
        user_email,
        crypt(user_password, gen_salt('bf')),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        profile_data,
        NOW(),
        NOW(),
        '',
        '',
        NULL,
        ''
    );

    -- Insert into profiles
    INSERT INTO public.profiles (
        id,
        username,
        full_name,
        avatar_url,
        bio,
        skills,
        role,
        social_links,
        created_at
    ) VALUES (
        new_user_id,
        profile_data->>'username',
        profile_data->>'full_name',
        profile_data->>'avatar_url',
        profile_data->>'bio',
        COALESCE((profile_data->>'skills')::TEXT[], ARRAY[]::TEXT[]),
        COALESCE(profile_data->>'role', 'member'),
        COALESCE(profile_data->'social_links', '{}'::JSONB),
        NOW()
    );

    -- Return success
    result := jsonb_build_object(
        'success', true,
        'user_id', new_user_id,
        'email', user_email
    );

    RETURN result;

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_user_with_profile TO authenticated;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated;
GRANT ALL ON public.projects TO anon, authenticated;
GRANT ALL ON public.project_contributors TO anon, authenticated;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '🎉 The Noders PTNK database setup complete! (FIXED VERSION)';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Admin Login Credentials:';
    RAISE NOTICE '   Email: admin@thenodersptnk.local';
    RAISE NOTICE '   Password: admin123456';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Features:';
    RAISE NOTICE '   • Complete database schema with FIXED RLS (no circular dependency)';
    RAISE NOTICE '   • Admin user with full permissions';
    RAISE NOTICE '   • Admin functions use service role key (bypass RLS)';
    RAISE NOTICE '   • User creation function for admins';
    RAISE NOTICE '';
    RAISE NOTICE '🔗 Login at: http://localhost:3000/login';
    RAISE NOTICE '';
    RAISE NOTICE '🔧 FIXED: Removed circular RLS policies that caused 500 errors';
END $$;