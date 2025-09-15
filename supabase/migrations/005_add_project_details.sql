-- Add details field to projects table for rich text content
-- This field will store HTML content from the rich text editor
-- Safe migration: only adds new column, doesn't modify existing data

ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS details TEXT;

-- Set default empty string for existing projects
UPDATE public.projects
SET details = ''
WHERE details IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.projects.details IS 'Rich text HTML content for project details, supporting formatting like bold, italic, headers, etc.';