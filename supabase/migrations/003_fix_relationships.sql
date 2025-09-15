-- Fix relationships for project contributors to work with profiles
-- This migration ensures proper foreign key relationships

-- Drop the existing foreign key constraint to auth.users
ALTER TABLE public.project_contributors
DROP CONSTRAINT IF EXISTS project_contributors_user_id_fkey;

-- Add foreign key constraint to profiles table instead
ALTER TABLE public.project_contributors
ADD CONSTRAINT project_contributors_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Also ensure that projects.created_by references profiles
ALTER TABLE public.projects
DROP CONSTRAINT IF EXISTS projects_created_by_fkey;

ALTER TABLE public.projects
ADD CONSTRAINT projects_created_by_fkey
FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;