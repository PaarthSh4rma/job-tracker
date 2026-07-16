# Supabase migrations

Apply migrations in filename order through the Supabase SQL editor or CLI after
reviewing them against the target project. Never place database credentials in
this directory.

## Milestone 2 legacy-row handling

The live audit performed before `202607130001_milestone_2_security_foundation.sql`
found two applications with `user_id IS NULL`. The migration deliberately:

- does not assign, expose, or delete those rows;
- keeps them invisible because every RLS policy requires
  `auth.uid() = user_id`;
- adds a `NOT VALID` ownership check, which preserves existing null-owned rows
  while rejecting new or changed rows without an owner; and
- copies `applied_date` and `link` into the canonical fields only when the
  destination is empty.

### Manual reconciliation

Reconcile legacy rows only when ownership can be established from trustworthy
external evidence:

1. Work in the Supabase dashboard as an administrator; never expose legacy rows
   through the application or a public API.
2. Record the target user's exact `auth.users.id` and why the row belongs to
   them.
3. Update only that row's `user_id` inside a transaction and verify it is visible
   to the intended user and no one else.
4. Once no null-owned rows remain, validate the ownership constraint:

   ```sql
   alter table public.applications
     validate constraint applications_user_id_required;
   ```

If ownership cannot be proven, leave the row quarantined. Never guess an owner.
