# Supabase setup

1. Run `schema.sql` in the Supabase SQL Editor. It is safe to run again, it renames an old `applications`
   table (the one with `applicants_data`) to `applications_legacy`, and it removes the objects of the earlier
   admin feature (allowlist table, admin functions and policies) if they exist.
2. Authentication > Providers > Email: turn **Confirm email** on, and add your site URL under
   Authentication > URL Configuration > Redirect URLs.
3. Customers read only their own rows (RLS). Writes go through `submit_application` and
   `resubmit_application`; `track_application` is the public lookup (status and dates only).
   Documents are stored in the private bucket `visa-documents` under `<user id>/...`.
4. Reviewing applications and changing a status is done from the Supabase dashboard (service role).
