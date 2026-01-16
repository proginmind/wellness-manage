-- Migration 003: Create Organizations, Profiles, and Invitations
-- This establishes the multi-tenant architecture for the wellness management system

-- ============================================================================
-- 1. CREATE ENUMS
-- ============================================================================

-- User roles within an organization
CREATE TYPE user_role AS ENUM ('owner', 'staff');

-- Invitation status tracking
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'expired');

-- ============================================================================
-- 2. CREATE ORGANIZATIONS TABLE
-- ============================================================================

CREATE TABLE public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  
  -- Business constraints
  CONSTRAINT unique_owner UNIQUE (owner_id),
  CONSTRAINT name_min_length CHECK (char_length(name) >= 2)
);

-- Indexes for performance
CREATE INDEX idx_organizations_owner_id ON public.organizations(owner_id);

-- Auto-update timestamp trigger
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 3. CREATE PROFILES TABLE
-- ============================================================================

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  
  -- Business constraints
  CONSTRAINT valid_role CHECK (role IN ('owner', 'staff'))
);

-- Indexes for performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_organization_id ON public.profiles(organization_id);
CREATE INDEX idx_profiles_role ON public.profiles(role);

-- Auto-update timestamp trigger
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 4. CREATE INVITATIONS TABLE
-- ============================================================================

CREATE TABLE public.invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  email text NOT NULL,
  invited_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status invitation_status DEFAULT 'pending' NOT NULL,
  token uuid DEFAULT gen_random_uuid() UNIQUE NOT NULL,
  expires_at timestamptz DEFAULT (now() + interval '7 days') NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  
  -- Business constraints
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT unique_pending_invitation UNIQUE (organization_id, email, status),
  CONSTRAINT expires_in_future CHECK (expires_at > created_at)
);

-- Indexes for performance
CREATE INDEX idx_invitations_organization_id ON public.invitations(organization_id);
CREATE INDEX idx_invitations_email ON public.invitations(email);
CREATE INDEX idx_invitations_token ON public.invitations(token);
CREATE INDEX idx_invitations_status ON public.invitations(status);

-- ============================================================================
-- 5. ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 6. RLS POLICIES - ORGANIZATIONS
-- ============================================================================

-- Users can view their own organization
CREATE POLICY "Users can view their own organization"
  ON public.organizations FOR SELECT
  TO authenticated
  USING (
    id = (SELECT organization_id FROM public.profiles WHERE user_id = auth.uid())
  );

-- No one can update organizations via app (only via Dashboard/SQL)
-- This ensures organization integrity
CREATE POLICY "Organizations cannot be modified via app"
  ON public.organizations FOR UPDATE
  TO authenticated
  USING (false);

-- No one can delete organizations via app
CREATE POLICY "Organizations cannot be deleted via app"
  ON public.organizations FOR DELETE
  TO authenticated
  USING (false);

-- ============================================================================
-- 7. RLS POLICIES - PROFILES
-- ============================================================================

-- Users can view all profiles in their organization
CREATE POLICY "Users can view profiles in their organization"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    organization_id = (
      SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- No one can update roles via app (prevents privilege escalation)
CREATE POLICY "Profiles cannot be modified via app"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (false);

-- No one can delete profiles via app
CREATE POLICY "Profiles cannot be deleted via app"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (false);

-- ============================================================================
-- 8. RLS POLICIES - INVITATIONS
-- ============================================================================

-- Users can view invitations in their organization
CREATE POLICY "Users can view invitations in their organization"
  ON public.invitations FOR SELECT
  TO authenticated
  USING (
    organization_id = (
      SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- Only owners can create invitations
CREATE POLICY "Owners can create invitations"
  ON public.invitations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid()
      AND role = 'owner'
      AND organization_id = invitations.organization_id
    )
  );

-- Only owners can update invitations (e.g., expire them)
CREATE POLICY "Owners can update invitations"
  ON public.invitations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid()
      AND role = 'owner'
      AND organization_id = invitations.organization_id
    )
  );

-- ============================================================================
-- 9. HELPER FUNCTIONS
-- ============================================================================

-- Function to check if user is an owner
CREATE OR REPLACE FUNCTION public.is_owner(user_uuid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = user_uuid AND role = 'owner'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's organization ID
CREATE OR REPLACE FUNCTION public.get_user_organization_id(user_uuid uuid)
RETURNS uuid AS $$
BEGIN
  RETURN (
    SELECT organization_id FROM public.profiles WHERE user_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- VERIFICATION QUERIES (commented out, run manually if needed)
-- ============================================================================

-- SELECT * FROM public.organizations;
-- SELECT * FROM public.profiles;
-- SELECT * FROM public.invitations;
