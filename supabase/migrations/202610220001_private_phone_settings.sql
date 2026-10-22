-- Private phone details are deliberately separate from grin_profiles,
-- whose SELECT policy allows authenticated users to discover public profiles.
create table if not exists public.grin_private_contact_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  phone_e164 text,
  contact_discovery_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint grin_private_contact_phone_format
    check (phone_e164 is null or phone_e164 ~ '^\\+[1-9][0-9]{7,14}$')
);

alter table public.grin_private_contact_settings enable row level security;

drop policy if exists grin_private_contact_settings_select_own on public.grin_private_contact_settings;
create policy grin_private_contact_settings_select_own
  on public.grin_private_contact_settings
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists grin_private_contact_settings_insert_own on public.grin_private_contact_settings;
create policy grin_private_contact_settings_insert_own
  on public.grin_private_contact_settings
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists grin_private_contact_settings_update_own on public.grin_private_contact_settings;
create policy grin_private_contact_settings_update_own
  on public.grin_private_contact_settings
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

revoke all on public.grin_private_contact_settings from anon;
grant select, insert, update on public.grin_private_contact_settings to authenticated;

comment on table public.grin_private_contact_settings is
  'Private per-user phone and contact-discovery preferences. Phone matching must not be enabled until a verification flow is implemented.';
