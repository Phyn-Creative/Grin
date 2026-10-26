create extension if not exists pg_net;

create table if not exists public.grin_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  subscription jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.grin_push_subscriptions enable row level security;

drop policy if exists "Users manage their own GRIN push subscriptions" on public.grin_push_subscriptions;
create policy "Users manage their own GRIN push subscriptions"
  on public.grin_push_subscriptions for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists grin_push_subscriptions_user_id_idx
  on public.grin_push_subscriptions(user_id);

do $$
begin
  if not exists (select 1 from vault.decrypted_secrets where name = 'grin_push_webhook_secret') then
    perform vault.create_secret(
      encode(gen_random_bytes(32), 'hex'),
      'grin_push_webhook_secret',
      'Shared secret between GRIN notification trigger and push delivery Edge Function'
    );
  end if;
end $$;

create or replace function public.get_grin_push_webhook_secret()
returns text language sql security definer set search_path = ''
as $$
  select decrypted_secret from vault.decrypted_secrets
  where name = 'grin_push_webhook_secret' limit 1
$$;

revoke all on function public.get_grin_push_webhook_secret() from public, anon, authenticated;
grant execute on function public.get_grin_push_webhook_secret() to service_role;

create or replace function public.notify_grin_push_on_notification()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare shared_secret text;
begin
  select decrypted_secret into shared_secret from vault.decrypted_secrets
  where name = 'grin_push_webhook_secret' limit 1;
  if shared_secret is null then
    raise warning 'GRIN push webhook secret is missing from Vault';
    return new;
  end if;
  perform net.http_post(
    url := 'https://blttlxjevcbxwhdvgmnz.supabase.co/functions/v1/grin-push-notification',
    body := jsonb_build_object('type','INSERT','table','grin_notifications','schema','public','record',to_jsonb(new)),
    headers := jsonb_build_object('Content-Type','application/json','x-grin-webhook-secret',shared_secret),
    timeout_milliseconds := 5000
  );
  return new;
end;
$$;

drop trigger if exists grin_push_notification_after_insert on public.grin_notifications;
create trigger grin_push_notification_after_insert
  after insert on public.grin_notifications
  for each row execute function public.notify_grin_push_on_notification();

comment on table public.grin_push_subscriptions is
  'Web Push endpoints owned by each authenticated GRIN user; subscription material is private.';