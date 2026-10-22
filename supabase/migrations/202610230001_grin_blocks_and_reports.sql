-- Private user blocking and abuse reports for GRIN.
-- Users can manage only their own block list. Reports are submit-only for clients.

create table if not exists public.grin_user_blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid not null references auth.users(id) on delete cascade,
  blocked_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint grin_user_blocks_no_self_block check (blocker_id <> blocked_id),
  constraint grin_user_blocks_unique_pair unique (blocker_id, blocked_id)
);

alter table public.grin_user_blocks enable row level security;
revoke all on public.grin_user_blocks from anon, authenticated;
grant select, insert, delete on public.grin_user_blocks to authenticated;

drop policy if exists "Users can view their own blocks" on public.grin_user_blocks;
create policy "Users can view their own blocks"
  on public.grin_user_blocks for select to authenticated
  using (blocker_id = (select auth.uid()));

drop policy if exists "Users can block other accounts" on public.grin_user_blocks;
create policy "Users can block other accounts"
  on public.grin_user_blocks for insert to authenticated
  with check (blocker_id = (select auth.uid()) and blocked_id <> (select auth.uid()));

drop policy if exists "Users can unblock their own blocks" on public.grin_user_blocks;
create policy "Users can unblock their own blocks"
  on public.grin_user_blocks for delete to authenticated
  using (blocker_id = (select auth.uid()));

create table if not exists public.grin_user_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  reported_user_id uuid not null references auth.users(id) on delete cascade,
  reason text not null check (reason in ('harassment', 'spam', 'impersonation', 'inappropriate_content', 'other')),
  details text check (details is null or char_length(details) <= 1000),
  created_at timestamptz not null default now(),
  constraint grin_user_reports_no_self_report check (reporter_id <> reported_user_id)
);

alter table public.grin_user_reports enable row level security;
revoke all on public.grin_user_reports from anon, authenticated;
grant insert on public.grin_user_reports to authenticated;

drop policy if exists "Users can submit reports about other accounts" on public.grin_user_reports;
create policy "Users can submit reports about other accounts"
  on public.grin_user_reports for insert to authenticated
  with check (reporter_id = (select auth.uid()) and reported_user_id <> (select auth.uid()));
