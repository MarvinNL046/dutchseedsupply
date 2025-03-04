-- Enable Row Level Security (RLS) on the site_config table
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows everyone to read the site_config table
CREATE POLICY "Allow public read access to site_config"
  ON public.site_config
  FOR SELECT
  USING (true);

-- Create a policy that allows only admin users to insert, update, or delete from the site_config table
CREATE POLICY "Allow admin write access to site_config"
  ON public.site_config
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE is_admin = true
    )
  );

-- Verify that RLS is enabled and policies are created
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'site_config';
SELECT * FROM pg_policies WHERE tablename = 'site_config';
