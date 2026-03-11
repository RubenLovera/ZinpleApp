-- Add has_seen_welcome column to users table
ALTER TABLE public.users
ADD COLUMN has_seen_welcome boolean DEFAULT false;

-- Update existing users to mark them as having seen welcome
UPDATE public.users
SET has_seen_welcome = true
WHERE has_seen_welcome IS NULL;
