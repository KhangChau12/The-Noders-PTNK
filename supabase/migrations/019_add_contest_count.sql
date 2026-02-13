-- Add contest_count column to profiles table
-- This field is manually managed by admins to track how many club contests a member has participated in
ALTER TABLE profiles ADD COLUMN contest_count integer NOT NULL DEFAULT 0;
