# GRIN Supabase backup status

Last checked: 2026-10-20

- Production project was reported ACTIVE_HEALTHY at check time.
- The organization is on the Free plan.
- Public schema contains 40 tables across GRIN and legacy business/content functionality.
- The `grin-media` storage bucket exists and is public.
- The latest posting/profile-relationship migration is preserved in `supabase/migrations/20261020155202_fix_grin_posting_and_profile_relationships.sql`.
- Recovery guidance is in `docs/RECOVERY_AND_BACKUP_PLAN.md`.

## Not yet completed

- A complete independent PostgreSQL data dump has not been downloaded and restore-tested.
- Storage object bytes have not yet been copied to independent storage.
- Auth settings/provider configuration has not yet been documented.
- No replacement backend has been provisioned; Supabase remains the live backend.

A schema inventory or generated TypeScript types file is not a substitute for a restorable database dump.
