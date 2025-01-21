-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all profiles
CREATE POLICY "Allow authenticated users to read profiles"
ON profiles FOR SELECT
TO authenticated
USING (true);

-- Allow users to update their own profile
CREATE POLICY "Allow users to update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);