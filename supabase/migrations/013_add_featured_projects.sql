-- Add featured field to projects table for homepage display
-- Only 3 projects can be featured at once

-- Add featured column to projects
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

-- Create index for faster featured project queries
CREATE INDEX IF NOT EXISTS idx_projects_featured
ON public.projects(featured)
WHERE featured = true;

-- Create function to enforce max 3 featured projects
CREATE OR REPLACE FUNCTION enforce_max_featured_projects()
RETURNS TRIGGER AS $$
DECLARE
    featured_count INTEGER;
BEGIN
    -- Only check if we're setting featured to true
    IF NEW.featured = true THEN
        -- Count current featured projects (excluding the current one if it's an update)
        SELECT COUNT(*) INTO featured_count
        FROM public.projects
        WHERE featured = true
        AND id != NEW.id;

        -- If we already have 3 featured projects, prevent this operation
        IF featured_count >= 3 THEN
            RAISE EXCEPTION 'Maximum of 3 projects can be featured at once. Please unfeature another project first.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce the limit
DROP TRIGGER IF EXISTS check_featured_limit ON public.projects;
CREATE TRIGGER check_featured_limit
    BEFORE INSERT OR UPDATE OF featured ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION enforce_max_featured_projects();

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Featured projects feature added successfully!';
    RAISE NOTICE '   • Added "featured" boolean column to projects table';
    RAISE NOTICE '   • Maximum 3 projects can be featured at once';
    RAISE NOTICE '   • Trigger enforces the limit automatically';
END $$;
