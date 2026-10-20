-- GRIN: allow media-only posts and restore profile relationship metadata.
-- Applied to the production Supabase project on 2026-10-20.
-- Keep this file in Git so the change can be recreated during recovery.

alter table public.grin_posts
  drop constraint if exists grin_posts_body_check;

alter table public.grin_posts
  add constraint grin_posts_body_check
  check (
    (char_length(trim(body)) >= 1 or media_url is not null)
    and char_length(trim(body)) <= 5000
  );

alter table public.grin_posts
  add constraint grin_posts_author_profile_fkey
  foreign key (author_id) references public.grin_profiles(id)
  not valid;
alter table public.grin_posts validate constraint grin_posts_author_profile_fkey;

alter table public.grin_stories
  add constraint grin_stories_author_profile_fkey
  foreign key (author_id) references public.grin_profiles(id)
  not valid;
alter table public.grin_stories validate constraint grin_stories_author_profile_fkey;

alter table public.grin_creator_profiles
  add constraint grin_creator_profiles_profile_fkey
  foreign key (user_id) references public.grin_profiles(id)
  not valid;
alter table public.grin_creator_profiles validate constraint grin_creator_profiles_profile_fkey;

create or replace function public.grin_create_post_with_media(
  p_body text,
  p_media_url text default null,
  p_media_type text default null
)
returns public.grin_posts
language plpgsql
set search_path to 'public'
as $function$
declare
  v public.grin_posts;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;
  if trim(coalesce(p_body,'')) = '' and p_media_url is null then
    raise exception 'Post needs text or media';
  end if;
  if p_media_type is not null and p_media_type not in ('image','video') then
    raise exception 'Invalid media type';
  end if;
  insert into public.grin_posts(author_id,body,media_url,media_type)
  values(auth.uid(),coalesce(nullif(trim(p_body),''),''),p_media_url,p_media_type)
  returning * into v;
  return v;
end
$function$;

notify pgrst, 'reload schema';
