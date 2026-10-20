# GRIN recovery and backend exit plan

Last reviewed: 2026-10-20

## Current situation

- Frontend source is in this GitHub repository.
- Production currently uses Supabase for Postgres, authentication, the Data API, and media storage.
- The Supabase organization is on the Free plan. Project status at last check: ACTIVE_HEALTHY.
- This file is a recovery checklist, not proof that a complete database/media backup already exists.
- Never put passwords, service-role keys, database URLs with credentials, user access tokens, or other secrets in Git.

## Immediate backup checklist

Complete these before relying on GRIN for real users:

1. From the Supabase Dashboard, use the supported database export/backup options for this project. Save a full schema + data dump in a private location outside this repository. If the Free plan does not offer downloadable managed backups, use the documented Postgres dump workflow with a database connection string and a trusted local machine. Do not paste the connection string into chat, GitHub, or public logs.
2. Export the schema/migrations, including RLS policies, triggers, functions, indexes, grants, and extensions. A table list alone is not a restorable backup.
3. Back up Storage objects separately. A Postgres dump does not contain the actual image/video object bytes. Preserve object paths and metadata as well.
4. Securely record Auth configuration: enabled providers, redirect URLs, SMTP settings, JWT/session settings, and any OAuth provider configuration. Do not export or commit secrets.
5. Keep at least two copies in different places (for example, encrypted local storage plus a private cloud drive). Test that the dump can be read and restored into a separate empty database before treating it as a backup.
6. Repeat on a schedule and before schema changes. Never rely only on a backup inside the same Supabase account.

## Recovery sequence if the project pauses

1. Check the Supabase dashboard and billing/usage status; restore the project if the dashboard offers restoration.
2. If the project is inaccessible, use the independent schema/data dump and storage backup.
3. Create a replacement backend, restore the database and policies/functions, restore media, and configure authentication.
4. Update deployment secrets/environment variables only after the replacement backend is tested.
5. Test signup/login, feed reads, text/photo/video posts, reactions, comments, follows, stories, messaging, notifications, and uploads before switching production traffic.
6. Keep the old project intact until the replacement has been verified.

## Exit Supabase safely

Do not abruptly replace the client or change the frontend URL: GRIN depends on Supabase Auth sessions, SQL/RLS policies, PostgREST queries, Storage URLs, and possibly Realtime behavior.

Recommended staged migration:
1. Preserve and verify backups first.
2. Catalogue every Supabase feature and query used by the frontend.
3. Introduce a backend adapter/service layer so UI components do not depend directly on Supabase-specific calls.
4. Move data and media to a replacement service and implement equivalent authorization.
5. Migrate accounts carefully. Password hashes and existing sessions are not automatically portable to an unrelated auth provider; users may need a secure password-reset/reverification flow.
6. Run old and new backends in parallel during testing, then switch only after parity and rollback are proven.

## Candidate replacement architecture to evaluate

A Cloudflare-first design may reduce reliance on Supabase:
- Cloudflare Workers for API endpoints
- Cloudflare D1 for relational data where it fits; alternatively a managed PostgreSQL provider if Postgres compatibility is important
- Cloudflare R2 or another object store for photos/videos
- A dedicated authentication solution with secure sessions and account recovery
- Durable Objects or another realtime mechanism for chat/presence if needed

This is an architecture proposal, not a completed migration. Check current pricing, free-tier limits, quotas, and regional availability before choosing. Social media uploads and realtime usage can exceed free limits. Keep secrets in Cloudflare/GitHub secret stores, never in frontend source.

## Known migration preserved in Git

The SQL migration for the production fix dated 2026-10-20 is in `supabase/migrations/20261020155202_fix_grin_posting_and_profile_relationships.sql`.

## Recovery acceptance test

A backup is considered usable only after a restore test confirms:
- schema, indexes, constraints, functions, triggers, RLS policies and grants are present
- expected row counts and key relationships are intact
- sample media files can be fetched
- authentication recovery is documented
- core user journeys pass in the restored environment
