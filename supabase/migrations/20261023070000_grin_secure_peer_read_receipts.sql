-- Expose only a direct-chat peer's read timestamp to the other member.
-- Membership and peer identity are verified inside the function because RLS
-- intentionally allows clients to select only their own membership row.
CREATE OR REPLACE FUNCTION public.grin_get_peer_read_at(p_conversation_id uuid, p_peer_id uuid)
RETURNS timestamptz
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT peer.last_read_at
  FROM public.grin_conversation_members AS peer
  JOIN public.grin_conversations AS conv
    ON conv.id = peer.conversation_id
  WHERE peer.conversation_id = p_conversation_id
    AND peer.user_id = p_peer_id
    AND p_peer_id <> (SELECT auth.uid())
    AND conv.kind = 'direct'
    AND EXISTS (
      SELECT 1
      FROM public.grin_conversation_members AS mine
      WHERE mine.conversation_id = p_conversation_id
        AND mine.user_id = (SELECT auth.uid())
    )
  LIMIT 1;
$$;

REVOKE EXECUTE ON FUNCTION public.grin_get_peer_read_at(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.grin_get_peer_read_at(uuid, uuid) TO authenticated;
