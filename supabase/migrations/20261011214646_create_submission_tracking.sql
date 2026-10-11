/*
# Create submission_tracking table for KiyPos Capture

1. Purpose
   - Tracks the status of encrypted customer submission payloads relayed
     through the Supabase edge function to the external FastAPI backend.
   - Stores NO unencrypted customer data. Only metadata: key identifier,
     submission status, timestamps, device type, and server response refs.

2. New Tables
   - `submission_tracking`
     - `id` (uuid, primary key)
     - `key_id` (text, the session/transaction key identifier from the QR code)
     - `status` (text: 'pending', 'accepted', 'rejected', 'error')
     - `device_type` (text: 'phone' or 'tablet')
     - `server_export_doc_ref` (text, nullable, returned by FastAPI backend)
     - `server_crm_ref` (text, nullable, returned by FastAPI backend)
     - `error_reason` (text, nullable, populated on failure)
     - `created_at` (timestamptz, default now())

3. Security
   - Enable RLS on `submission_tracking`.
   - This is a no-auth app (no sign-in screen). The app uses the anon key.
   - Allow anon + authenticated to INSERT (create tracking row on submit)
     and SELECT (check status). Updates are not needed from the client;
     the edge function handles relay and uses the service role internally.
*/

CREATE TABLE IF NOT EXISTS submission_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key_id text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  device_type text,
  server_export_doc_ref text,
  server_crm_ref text,
  error_reason text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE submission_tracking ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_submissions" ON submission_tracking;
CREATE POLICY "anon_insert_submissions"
ON submission_tracking FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_select_submissions" ON submission_tracking;
CREATE POLICY "anon_select_submissions"
ON submission_tracking FOR SELECT
TO anon, authenticated USING (true);
