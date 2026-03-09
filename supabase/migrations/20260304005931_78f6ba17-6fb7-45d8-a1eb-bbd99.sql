
-- Allow public read of profile names for reviews display
CREATE POLICY "Anyone can view profile names"
ON public.profiles
FOR SELECT
TO anon, authenticated
USING (true);
