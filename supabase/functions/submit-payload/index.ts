import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const BACKEND_URL = Deno.env.get("FASTAPI_BACKEND_URL") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

interface RelayRequest {
  keyId: string;
  iv: string;
  salt: string;
  encryptedData: string;
  deviceType: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  let body: RelayRequest;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  if (!body.keyId || !body.iv || !body.salt || !body.encryptedData) {
    return new Response(
      JSON.stringify({ error: "Missing required fields: keyId, iv, salt, encryptedData" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  const { data: trackingRow } = await supabase
    .from("submission_tracking")
    .insert({
      key_id: body.keyId,
      status: "pending",
      device_type: body.deviceType || null,
    })
    .select()
    .single();

  try {
    if (!BACKEND_URL) {
      throw new Error("Backend URL is not configured. Set FASTAPI_BACKEND_URL as an edge function secret.");
    }

    const backendResponse = await fetch(`${BACKEND_URL}/submissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        keyId: body.keyId,
        iv: body.iv,
        salt: body.salt,
        encryptedData: body.encryptedData,
        submittedAt: new Date().toISOString(),
        deviceType: body.deviceType,
      }),
    });

    if (!backendResponse.ok) {
      let reason = `Backend returned ${backendResponse.status}`;
      try {
        const errorBody = await backendResponse.json();
        if (errorBody?.reason) reason = errorBody.reason;
        else if (errorBody?.error) reason = errorBody.error;
      } catch {
        /* no JSON body */
      }

      await supabase
        .from("submission_tracking")
        .update({ status: "rejected", error_reason: reason })
        .eq("id", trackingRow?.id);

      return new Response(
        JSON.stringify({ status: "rejected", reason }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await backendResponse.json();

    await supabase
      .from("submission_tracking")
      .update({
        status: "accepted",
        server_export_doc_ref: result.exportDocRef || null,
        server_crm_ref: result.crmRef || null,
      })
      .eq("id", trackingRow?.id);

    return new Response(
      JSON.stringify({
        status: "accepted",
        exportDocRef: result.exportDocRef,
        crmRef: result.crmRef,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown relay error";

    await supabase
      .from("submission_tracking")
      .update({ status: "error", error_reason: message })
      .eq("id", trackingRow?.id);

    return new Response(
      JSON.stringify({ status: "rejected", reason: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
