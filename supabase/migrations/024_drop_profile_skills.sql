-- Drop the unused profiles.skills column.
--
-- Only two profiles ever filled it in, and the site no longer shows it.
-- create_user_with_profile() still wrote to the column, so it is redefined
-- here first (identical except for skills); otherwise it would fail after
-- the column is gone.

BEGIN;

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

    new_user_id := gen_random_uuid();

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

    INSERT INTO public.profiles (
        id,
        username,
        full_name,
        avatar_url,
        bio,
        role,
        social_links,
        created_at
    ) VALUES (
        new_user_id,
        profile_data->>'username',
        profile_data->>'full_name',
        profile_data->>'avatar_url',
        profile_data->>'bio',
        COALESCE(profile_data->>'role', 'member'),
        COALESCE(profile_data->'social_links', '{}'::JSONB),
        NOW()
    );

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

-- No CASCADE: if anything else still depends on the column, fail loudly
-- instead of silently dropping it.
ALTER TABLE public.profiles DROP COLUMN IF EXISTS skills;

COMMIT;
