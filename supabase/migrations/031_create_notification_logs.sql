-- =====================================================
-- Create notification_logs table
-- Records every notification attempt (sent and failed)
-- Used for auditing, deduplication, and reminder tracking
-- =====================================================

CREATE TABLE public.notification_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  template text NOT NULL,
  recipient text NOT NULL,
  status text NOT NULL CHECK (status IN ('sent', 'failed')),
  error text,
  visit_id uuid REFERENCES public.visits(id) ON DELETE SET NULL,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =====================================================
-- Indexes
-- =====================================================

CREATE INDEX idx_notification_logs_organization_id
  ON public.notification_logs(organization_id);

CREATE INDEX idx_notification_logs_visit_id
  ON public.notification_logs(visit_id);

-- Composite index for querying "was a reminder already sent for this visit+template?"
CREATE INDEX idx_notification_logs_org_template_status
  ON public.notification_logs(organization_id, template, status);

-- =====================================================
-- Row Level Security
-- =====================================================

ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- Owners and staff can read logs within their organization
CREATE POLICY "Users can view notification logs in their organization"
  ON public.notification_logs
  FOR SELECT
  TO authenticated
  USING (organization_id = public.user_organization_id());

-- No user-level INSERT / UPDATE / DELETE — the table is written exclusively
-- by the server-side admin client (bypasses RLS via service role key)

COMMENT ON TABLE public.notification_logs IS 'Audit log of all notification attempts; written by the server admin client, readable by org members';
COMMENT ON COLUMN public.notification_logs.type IS 'Notification channel: email, sms, push';
COMMENT ON COLUMN public.notification_logs.template IS 'Template identifier, e.g. visit_created_client';
COMMENT ON COLUMN public.notification_logs.status IS 'sent or failed';
COMMENT ON COLUMN public.notification_logs.error IS 'Error message when status = failed';
COMMENT ON COLUMN public.notification_logs.visit_id IS 'FK to visits (nullable) – links log entry to a specific visit';
COMMENT ON COLUMN public.notification_logs.metadata IS 'Optional JSON snapshot of templateData for debugging';
