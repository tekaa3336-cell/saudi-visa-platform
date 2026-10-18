-- ============================================================================
-- Database Schema for Visa Service Platform
-- Supabase PostgreSQL with Row Level Security
--
-- Safe to run more than once (idempotent). Run it in the Supabase SQL editor.
--
-- Security model
--   * Regular users can only READ their own applications (and the rows that belong to them).
--     They cannot insert/update/delete application rows directly: every write goes through the
--     SECURITY DEFINER functions below, which validate the input and the caller.
--   * An ADMIN is an account with a CONFIRMED email that is in public.admin_allowlist
--     (or has profiles.role = 'admin').
--   * Admin data access additionally requires that the session was created with an email
--     one-time code (JWT claim `amr` contains `otp` or `magiclink`). A session created with the
--     password alone gets NO admin access, even if someone bypasses the web UI.
--     Known limit: the server cannot prove that the password step happened in the same login
--     (that second factor is enforced by the web UI). For a server-enforced second factor use
--     Supabase MFA (TOTP) and require aal2 here.
-- ============================================================================

-- ============================================
-- 0. MIGRATION: legacy `applications` table from supabase-schema.sql
--    (it had a single JSONB column `applicants_data` and is incompatible with this schema)
-- ============================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'applications' AND column_name = 'applicants_data'
  ) THEN
    ALTER TABLE public.applications RENAME TO applications_legacy;
    ALTER INDEX IF EXISTS public.applications_pkey RENAME TO applications_legacy_pkey;
    ALTER INDEX IF EXISTS public.idx_applications_user_id RENAME TO idx_applications_legacy_user_id;
    ALTER INDEX IF EXISTS public.idx_applications_status RENAME TO idx_applications_legacy_status;
    ALTER INDEX IF EXISTS public.idx_applications_created_at RENAME TO idx_applications_legacy_created_at;
  END IF;
END $$;

-- ============================================
-- 1. USERS & PROFILES
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  nationality TEXT,
  country_of_residence TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'agency_owner', 'agency_staff', 'admin')),
  agency_id UUID,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Emails allowed to be administrators. Nobody can read or write this table through the API:
-- manage it from the SQL editor, e.g.  INSERT INTO public.admin_allowlist (email) VALUES ('name@example.com');
CREATE TABLE IF NOT EXISTS admin_allowlist (
  email TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO admin_allowlist (email) VALUES ('tekaa336@gmail.com') ON CONFLICT DO NOTHING;

-- ============================================
-- 2. AGENCIES
-- ============================================
CREATE TABLE IF NOT EXISTS agencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'suspended')),
  tier TEXT DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  trade_license TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS fk_agency;
ALTER TABLE profiles ADD CONSTRAINT fk_agency FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE SET NULL;

-- ============================================
-- 3. SERVICES & PRICING
-- ============================================
CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  eligibility_ar TEXT,
  eligibility_en TEXT,
  processing_time_ar TEXT,
  processing_time_en TEXT,
  service_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  government_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'AED',
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS service_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id TEXT REFERENCES services(id) ON DELETE CASCADE,
  document_name_ar TEXT NOT NULL,
  document_name_en TEXT NOT NULL,
  is_required BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS wholesale_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id TEXT REFERENCES services(id) ON DELETE CASCADE,
  tier_name TEXT NOT NULL,
  min_applications INTEGER NOT NULL,
  discount_percent DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. APPLICATIONS & APPLICANTS
-- ============================================
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_code TEXT NOT NULL UNIQUE,
  service_id TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id),
  agency_id UUID REFERENCES agencies(id),
  status TEXT DEFAULT 'draft',
  payment_status TEXT DEFAULT 'not_due' CHECK (payment_status IN ('not_due', 'due', 'paid', 'refunded')),
  total_cost DECIMAL(10,2) DEFAULT 0,
  service_fee DECIMAL(10,2) DEFAULT 0,
  government_fee DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- The service catalogue lives in the web app, so validate the id with a CHECK instead of a foreign key
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_service_id_fkey;
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_service_id_check;
ALTER TABLE applications ADD CONSTRAINT applications_service_id_check CHECK (service_id IN (
  'tourist_visa', 'family_visit', 'personal_visit', 'business_visit',
  'work_guidance', 'umrah_assistance', 'visa_facilitation'
));

ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_status_check;
ALTER TABLE applications ADD CONSTRAINT applications_status_check CHECK (status IN (
  'draft', 'submitted', 'document_review', 'needs_revision', 'processing', 'verified',
  'approved_for_payment', 'payment_pending', 'completed', 'rejected', 'cancelled'
));

CREATE TABLE IF NOT EXISTS applicants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  nationality TEXT NOT NULL,
  passport_number TEXT NOT NULL,
  passport_expiry DATE NOT NULL,
  date_of_birth DATE NOT NULL,
  country_of_residence TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. DOCUMENTS (Private Storage Metadata)
-- ============================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  applicant_id UUID REFERENCES applicants(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  storage_key TEXT NOT NULL, -- Path inside the private "visa-documents" bucket: <user id>/...
  mime_type TEXT,
  file_size INTEGER,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  uploaded_by UUID REFERENCES profiles(id),
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. STATUS EVENTS & VERIFICATION
-- ============================================
CREATE TABLE IF NOT EXISTS status_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  actor_id UUID REFERENCES profiles(id),
  actor_role TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS verification_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  verified_by UUID REFERENCES profiles(id) NOT NULL,
  verified_at TIMESTAMPTZ DEFAULT NOW(),
  official_ref_number TEXT,
  documents_checked TEXT[], -- Array of document IDs
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. PAYMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'AED',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method TEXT,
  transaction_ref TEXT,
  due_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 8. NOTIFICATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title_ar TEXT,
  title_en TEXT,
  message_ar TEXT,
  message_en TEXT,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read BOOLEAN DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 9. CONTACT INQUIRIES & FAQ
-- ============================================
CREATE TABLE IF NOT EXISTS contact_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_ar TEXT NOT NULL,
  question_en TEXT NOT NULL,
  answer_ar TEXT NOT NULL,
  answer_en TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 10. AUDIT LOGS
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 11. HELPER FUNCTIONS (used by policies and RPCs)
-- ============================================

-- Confirmed email + (in the allowlist OR profile role = 'admin')
CREATE OR REPLACE FUNCTION public.is_admin_account()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT COALESCE((
    SELECT u.email_confirmed_at IS NOT NULL AND (
      EXISTS (SELECT 1 FROM public.admin_allowlist a WHERE lower(a.email) = lower(u.email))
      OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id AND p.role = 'admin')
    )
    FROM auth.users u
    WHERE u.id = auth.uid()
  ), false)
$$;

-- The current session was created with an email one-time code (not with the password alone)
CREATE OR REPLACE FUNCTION public.session_used_email_otp()
RETURNS BOOLEAN
LANGUAGE sql STABLE
SET search_path = public, auth
AS $$
  SELECT COALESCE(
    jsonb_path_exists(
      COALESCE(auth.jwt() -> 'amr', '[]'::jsonb),
      '$[*] ? (@.method == "otp" || @.method == "magiclink")'
    ),
    false
  )
$$;

-- Verified admin: confirmed admin account AND signed in with an email one-time code
CREATE OR REPLACE FUNCTION public.is_admin_session()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT public.is_admin_account() AND public.session_used_email_otp()
$$;

CREATE OR REPLACE FUNCTION public.is_confirmed_user()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT COALESCE((SELECT u.email_confirmed_at IS NOT NULL FROM auth.users u WHERE u.id = auth.uid()), false)
$$;

CREATE OR REPLACE FUNCTION public.owns_application(p_application_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.applications a
    WHERE a.id = p_application_id AND a.user_id = auth.uid()
  )
$$;

-- Same transitions as STATUS_TRANSITIONS in src/types.ts
CREATE OR REPLACE FUNCTION public.is_valid_status_transition(p_from TEXT, p_to TEXT)
RETURNS BOOLEAN
LANGUAGE sql IMMUTABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM (VALUES
      ('draft', 'submitted'), ('draft', 'cancelled'),
      ('submitted', 'document_review'), ('submitted', 'needs_revision'), ('submitted', 'rejected'), ('submitted', 'cancelled'),
      ('document_review', 'processing'), ('document_review', 'submitted'), ('document_review', 'needs_revision'), ('document_review', 'rejected'),
      ('needs_revision', 'submitted'), ('needs_revision', 'document_review'), ('needs_revision', 'rejected'), ('needs_revision', 'cancelled'),
      ('processing', 'verified'), ('processing', 'needs_revision'), ('processing', 'rejected'),
      ('verified', 'approved_for_payment'), ('verified', 'processing'),
      ('approved_for_payment', 'payment_pending'), ('approved_for_payment', 'completed'),
      ('payment_pending', 'completed'), ('payment_pending', 'cancelled'),
      ('rejected', 'submitted'),
      ('cancelled', 'draft')
    ) AS t(f, t) WHERE t.f = p_from AND t.t = p_to
  )
$$;

-- Creates the profile row for an auth user when it is missing (applications reference profiles)
CREATE OR REPLACE FUNCTION public.ensure_profile(p_user_id UUID)
RETURNS VOID
LANGUAGE sql SECURITY DEFINER
SET search_path = public, auth
AS $$
  INSERT INTO public.profiles (id, email, full_name, role)
  SELECT u.id,
         COALESCE(u.email, u.id::text || '@unknown.invalid'),
         COALESCE(NULLIF(trim(u.raw_user_meta_data ->> 'full_name'), ''), split_part(COALESCE(u.email, 'user'), '@', 1)),
         'customer'
  FROM auth.users u
  WHERE u.id = p_user_id
  ON CONFLICT DO NOTHING
$$;

-- Validates one applicant object coming from the web app. Dates and required fields are strict;
-- phone and email are only format-checked when present.
CREATE OR REPLACE FUNCTION public.validate_applicant(a JSONB)
RETURNS VOID
LANGUAGE plpgsql STABLE
AS $$
DECLARE
  v_name TEXT := trim(COALESCE(a ->> 'fullName', ''));
  v_dob DATE;
  v_exp DATE;
BEGIN
  IF v_name !~ '^[؀-ۿa-zA-Z ]+$' OR array_length(regexp_split_to_array(v_name, '\s+'), 1) < 2 OR length(v_name) > 120 THEN
    RAISE EXCEPTION 'INVALID_NAME' USING ERRCODE = '22023';
  END IF;
  IF trim(COALESCE(a ->> 'nationality', '')) = '' THEN
    RAISE EXCEPTION 'INVALID_NATIONALITY' USING ERRCODE = '22023';
  END IF;
  IF COALESCE(a ->> 'passportNumber', '') !~ '^[A-Za-z0-9]{6,9}$' THEN
    RAISE EXCEPTION 'INVALID_PASSPORT_NUMBER' USING ERRCODE = '22023';
  END IF;
  IF trim(COALESCE(a ->> 'countryOfResidence', '')) = '' THEN
    RAISE EXCEPTION 'INVALID_RESIDENCE' USING ERRCODE = '22023';
  END IF;

  BEGIN
    v_dob := (a ->> 'dateOfBirth')::date;
  EXCEPTION WHEN others THEN
    RAISE EXCEPTION 'INVALID_DOB' USING ERRCODE = '22023';
  END;
  IF v_dob IS NULL OR v_dob < DATE '1920-01-01' OR v_dob > current_date THEN
    RAISE EXCEPTION 'INVALID_DOB' USING ERRCODE = '22023';
  END IF;

  BEGIN
    v_exp := (a ->> 'passportExpiry')::date;
  EXCEPTION WHEN others THEN
    RAISE EXCEPTION 'INVALID_PASSPORT_EXPIRY' USING ERRCODE = '22023';
  END;
  IF v_exp IS NULL OR v_exp <= current_date OR v_exp > (current_date + INTERVAL '20 years')::date THEN
    RAISE EXCEPTION 'INVALID_PASSPORT_EXPIRY' USING ERRCODE = '22023';
  END IF;

  IF COALESCE(a ->> 'phone', '') <> '' AND (a ->> 'phone') !~ '^[+0-9 ()\-]{6,20}$' THEN
    RAISE EXCEPTION 'INVALID_PHONE' USING ERRCODE = '22023';
  END IF;
  IF COALESCE(a ->> 'email', '') <> '' AND (a ->> 'email') !~ '^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'INVALID_EMAIL' USING ERRCODE = '22023';
  END IF;
END;
$$;

-- ============================================
-- 12. TRIGGERS
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_applications_updated_at ON applications;
CREATE TRIGGER set_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create a profile for every new auth user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  PERFORM public.ensure_profile(NEW.id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Users may edit their own profile, but never their role, email, agency or verification flag
-- (the "update own profile" policy alone would let anyone make themselves an admin)
CREATE OR REPLACE FUNCTION public.guard_profile_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF current_user IN ('authenticated', 'anon') THEN
    IF NEW.id IS DISTINCT FROM OLD.id
       OR NEW.email IS DISTINCT FROM OLD.email
       OR NEW.role IS DISTINCT FROM OLD.role
       OR NEW.agency_id IS DISTINCT FROM OLD.agency_id
       OR NEW.is_verified IS DISTINCT FROM OLD.is_verified THEN
      RAISE EXCEPTION 'PROFILE_FIELD_LOCKED' USING ERRCODE = '42501';
    END IF;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_profile_update ON profiles;
CREATE TRIGGER guard_profile_update
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_profile_update();

-- ============================================
-- 13. ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_allowlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE wholesale_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Remove policies from earlier versions of this file (some were recursive or too broad)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own applications" ON applications;
DROP POLICY IF EXISTS "Agency can view own applications" ON applications;
DROP POLICY IF EXISTS "Admin can view all applications" ON applications;
DROP POLICY IF EXISTS "Users can view own applicants" ON applicants;
DROP POLICY IF EXISTS "Admin can view all applicants" ON applicants;
DROP POLICY IF EXISTS "Users can view own documents" ON documents;
DROP POLICY IF EXISTS "Admin can view all documents" ON documents;
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Admin can view audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Users can insert own applications" ON applications;
DROP POLICY IF EXISTS "Users can update own applications" ON applications;

-- profiles
DROP POLICY IF EXISTS "profiles: read own" ON profiles;
DROP POLICY IF EXISTS "profiles: update own" ON profiles;
DROP POLICY IF EXISTS "profiles: admin read all" ON profiles;
CREATE POLICY "profiles: read own" ON profiles
  FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "profiles: update own" ON profiles
  FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "profiles: admin read all" ON profiles
  FOR SELECT TO authenticated USING ((SELECT public.is_admin_session()));

-- agencies (admin only for now)
DROP POLICY IF EXISTS "agencies: admin all" ON agencies;
CREATE POLICY "agencies: admin all" ON agencies
  FOR ALL TO authenticated USING ((SELECT public.is_admin_session())) WITH CHECK ((SELECT public.is_admin_session()));

-- applications: owners read their own rows; verified admins have full access.
-- There is deliberately NO insert/update/delete policy for regular users: they write through the RPCs.
DROP POLICY IF EXISTS "applications: read own" ON applications;
DROP POLICY IF EXISTS "applications: admin all" ON applications;
CREATE POLICY "applications: read own" ON applications
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "applications: admin all" ON applications
  FOR ALL TO authenticated USING ((SELECT public.is_admin_session())) WITH CHECK ((SELECT public.is_admin_session()));

-- applicants / documents / status_events: reachable only through an application the user owns
DROP POLICY IF EXISTS "applicants: read own" ON applicants;
DROP POLICY IF EXISTS "applicants: admin all" ON applicants;
CREATE POLICY "applicants: read own" ON applicants
  FOR SELECT TO authenticated USING (public.owns_application(application_id));
CREATE POLICY "applicants: admin all" ON applicants
  FOR ALL TO authenticated USING ((SELECT public.is_admin_session())) WITH CHECK ((SELECT public.is_admin_session()));

DROP POLICY IF EXISTS "documents: read own" ON documents;
DROP POLICY IF EXISTS "documents: admin all" ON documents;
CREATE POLICY "documents: read own" ON documents
  FOR SELECT TO authenticated USING (public.owns_application(application_id));
CREATE POLICY "documents: admin all" ON documents
  FOR ALL TO authenticated USING ((SELECT public.is_admin_session())) WITH CHECK ((SELECT public.is_admin_session()));

DROP POLICY IF EXISTS "status_events: read own" ON status_events;
DROP POLICY IF EXISTS "status_events: admin all" ON status_events;
CREATE POLICY "status_events: read own" ON status_events
  FOR SELECT TO authenticated USING (public.owns_application(application_id));
CREATE POLICY "status_events: admin all" ON status_events
  FOR ALL TO authenticated USING ((SELECT public.is_admin_session())) WITH CHECK ((SELECT public.is_admin_session()));

-- verification records and payments: admin only
DROP POLICY IF EXISTS "verification_records: admin all" ON verification_records;
CREATE POLICY "verification_records: admin all" ON verification_records
  FOR ALL TO authenticated USING ((SELECT public.is_admin_session())) WITH CHECK ((SELECT public.is_admin_session()));
DROP POLICY IF EXISTS "payments: admin all" ON payments;
CREATE POLICY "payments: admin all" ON payments
  FOR ALL TO authenticated USING ((SELECT public.is_admin_session())) WITH CHECK ((SELECT public.is_admin_session()));

-- notifications: users see (and mark as read) only their own
DROP POLICY IF EXISTS "notifications: read own" ON notifications;
DROP POLICY IF EXISTS "notifications: mark own read" ON notifications;
CREATE POLICY "notifications: read own" ON notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "notifications: mark own read" ON notifications
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- audit logs: admin read only (rows are written by trusted code)
DROP POLICY IF EXISTS "audit_logs: admin read" ON audit_logs;
CREATE POLICY "audit_logs: admin read" ON audit_logs
  FOR SELECT TO authenticated USING ((SELECT public.is_admin_session()));

-- contact form: anyone can send a message, only admins can read or manage them
DROP POLICY IF EXISTS "contact_inquiries: anyone can send" ON contact_inquiries;
DROP POLICY IF EXISTS "contact_inquiries: admin all" ON contact_inquiries;
CREATE POLICY "contact_inquiries: anyone can send" ON contact_inquiries
  FOR INSERT TO anon, authenticated WITH CHECK (status = 'new');
CREATE POLICY "contact_inquiries: admin all" ON contact_inquiries
  FOR ALL TO authenticated USING ((SELECT public.is_admin_session())) WITH CHECK ((SELECT public.is_admin_session()));

-- public catalogue data: readable by everyone, writable only from the dashboard / service role
DROP POLICY IF EXISTS "services: public read" ON services;
CREATE POLICY "services: public read" ON services FOR SELECT TO anon, authenticated USING (is_active);
DROP POLICY IF EXISTS "service_requirements: public read" ON service_requirements;
CREATE POLICY "service_requirements: public read" ON service_requirements FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "wholesale_tiers: public read" ON wholesale_tiers;
CREATE POLICY "wholesale_tiers: public read" ON wholesale_tiers FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "faqs: public read" ON faqs;
CREATE POLICY "faqs: public read" ON faqs FOR SELECT TO anon, authenticated USING (is_active);

-- admin_allowlist: no policies on purpose (nobody can read or write it through the API)

-- Belt and braces: the anonymous role has no business touching these tables
REVOKE ALL ON profiles, admin_allowlist, agencies, applications, applicants, documents,
              status_events, verification_records, payments, notifications, audit_logs FROM anon;
REVOKE ALL ON admin_allowlist FROM authenticated;
GRANT INSERT ON contact_inquiries TO anon;

-- ============================================
-- 14. RPC FUNCTIONS (the only way regular users write application data)
-- ============================================

-- 14.1 Submit a new application. Returns {id, reference_code}.
-- p_applicants: [{fullName, nationality, passportNumber, passportExpiry, dateOfBirth, countryOfResidence, phone, email}]
-- p_documents:  [{applicant_index, document_type, file_name, storage_key, mime_type, file_size}]
CREATE OR REPLACE FUNCTION public.submit_application(
  p_service_id TEXT,
  p_applicants JSONB,
  p_documents JSONB DEFAULT '[]'::jsonb,
  p_service_fee NUMERIC DEFAULT 0,
  p_government_fee NUMERIC DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_app UUID;
  v_ref TEXT;
  v_a JSONB;
  v_d JSONB;
  v_n INT;
  v_idx INT;
  v_ids UUID[] := '{}';
  v_aid UUID;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED' USING ERRCODE = '28000'; END IF;
  IF NOT public.is_confirmed_user() THEN RAISE EXCEPTION 'EMAIL_NOT_CONFIRMED' USING ERRCODE = '42501'; END IF;

  IF p_service_id IS NULL OR p_service_id NOT IN (
    'tourist_visa', 'family_visit', 'personal_visit', 'business_visit',
    'work_guidance', 'umrah_assistance', 'visa_facilitation'
  ) THEN
    RAISE EXCEPTION 'INVALID_SERVICE' USING ERRCODE = '22023';
  END IF;

  IF p_applicants IS NULL OR jsonb_typeof(p_applicants) <> 'array' THEN
    RAISE EXCEPTION 'INVALID_APPLICANTS' USING ERRCODE = '22023';
  END IF;
  v_n := jsonb_array_length(p_applicants);
  IF v_n < 1 OR v_n > 10 THEN RAISE EXCEPTION 'INVALID_APPLICANTS' USING ERRCODE = '22023'; END IF;
  IF COALESCE(p_service_fee, 0) < 0 OR COALESCE(p_service_fee, 0) > 100000
     OR COALESCE(p_government_fee, 0) < 0 OR COALESCE(p_government_fee, 0) > 100000 THEN
    RAISE EXCEPTION 'INVALID_FEES' USING ERRCODE = '22023';
  END IF;

  FOR v_a IN SELECT * FROM jsonb_array_elements(p_applicants) LOOP
    PERFORM public.validate_applicant(v_a);
  END LOOP;

  IF p_documents IS NULL OR jsonb_typeof(p_documents) <> 'array' THEN
    RAISE EXCEPTION 'INVALID_DOCUMENTS' USING ERRCODE = '22023';
  END IF;
  IF jsonb_array_length(p_documents) > 100 THEN RAISE EXCEPTION 'INVALID_DOCUMENTS' USING ERRCODE = '22023'; END IF;
  FOR v_d IN SELECT * FROM jsonb_array_elements(p_documents) LOOP
    v_idx := (v_d ->> 'applicant_index')::int;
    IF v_idx IS NULL OR v_idx < 0 OR v_idx >= v_n
       OR COALESCE(v_d ->> 'document_type', '') = ''
       OR COALESCE(v_d ->> 'file_name', '') = ''
       OR COALESCE(v_d ->> 'storage_key', '') NOT LIKE v_uid::text || '/%'
       OR length(v_d ->> 'storage_key') > 300 THEN
      RAISE EXCEPTION 'INVALID_DOCUMENTS' USING ERRCODE = '22023';
    END IF;
  END LOOP;

  PERFORM public.ensure_profile(v_uid);

  LOOP
    v_ref := 'VSA-' || to_char(now(), 'YYYY') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.applications x WHERE x.reference_code = v_ref);
  END LOOP;

  INSERT INTO public.applications (reference_code, service_id, user_id, status, total_cost, service_fee, government_fee)
  VALUES (v_ref, p_service_id, v_uid, 'submitted',
          (COALESCE(p_service_fee, 0) + COALESCE(p_government_fee, 0)) * v_n,
          COALESCE(p_service_fee, 0), COALESCE(p_government_fee, 0))
  RETURNING id INTO v_app;

  FOR v_a IN SELECT * FROM jsonb_array_elements(p_applicants) LOOP
    INSERT INTO public.applicants (application_id, full_name, nationality, passport_number, passport_expiry,
                                   date_of_birth, country_of_residence, phone, email)
    VALUES (v_app, trim(v_a ->> 'fullName'), trim(v_a ->> 'nationality'), upper(v_a ->> 'passportNumber'),
            (v_a ->> 'passportExpiry')::date, (v_a ->> 'dateOfBirth')::date, trim(v_a ->> 'countryOfResidence'),
            NULLIF(trim(COALESCE(v_a ->> 'phone', '')), ''), NULLIF(trim(COALESCE(v_a ->> 'email', '')), ''))
    RETURNING id INTO v_aid;
    v_ids := v_ids || v_aid;
  END LOOP;

  FOR v_d IN SELECT * FROM jsonb_array_elements(p_documents) LOOP
    INSERT INTO public.documents (application_id, applicant_id, document_type, file_name, storage_key,
                                  mime_type, file_size, uploaded_by)
    VALUES (v_app, v_ids[(v_d ->> 'applicant_index')::int + 1], v_d ->> 'document_type', v_d ->> 'file_name',
            v_d ->> 'storage_key', v_d ->> 'mime_type', NULLIF(v_d ->> 'file_size', '')::int, v_uid);
  END LOOP;

  INSERT INTO public.status_events (application_id, from_status, to_status, actor_id, actor_role)
  VALUES (v_app, NULL, 'submitted', v_uid, 'customer');

  RETURN jsonb_build_object('id', v_app, 'reference_code', v_ref);
END;
$$;

-- 14.2 Admin changes the status and (optionally) leaves a note for the customer
CREATE OR REPLACE FUNCTION public.admin_set_status(
  p_application_id UUID,
  p_new_status TEXT,
  p_note TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_old TEXT;
  v_note TEXT := NULLIF(trim(COALESCE(p_note, '')), '');
BEGIN
  IF NOT public.is_admin_session() THEN RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501'; END IF;

  SELECT a.status INTO v_old FROM public.applications a WHERE a.id = p_application_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'NOT_FOUND' USING ERRCODE = 'P0002'; END IF;

  IF NOT public.is_valid_status_transition(v_old, p_new_status) THEN
    RAISE EXCEPTION 'INVALID_TRANSITION' USING ERRCODE = '22023';
  END IF;
  IF v_note IS NOT NULL AND length(v_note) > 500 THEN
    RAISE EXCEPTION 'NOTE_TOO_LONG' USING ERRCODE = '22023';
  END IF;
  IF p_new_status IN ('rejected', 'needs_revision') AND (v_note IS NULL OR length(v_note) < 5) THEN
    RAISE EXCEPTION 'NOTE_REQUIRED' USING ERRCODE = '22023';
  END IF;

  PERFORM public.ensure_profile(v_uid);

  UPDATE public.applications SET status = p_new_status WHERE id = p_application_id;
  INSERT INTO public.status_events (application_id, from_status, to_status, actor_id, actor_role, note)
  VALUES (p_application_id, v_old, p_new_status, v_uid, 'admin', v_note);

  RETURN jsonb_build_object('id', p_application_id, 'status', p_new_status);
END;
$$;

-- 14.3 The owner fixes an application that is in "needs_revision" and sends it back for review.
-- p_applicants: [{id, fullName, ...}] (ids of existing applicants of this application)
-- p_documents:  [{applicant_id, document_type, file_name, storage_key, mime_type, file_size}] (replaces same-type documents)
CREATE OR REPLACE FUNCTION public.resubmit_application(
  p_application_id UUID,
  p_applicants JSONB,
  p_documents JSONB DEFAULT '[]'::jsonb,
  p_note TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_status TEXT;
  v_ref TEXT;
  v_a JSONB;
  v_d JSONB;
  v_id UUID;
  v_note TEXT := NULLIF(trim(COALESCE(p_note, '')), '');
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED' USING ERRCODE = '28000'; END IF;
  IF NOT public.is_confirmed_user() THEN RAISE EXCEPTION 'EMAIL_NOT_CONFIRMED' USING ERRCODE = '42501'; END IF;

  SELECT a.status, a.reference_code INTO v_status, v_ref
  FROM public.applications a
  WHERE a.id = p_application_id AND a.user_id = v_uid
  FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'NOT_FOUND' USING ERRCODE = 'P0002'; END IF;
  IF v_status <> 'needs_revision' THEN RAISE EXCEPTION 'NOT_EDITABLE' USING ERRCODE = '22023'; END IF;
  IF v_note IS NOT NULL AND length(v_note) > 500 THEN RAISE EXCEPTION 'NOTE_TOO_LONG' USING ERRCODE = '22023'; END IF;

  IF p_applicants IS NULL OR jsonb_typeof(p_applicants) <> 'array' OR jsonb_array_length(p_applicants) < 1 THEN
    RAISE EXCEPTION 'INVALID_APPLICANTS' USING ERRCODE = '22023';
  END IF;
  IF p_documents IS NULL OR jsonb_typeof(p_documents) <> 'array' OR jsonb_array_length(p_documents) > 100 THEN
    RAISE EXCEPTION 'INVALID_DOCUMENTS' USING ERRCODE = '22023';
  END IF;

  FOR v_a IN SELECT * FROM jsonb_array_elements(p_applicants) LOOP
    PERFORM public.validate_applicant(v_a);
    v_id := NULL;
    BEGIN
      v_id := (v_a ->> 'id')::uuid;
    EXCEPTION WHEN others THEN
      RAISE EXCEPTION 'INVALID_APPLICANTS' USING ERRCODE = '22023';
    END;
    IF v_id IS NULL OR NOT EXISTS (
      SELECT 1 FROM public.applicants x WHERE x.id = v_id AND x.application_id = p_application_id
    ) THEN
      RAISE EXCEPTION 'INVALID_APPLICANTS' USING ERRCODE = '22023';
    END IF;

    UPDATE public.applicants SET
      full_name = trim(v_a ->> 'fullName'),
      nationality = trim(v_a ->> 'nationality'),
      passport_number = upper(v_a ->> 'passportNumber'),
      passport_expiry = (v_a ->> 'passportExpiry')::date,
      date_of_birth = (v_a ->> 'dateOfBirth')::date,
      country_of_residence = trim(v_a ->> 'countryOfResidence'),
      phone = NULLIF(trim(COALESCE(v_a ->> 'phone', '')), ''),
      email = NULLIF(trim(COALESCE(v_a ->> 'email', '')), '')
    WHERE id = v_id AND application_id = p_application_id;
  END LOOP;

  FOR v_d IN SELECT * FROM jsonb_array_elements(p_documents) LOOP
    v_id := NULL;
    BEGIN
      v_id := (v_d ->> 'applicant_id')::uuid;
    EXCEPTION WHEN others THEN
      RAISE EXCEPTION 'INVALID_DOCUMENTS' USING ERRCODE = '22023';
    END;
    IF v_id IS NULL
       OR NOT EXISTS (SELECT 1 FROM public.applicants x WHERE x.id = v_id AND x.application_id = p_application_id)
       OR COALESCE(v_d ->> 'document_type', '') = ''
       OR COALESCE(v_d ->> 'file_name', '') = ''
       OR COALESCE(v_d ->> 'storage_key', '') NOT LIKE v_uid::text || '/%'
       OR length(v_d ->> 'storage_key') > 300 THEN
      RAISE EXCEPTION 'INVALID_DOCUMENTS' USING ERRCODE = '22023';
    END IF;

    DELETE FROM public.documents
    WHERE application_id = p_application_id AND applicant_id = v_id AND document_type = v_d ->> 'document_type';

    INSERT INTO public.documents (application_id, applicant_id, document_type, file_name, storage_key,
                                  mime_type, file_size, uploaded_by)
    VALUES (p_application_id, v_id, v_d ->> 'document_type', v_d ->> 'file_name', v_d ->> 'storage_key',
            v_d ->> 'mime_type', NULLIF(v_d ->> 'file_size', '')::int, v_uid);
  END LOOP;

  UPDATE public.applications SET status = 'submitted' WHERE id = p_application_id;
  INSERT INTO public.status_events (application_id, from_status, to_status, actor_id, actor_role, note)
  VALUES (p_application_id, 'needs_revision', 'submitted', v_uid, 'customer', v_note);

  RETURN jsonb_build_object('id', p_application_id, 'reference_code', v_ref, 'status', 'submitted');
END;
$$;

-- 14.4 Public tracking by reference code. Returns status and dates only: no personal data and no admin notes.
CREATE OR REPLACE FUNCTION public.track_application(p_reference TEXT)
RETURNS JSONB
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'reference_code', a.reference_code,
    'service_id', a.service_id,
    'status', a.status,
    'created_at', a.created_at,
    'updated_at', a.updated_at,
    'history', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('to_status', e.to_status, 'created_at', e.created_at) ORDER BY e.created_at)
      FROM public.status_events e WHERE e.application_id = a.id
    ), '[]'::jsonb)
  )
  FROM public.applications a
  WHERE a.reference_code = upper(trim(p_reference))
$$;

-- Function privileges: new functions are executable by everyone by default; lock them down
REVOKE ALL ON FUNCTION public.is_admin_account() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.session_used_email_otp() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_admin_session() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_confirmed_user() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.owns_application(UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.ensure_profile(UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.validate_applicant(JSONB) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.submit_application(TEXT, JSONB, JSONB, NUMERIC, NUMERIC) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_set_status(UUID, TEXT, TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.resubmit_application(UUID, JSONB, JSONB, TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.track_application(TEXT) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.is_admin_account() TO authenticated;
GRANT EXECUTE ON FUNCTION public.session_used_email_otp() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_session() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_confirmed_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.owns_application(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_application(TEXT, JSONB, JSONB, NUMERIC, NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_status(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.resubmit_application(UUID, JSONB, JSONB, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.track_application(TEXT) TO anon, authenticated;

-- ============================================
-- 15. STORAGE (private bucket for passports and other documents)
-- ============================================
-- Files live under <user id>/... . The bucket is PRIVATE: no public URLs. Owners and verified admins
-- read through short-lived signed URLs. (Earlier versions of the web app created this bucket as public:
-- this statement makes it private.)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('visa-documents', 'visa-documents', false, 5242880, ARRAY['application/pdf', 'image/jpeg', 'image/png'])
ON CONFLICT (id) DO UPDATE
  SET public = false,
      file_size_limit = 5242880,
      allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png'];

DROP POLICY IF EXISTS "Users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own documents" ON storage.objects;
DROP POLICY IF EXISTS "Admin can read all documents" ON storage.objects;
DROP POLICY IF EXISTS "visa-documents: upload to own folder" ON storage.objects;
DROP POLICY IF EXISTS "visa-documents: read own" ON storage.objects;
DROP POLICY IF EXISTS "visa-documents: admin read all" ON storage.objects;

CREATE POLICY "visa-documents: upload to own folder" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'visa-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "visa-documents: read own" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'visa-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "visa-documents: admin read all" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'visa-documents' AND (SELECT public.is_admin_session()));

-- ============================================
-- 16. INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_applications_user ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_agency ON applications(agency_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_created ON applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_applicants_application ON applicants(application_id);
CREATE INDEX IF NOT EXISTS idx_documents_application ON documents(application_id);
CREATE INDEX IF NOT EXISTS idx_status_events_application ON status_events(application_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- ============================================
-- 17. REALTIME (the admin dashboard refreshes when an application changes)
-- ============================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime')
     AND NOT EXISTS (
       SELECT 1 FROM pg_publication_tables
       WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'applications'
     ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.applications;
  END IF;
END $$;

-- ============================================
-- 18. BACKFILL: profiles for accounts that existed before the trigger above
-- ============================================
INSERT INTO public.profiles (id, email, full_name, role)
SELECT u.id,
       COALESCE(u.email, u.id::text || '@unknown.invalid'),
       COALESCE(NULLIF(trim(u.raw_user_meta_data ->> 'full_name'), ''), split_part(COALESCE(u.email, 'user'), '@', 1)),
       'customer'
FROM auth.users u
ON CONFLICT DO NOTHING;
