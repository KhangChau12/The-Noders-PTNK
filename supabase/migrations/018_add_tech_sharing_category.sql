-- Add Tech Sharing to allowed categories
ALTER TABLE public.posts 
DROP CONSTRAINT posts_category_check;

ALTER TABLE public.posts 
ADD CONSTRAINT posts_category_check 
CHECK (category IS NULL OR category IN ('News', 'You may want to know', 'Member Spotlight', 'Community Activities', 'Tech Sharing'));
