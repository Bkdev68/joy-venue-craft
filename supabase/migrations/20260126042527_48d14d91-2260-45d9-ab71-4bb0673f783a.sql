
-- Drop the recursive policy
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;

-- Allow authenticated users to view their own role (this is safe)
-- This policy already exists from previous migration, so we skip it

-- Allow admins to view all roles using the security definer function
CREATE POLICY "Admins can view all roles"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));
