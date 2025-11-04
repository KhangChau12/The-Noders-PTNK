-- Add RLS policies for admin to manage projects
-- Admins should be able to update any project (including featured field)

-- Create policy for admin to update any project
CREATE POLICY "Admins can update any project"
    ON public.projects FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Create policy for admin to delete any project
CREATE POLICY "Admins can delete any project"
    ON public.projects FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Admin project management policies added successfully!';
    RAISE NOTICE '   • Admins can now update any project (including featured field)';
    RAISE NOTICE '   • Admins can delete any project';
END $$;
