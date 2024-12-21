-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to create profiles" ON "public"."profiles";
DROP POLICY IF EXISTS "Allow authenticated users to read profiles" ON "public"."profiles";
DROP POLICY IF EXISTS "Allow authenticated users to update profiles" ON "public"."profiles";
DROP POLICY IF EXISTS "Allow authenticated users to delete profiles" ON "public"."profiles";

-- Create new policies that only allow staff and admin roles to manage profiles
CREATE POLICY "Allow staff and admin to create profiles"
ON "public"."profiles"
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IN (
  SELECT id FROM profiles WHERE role IN ('staff', 'admin')
));

CREATE POLICY "Allow staff and admin to read profiles"
ON "public"."profiles"
FOR SELECT
TO authenticated
USING (auth.uid() IN (
  SELECT id FROM profiles WHERE role IN ('staff', 'admin')
));

CREATE POLICY "Allow staff and admin to update profiles"
ON "public"."profiles"
FOR UPDATE
TO authenticated
USING (auth.uid() IN (
  SELECT id FROM profiles WHERE role IN ('staff', 'admin')
))
WITH CHECK (auth.uid() IN (
  SELECT id FROM profiles WHERE role IN ('staff', 'admin')
));

CREATE POLICY "Allow staff and admin to delete profiles"
ON "public"."profiles"
FOR DELETE
TO authenticated
USING (auth.uid() IN (
  SELECT id FROM profiles WHERE role IN ('staff', 'admin')
));