-- Add demo_url field to projects table
-- This migration adds a demo_url field to store live demo/deployment links

ALTER TABLE public.projects
ADD COLUMN demo_url TEXT;