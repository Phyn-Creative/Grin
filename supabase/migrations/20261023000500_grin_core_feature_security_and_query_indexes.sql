-- GRIN production hardening and query indexes.
-- Safe to re-run: all indexes use IF NOT EXISTS and grants are idempotent.

-- Keep privileged trigger functions out of the client-callable RPC surface.
REVOKE EXECUTE ON FUNCTION public.grin_handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Direct conversation creation requires a signed-in caller; never expose it to anonymous clients.
REVOKE EXECUTE ON FUNCTION public.grin_create_direct_conversation(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.grin_create_direct_conversation(uuid) TO authenticated;

-- Cover foreign keys used by feed, messaging, marketplace, community, and business features.
CREATE INDEX IF NOT EXISTS businesses_user_id_fk_idx ON public.businesses(user_id);
CREATE INDEX IF NOT EXISTS generations_business_id_fk_idx ON public.generations(business_id);
CREATE INDEX IF NOT EXISTS generations_user_id_fk_idx ON public.generations(user_id);
CREATE INDEX IF NOT EXISTS grin_bookmarks_post_id_fk_idx ON public.grin_bookmarks(post_id);
CREATE INDEX IF NOT EXISTS grin_business_events_user_id_fk_idx ON public.grin_business_events(user_id);
CREATE INDEX IF NOT EXISTS grin_business_leads_user_id_fk_idx ON public.grin_business_leads(user_id);
CREATE INDEX IF NOT EXISTS grin_business_members_user_id_fk_idx ON public.grin_business_members(user_id);
CREATE INDEX IF NOT EXISTS grin_business_verification_requests_business_id_fk_idx ON public.grin_business_verification_requests(business_id);
CREATE INDEX IF NOT EXISTS grin_communities_owner_id_fk_idx ON public.grin_communities(owner_id);
CREATE INDEX IF NOT EXISTS grin_community_posts_author_id_fk_idx ON public.grin_community_posts(author_id);
CREATE INDEX IF NOT EXISTS grin_conversations_created_by_fk_idx ON public.grin_conversations(created_by);
CREATE INDEX IF NOT EXISTS grin_creator_earnings_creator_id_fk_idx ON public.grin_creator_earnings(creator_id);
CREATE INDEX IF NOT EXISTS grin_job_applications_applicant_id_fk_idx ON public.grin_job_applications(applicant_id);
CREATE INDEX IF NOT EXISTS grin_jobs_poster_id_fk_idx ON public.grin_jobs(poster_id);
CREATE INDEX IF NOT EXISTS grin_marketplace_listings_seller_id_fk_idx ON public.grin_marketplace_listings(seller_id);
CREATE INDEX IF NOT EXISTS grin_marketplace_saved_user_id_fk_idx ON public.grin_marketplace_saved(user_id);
CREATE INDEX IF NOT EXISTS grin_message_reactions_user_id_fk_idx ON public.grin_message_reactions(user_id);
CREATE INDEX IF NOT EXISTS grin_messages_sender_id_fk_idx ON public.grin_messages(sender_id);
CREATE INDEX IF NOT EXISTS grin_notifications_actor_id_fk_idx ON public.grin_notifications(actor_id);
CREATE INDEX IF NOT EXISTS grin_notifications_conversation_id_fk_idx ON public.grin_notifications(conversation_id);
CREATE INDEX IF NOT EXISTS grin_notifications_post_id_fk_idx ON public.grin_notifications(post_id);
CREATE INDEX IF NOT EXISTS grin_poll_votes_option_id_fk_idx ON public.grin_poll_votes(option_id);
CREATE INDEX IF NOT EXISTS grin_poll_votes_poll_option_fk_idx ON public.grin_poll_votes(poll_id, option_id);
CREATE INDEX IF NOT EXISTS grin_poll_votes_user_id_fk_idx ON public.grin_poll_votes(user_id);
CREATE INDEX IF NOT EXISTS grin_post_reactions_user_id_fk_idx ON public.grin_post_reactions(user_id);
CREATE INDEX IF NOT EXISTS grin_post_shares_post_id_fk_idx ON public.grin_post_shares(post_id);
CREATE INDEX IF NOT EXISTS grin_post_shares_user_id_fk_idx ON public.grin_post_shares(user_id);
CREATE INDEX IF NOT EXISTS grin_stories_author_id_fk_idx ON public.grin_stories(author_id);
CREATE INDEX IF NOT EXISTS grin_user_blocks_blocked_id_fk_idx ON public.grin_user_blocks(blocked_id);
CREATE INDEX IF NOT EXISTS grin_user_reports_reported_user_id_fk_idx ON public.grin_user_reports(reported_user_id);
CREATE INDEX IF NOT EXISTS grin_user_reports_reporter_id_fk_idx ON public.grin_user_reports(reporter_id);
CREATE INDEX IF NOT EXISTS saved_content_business_id_fk_idx ON public.saved_content(business_id);
CREATE INDEX IF NOT EXISTS saved_content_generation_id_fk_idx ON public.saved_content(generation_id);
CREATE INDEX IF NOT EXISTS saved_content_user_id_fk_idx ON public.saved_content(user_id);
