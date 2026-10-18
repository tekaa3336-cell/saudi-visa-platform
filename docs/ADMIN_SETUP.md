# Admin login, live data and security: setup

## 1. Run the schema
Supabase dashboard > SQL Editor > paste `schema.sql` > Run. It is safe to run again, and it renames an old
`applications` table (the one with `applicants_data`) to `applications_legacy`.

The admins are the rows of `admin_allowlist` (seeded with `tekaa336@gmail.com`). Add another admin with:

```sql
insert into public.admin_allowlist (email) values ('second.admin@example.com');
```

Keep `VITE_ADMIN_EMAILS` (used only to decide what the UI shows) in step with that table.

## 2. Authentication settings
- Authentication > Providers > Email: **Confirm email ON**.
- Authentication > Email Templates > **Magic Link**: the one-time code is sent with this template. Include
  `{{ .Token }}` in the body (for example `Your verification code: {{ .Token }}`) and remove the link.
- Authentication > URL Configuration: add the site URL and redirect URLs of the deployed app.
- Use a custom SMTP provider: the built-in sender is limited to a few emails per hour, which also limits admin logins.

## 3. How the admin login works
1. Email + password (Supabase password check). The password lives only in Supabase Auth, never in `.env`,
   the bundle or user metadata.
2. For an admin account the app signs the password session out and emails a fresh 6-digit code
   (`signInWithOtp`, `shouldCreateUser:false`). Entering it (`verifyOtp`) creates the session.
3. The database trusts only sessions whose JWT `amr` claim contains `otp`/`magiclink`
   (`is_admin_session()`), so a password-only session can neither read other users' data nor change a status.

Known limit: Postgres cannot see that the password step happened, only that the session came from an email code.
To enforce password + code on the server, enable Supabase MFA (TOTP) and require `aal2` in `is_admin_session()`.

## 4. Data model for applications
Customers read only their own rows (RLS). Writes go through functions that validate the data:
`submit_application`, `resubmit_application` (customer, only from `needs_revision`), `admin_set_status` (admin
session; a note is required for Rejected / Action required), `track_application` (public, status and dates only).
Documents are stored in the private bucket `visa-documents` under `<user id>/...` and opened with signed links.
