import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-grin-webhook-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(JSON.stringify({ error: "Supabase server credentials are unavailable" }), {
      status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const suppliedSecret = req.headers.get("x-grin-webhook-secret");
  const { data: expectedSecret, error: secretError } = await supabase.rpc("get_grin_push_webhook_secret");
  if (secretError || !expectedSecret || !suppliedSecret || suppliedSecret !== expectedSecret) {
    return new Response(JSON.stringify({ error: "Unauthorized webhook" }), {
      status: secretError ? 503 : 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data: vapidConfig, error: vapidError } = await supabase.rpc("get_grin_vapid_config");
  const publicKey = vapidConfig?.public_key;
  const privateKey = vapidConfig?.private_key;
  const subject = vapidConfig?.subject;
  if (vapidError || !publicKey || !privateKey || !subject) {
    console.error("GRIN VAPID configuration unavailable:", vapidError);
    return new Response(JSON.stringify({ error: "VAPID push keys are not configured in Vault" }), {
      status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let event: any;
  try { event = await req.json(); } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const row = event?.record;
  const userId = row?.user_id;
  if (event?.type !== "INSERT" || event?.table !== "grin_notifications" || !userId) {
    return new Response(JSON.stringify({ skipped: true }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    webpush.setVapidDetails(subject, publicKey, privateKey);
    const { data: subscriptions, error } = await supabase
      .from("grin_push_subscriptions")
      .select("id, endpoint, subscription")
      .eq("user_id", userId);
    if (error) throw error;
    if (!subscriptions?.length) {
      return new Response(JSON.stringify({ sent: 0, reason: "No subscriptions" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const kind = String(row.kind || "activity").replaceAll("_", " ");
    const payload = JSON.stringify({
      title: "GRIN",
      body: String(row.body || `New ${kind} notification`).slice(0, 180),
      url: "/?source=push",
      tag: row.id ? `grin-${row.id}` : "grin-activity",
    });

    const results = await Promise.allSettled(subscriptions.map(async (item: any) => {
      try {
        await webpush.sendNotification(item.subscription, payload, { TTL: 3600 });
        return true;
      } catch (error: any) {
        if (error?.statusCode === 404 || error?.statusCode === 410) {
          await supabase.from("grin_push_subscriptions").delete().eq("id", item.id);
        }
        throw error;
      }
    }));

    return new Response(JSON.stringify({
      sent: results.filter((result) => result.status === "fulfilled").length,
      attempted: results.length,
    }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("GRIN push delivery failed:", error);
    return new Response(JSON.stringify({ error: "Push delivery failed" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
