-- Add is_active column to admin_custom_charts table
ALTER TABLE public.admin_custom_charts 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- Update existing rows to have is_active = true (though DEFAULT should handle new inserts)
UPDATE public.admin_custom_charts 
SET is_active = true 
WHERE is_active IS NULL;

-- Update the trigger function to include is_active in updates if needed
-- Assuming update_updated_at_column() function exists from previous migrations
