-- =====================================================
-- CERTIFICATES VERIFICATION SYSTEM
-- =====================================================
-- This migration creates a system for verifying member certificates
-- Admin can upload certificates and link them to members
-- Public can verify certificates by certificate ID (e.g., TN-GEN0-H8AU)

-- =====================================================
-- 1. CREATE CERTIFICATES TABLE
-- =====================================================

CREATE TABLE public.certificates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Certificate ID (unique identifier for verification)
    -- Format: TN-GEN{number}-{4-char-suffix}
    -- Example: TN-GEN0-H8AU
    certificate_id TEXT UNIQUE NOT NULL,

    -- Link to member
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

    -- Certificate details
    gen_number INTEGER NOT NULL DEFAULT 0,  -- Generation number (0, 1, 2...)
    suffix TEXT NOT NULL CHECK (LENGTH(suffix) = 4),  -- 4 character suffix

    -- Certificate file (stored in images bucket)
    image_id UUID REFERENCES public.images(id) ON DELETE SET NULL,
    file_url TEXT,  -- Direct URL backup
    file_type TEXT DEFAULT 'image' CHECK (file_type IN ('image', 'pdf')),

    -- Metadata
    title TEXT DEFAULT 'Course Completion Certificate',  -- Certificate title
    description TEXT,  -- Additional description
    issued_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,  -- Admin who issued
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE public.certificates IS 'Stores member certificates for verification';
COMMENT ON COLUMN public.certificates.certificate_id IS 'Unique verification ID in format TN-GEN{n}-{XXXX}';
COMMENT ON COLUMN public.certificates.gen_number IS 'Generation number of the member (0 = Gen 0, 1 = Gen 1, etc.)';
COMMENT ON COLUMN public.certificates.suffix IS '4-character alphanumeric suffix for uniqueness';
COMMENT ON COLUMN public.certificates.image_id IS 'Reference to certificate image in images table';
COMMENT ON COLUMN public.certificates.file_url IS 'Direct URL to certificate file (backup)';

-- =====================================================
-- 2. CREATE INDEXES
-- =====================================================

CREATE INDEX idx_certificates_certificate_id ON public.certificates(certificate_id);
CREATE INDEX idx_certificates_user_id ON public.certificates(user_id);
CREATE INDEX idx_certificates_gen_number ON public.certificates(gen_number);
CREATE INDEX idx_certificates_issued_at ON public.certificates(issued_at DESC);
CREATE INDEX idx_certificates_issued_by ON public.certificates(issued_by);

-- =====================================================
-- 3. CREATE TRIGGER FOR updated_at
-- =====================================================

-- Reuse the existing update_updated_at_column function
DROP TRIGGER IF EXISTS update_certificates_updated_at ON public.certificates;
CREATE TRIGGER update_certificates_updated_at
    BEFORE UPDATE ON public.certificates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. CREATE RLS POLICIES
-- =====================================================

-- Public can view all certificates (for verification)
CREATE POLICY "Anyone can view certificates"
    ON public.certificates FOR SELECT
    USING (true);

-- Only authenticated users can create certificates (API validates admin)
CREATE POLICY "Authenticated users can create certificates"
    ON public.certificates FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Only authenticated users can update certificates (API validates admin)
CREATE POLICY "Authenticated users can update certificates"
    ON public.certificates FOR UPDATE
    USING (auth.uid() IS NOT NULL);

-- Only authenticated users can delete certificates (API validates admin)
CREATE POLICY "Authenticated users can delete certificates"
    ON public.certificates FOR DELETE
    USING (auth.uid() IS NOT NULL);

-- =====================================================
-- 6. CREATE HELPER FUNCTIONS
-- =====================================================

-- Function to generate random 4-character suffix
CREATE OR REPLACE FUNCTION generate_certificate_suffix()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..4 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$;

-- Function to generate unique certificate ID
CREATE OR REPLACE FUNCTION generate_certificate_id(gen_num INTEGER)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    new_suffix TEXT;
    new_cert_id TEXT;
    max_attempts INTEGER := 100;
    attempt INTEGER := 0;
BEGIN
    LOOP
        attempt := attempt + 1;
        new_suffix := generate_certificate_suffix();
        new_cert_id := 'TN-GEN' || gen_num || '-' || new_suffix;

        -- Check if this certificate ID already exists
        IF NOT EXISTS (SELECT 1 FROM public.certificates WHERE certificate_id = new_cert_id) THEN
            RETURN new_cert_id;
        END IF;

        -- Prevent infinite loop
        IF attempt >= max_attempts THEN
            RAISE EXCEPTION 'Could not generate unique certificate ID after % attempts', max_attempts;
        END IF;
    END LOOP;
END;
$$;

-- Function to verify certificate and return details
CREATE OR REPLACE FUNCTION verify_certificate(cert_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    cert_record RECORD;
    user_record RECORD;
    issuer_record RECORD;
    image_record RECORD;
    result JSONB;
BEGIN
    -- Find certificate
    SELECT * INTO cert_record
    FROM public.certificates
    WHERE certificate_id = cert_id;

    IF cert_record IS NULL THEN
        RETURN jsonb_build_object(
            'valid', false,
            'error', 'Certificate not found'
        );
    END IF;

    -- Get user (member) details
    SELECT id, username, full_name, avatar_url, bio, social_links
    INTO user_record
    FROM public.profiles
    WHERE id = cert_record.user_id;

    -- Get issuer details (if exists)
    IF cert_record.issued_by IS NOT NULL THEN
        SELECT id, username, full_name
        INTO issuer_record
        FROM public.profiles
        WHERE id = cert_record.issued_by;
    END IF;

    -- Get image details (if exists)
    IF cert_record.image_id IS NOT NULL THEN
        SELECT id, public_url, mime_type
        INTO image_record
        FROM public.images
        WHERE id = cert_record.image_id;
    END IF;

    -- Build result
    result := jsonb_build_object(
        'valid', true,
        'certificate', jsonb_build_object(
            'id', cert_record.id,
            'certificate_id', cert_record.certificate_id,
            'title', cert_record.title,
            'description', cert_record.description,
            'gen_number', cert_record.gen_number,
            'file_url', COALESCE(image_record.public_url, cert_record.file_url),
            'file_type', cert_record.file_type,
            'issued_at', cert_record.issued_at
        ),
        'member', jsonb_build_object(
            'id', user_record.id,
            'username', user_record.username,
            'full_name', user_record.full_name,
            'avatar_url', user_record.avatar_url,
            'bio', user_record.bio,
            'social_links', user_record.social_links
        ),
        'issuer', CASE
            WHEN issuer_record IS NOT NULL THEN jsonb_build_object(
                'id', issuer_record.id,
                'username', issuer_record.username,
                'full_name', issuer_record.full_name
            )
            ELSE NULL
        END
    );

    RETURN result;
END;
$$;

-- =====================================================
-- 7. GRANT PERMISSIONS
-- =====================================================

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.certificates TO authenticated;

-- Grant SELECT to anonymous users (for verification)
GRANT SELECT ON public.certificates TO anon;

-- Grant execute permission for functions
GRANT EXECUTE ON FUNCTION generate_certificate_suffix() TO authenticated;
GRANT EXECUTE ON FUNCTION generate_certificate_id(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION verify_certificate(TEXT) TO anon, authenticated;

-- =====================================================
-- 8. UPDATE IMAGES TABLE
-- =====================================================

-- Add 'certificate' to usage_type check constraint
ALTER TABLE public.images DROP CONSTRAINT IF EXISTS images_mime_type_check;
ALTER TABLE public.images ADD CONSTRAINT images_mime_type_check
    CHECK (mime_type IN ('image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'));

ALTER TABLE public.images DROP CONSTRAINT IF EXISTS images_usage_type_check;
ALTER TABLE public.images ADD CONSTRAINT images_usage_type_check
    CHECK (usage_type IN ('avatar', 'project_thumbnail', 'news_image', 'general', 'certificate'));

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Certificate verification system created successfully!';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Features:';
    RAISE NOTICE '   • certificates table for storing certificate metadata';
    RAISE NOTICE '   • Certificate ID format: TN-GEN{n}-{XXXX}';
    RAISE NOTICE '   • Links to profiles (member) and images (certificate file)';
    RAISE NOTICE '   • Public verification via verify_certificate() function';
    RAISE NOTICE '   • Helper functions for generating unique IDs';
    RAISE NOTICE '';
    RAISE NOTICE '🔗 API endpoints to create:';
    RAISE NOTICE '   • POST /api/admin/certificates - Create certificate';
    RAISE NOTICE '   • GET /api/admin/certificates - List all certificates';
    RAISE NOTICE '   • DELETE /api/admin/certificates/[id] - Delete certificate';
    RAISE NOTICE '   • GET /api/certificates/verify/[certificateId] - Public verify';
    RAISE NOTICE '';
    RAISE NOTICE '🌐 Pages to create:';
    RAISE NOTICE '   • /admin/certificates - Admin management page';
    RAISE NOTICE '   • /verify - Public verification page';
END $$;
