CREATE TABLE admin_custom_charts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  chart_name TEXT NOT NULL,
  chart_type TEXT NOT NULL CHECK (chart_type IN ('line', 'bar', 'pie', 'donut')),
  resource TEXT NOT NULL,
  x_field TEXT,
  y_field TEXT,
  aggregation TEXT DEFAULT 'count',
  filters JSONB DEFAULT '{}',
  time_range TEXT DEFAULT '7d',
  custom_start_date TIMESTAMP WITH TIME ZONE,
  custom_end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE admin_custom_charts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own charts
CREATE POLICY "Users can view their own custom charts" ON admin_custom_charts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own charts
CREATE POLICY "Users can insert their own custom charts" ON admin_custom_charts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own charts
CREATE POLICY "Users can update their own custom charts" ON admin_custom_charts
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own charts
CREATE POLICY "Users can delete their own custom charts" ON admin_custom_charts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Update updated_at timestamp
-- We assume there is a function `update_updated_at_column()` already defined in the database.
-- If not, we may need to create it. However, looking at existing migrations, it seems they use a trigger.
-- Let's check if we have such a function. If not, we can create it here, but to avoid overstepping, we'll note that the user must have the function.
-- Alternatively, we can create the function if it doesn't exist, but that might be beyond the scope.
-- Since we are not sure, we'll create the trigger and if the function doesn't exist, the user will have to create it.
-- However, looking at the existing migrations, we see that they often use `update_updated_at_column` function.
-- We'll assume it exists. If not, the user can create it separately.

CREATE TRIGGER update_admin_custom_charts_updated_at
  BEFORE UPDATE ON admin_custom_charts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();