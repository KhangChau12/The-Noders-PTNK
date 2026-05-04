-- Allow PDF files in the images storage bucket for certificates
-- Also increase file size limit to 10MB to accommodate PDFs

UPDATE storage.buckets
SET
    file_size_limit = 10485760, -- 10MB
    allowed_mime_types = ARRAY[
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/gif',
        'application/pdf'
    ]
WHERE id = 'images';

DO $$
BEGIN
    RAISE NOTICE '✅ Storage bucket updated:';
    RAISE NOTICE '   • File size limit: 10MB';
    RAISE NOTICE '   • Added allowed type: application/pdf';
END $$;
