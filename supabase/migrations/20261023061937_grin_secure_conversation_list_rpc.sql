-- Return only the signed-in user's own conversations, with safe peer display details.
CREATE OR REPLACE FUNCTION public.grin_get_my_conversation_list()
RETURNS TABLE (
  conversation_id uuid,
  conversation_title text,
  conversation_kind text,
  peer_id uuid,
  peer_username text,
  peer_display_name text,
  peer_avatar_url text,
  last_message_body text,
  last_message_media_type text,
  last_message_at timestamptz,
  joined_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    c.id,
    c.title,
    c.kind,
    CASE WHEN c.kind = 'direct' THEN peer.user_id ELSE NULL END,
    p.username,
    p.display_name,
    p.avatar_url,
    lm.body,
    lm.media_type,
    lm.created_at,
    mine.joined_at
  FROM public.grin_conversation_members mine
  JOIN public.grin_conversations c ON c.id = mine.conversation_id
  LEFT JOIN LATERAL (
    SELECT cm.user_id
    FROM public.grin_conversation_members cm
    WHERE cm.conversation_id = c.id AND cm.user_id <> auth.uid()
    ORDER BY cm.joined_at ASC
    LIMIT 1
  ) peer ON true
  LEFT JOIN public.grin_profiles p ON p.id = peer.user_id
  LEFT JOIN LATERAL (
    SELECT msg.body, msg.media_type, msg.created_at
    FROM public.grin_messages msg
    WHERE msg.conversation_id = c.id
    ORDER BY msg.created_at DESC
    LIMIT 1
  ) lm ON true
  WHERE mine.user_id = auth.uid()
  ORDER BY COALESCE(lm.created_at, c.created_at, mine.joined_at) DESC;
$$;
REVOKE EXECUTE ON FUNCTION public.grin_get_my_conversation_list() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.grin_get_my_conversation_list() TO authenticated;
