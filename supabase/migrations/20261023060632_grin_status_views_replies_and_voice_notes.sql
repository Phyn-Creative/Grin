-- Status views, replies, reply notifications, text-only statuses, and voice-note storage.
ALTER TABLE public.grin_stories ALTER COLUMN media_url DROP NOT NULL;
ALTER TABLE public.grin_stories ALTER COLUMN media_type DROP NOT NULL;
ALTER TABLE public.grin_notifications ADD COLUMN IF NOT EXISTS story_id uuid REFERENCES public.grin_stories(id) ON DELETE CASCADE;
ALTER TABLE public.grin_notifications DROP CONSTRAINT IF EXISTS grin_notifications_kind_check;
ALTER TABLE public.grin_notifications ADD CONSTRAINT grin_notifications_kind_check CHECK (kind = ANY (ARRAY['reaction'::text,'comment'::text,'message'::text,'follow'::text,'status_reply'::text]));

CREATE TABLE IF NOT EXISTS public.grin_story_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid NOT NULL REFERENCES public.grin_stories(id) ON DELETE CASCADE,
  viewer_id uuid NOT NULL REFERENCES public.grin_profiles(id) ON DELETE CASCADE,
  viewed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (story_id, viewer_id)
);
ALTER TABLE public.grin_story_views ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS grin_story_views_read_related ON public.grin_story_views;
CREATE POLICY grin_story_views_read_related ON public.grin_story_views
  FOR SELECT TO authenticated
  USING (
    viewer_id = (SELECT auth.uid())
    OR EXISTS (SELECT 1 FROM public.grin_stories s WHERE s.id = story_id AND s.author_id = (SELECT auth.uid()))
  );
DROP POLICY IF EXISTS grin_story_views_insert_self ON public.grin_story_views;
CREATE POLICY grin_story_views_insert_self ON public.grin_story_views
  FOR INSERT TO authenticated
  WITH CHECK (
    viewer_id = (SELECT auth.uid())
    AND EXISTS (SELECT 1 FROM public.grin_stories s WHERE s.id = story_id AND s.expires_at > now() AND s.author_id <> (SELECT auth.uid()))
  );
DROP POLICY IF EXISTS grin_story_views_update_self ON public.grin_story_views;
CREATE POLICY grin_story_views_update_self ON public.grin_story_views
  FOR UPDATE TO authenticated
  USING (viewer_id = (SELECT auth.uid()))
  WITH CHECK (viewer_id = (SELECT auth.uid()));
CREATE INDEX IF NOT EXISTS grin_story_views_story_viewed_idx ON public.grin_story_views(story_id, viewed_at DESC);
CREATE INDEX IF NOT EXISTS grin_story_views_viewer_idx ON public.grin_story_views(viewer_id, viewed_at DESC);

CREATE TABLE IF NOT EXISTS public.grin_story_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid NOT NULL REFERENCES public.grin_stories(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES public.grin_profiles(id) ON DELETE CASCADE,
  body text NOT NULL CHECK (length(btrim(body)) BETWEEN 1 AND 2000),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.grin_story_replies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS grin_story_replies_read_active ON public.grin_story_replies;
CREATE POLICY grin_story_replies_read_active ON public.grin_story_replies
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.grin_stories s WHERE s.id = story_id AND s.expires_at > now()));
DROP POLICY IF EXISTS grin_story_replies_insert_self ON public.grin_story_replies;
CREATE POLICY grin_story_replies_insert_self ON public.grin_story_replies
  FOR INSERT TO authenticated
  WITH CHECK (
    author_id = (SELECT auth.uid())
    AND EXISTS (SELECT 1 FROM public.grin_stories s WHERE s.id = story_id AND s.expires_at > now() AND s.author_id <> (SELECT auth.uid()))
  );
CREATE INDEX IF NOT EXISTS grin_story_replies_story_created_idx ON public.grin_story_replies(story_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.grin_notify_story_reply()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE story_owner uuid;
BEGIN
  SELECT author_id INTO story_owner FROM public.grin_stories WHERE id = NEW.story_id;
  IF story_owner IS NOT NULL AND story_owner <> NEW.author_id THEN
    INSERT INTO public.grin_notifications(user_id, actor_id, kind, story_id, body)
    VALUES (story_owner, NEW.author_id, 'status_reply', NEW.story_id, 'replied to your status: ' || left(NEW.body, 140));
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS grin_story_reply_notification ON public.grin_story_replies;
CREATE TRIGGER grin_story_reply_notification
AFTER INSERT ON public.grin_story_replies
FOR EACH ROW EXECUTE FUNCTION public.grin_notify_story_reply();

-- The existing storage bucket only allowed image/video files, which rejected voice notes.
UPDATE storage.buckets
SET allowed_mime_types = ARRAY['image/*','video/*','audio/*']::text[]
WHERE id = 'grin-media';
