// Live translator — session minter.
//
// The browser can't hold the real OpenAI key, so this hands it a short-lived
// "ephemeral" key (good for ~1 minute) that's only usable to open a live
// Realtime connection. The long-lived OPENAI_API_KEY never leaves the server.

export const config = { path: "/api/session" };

const REALTIME_MODEL = process.env.OPENAI_REALTIME_MODEL || "gpt-realtime";
const ALLOWED_TARGETS = ["English", "French", "Spanish"];

export default async (req: Request): Promise<Response> => {
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return json({ error: "Live translator is not configured (missing API key)." }, 500);
  }

  let body: any = {};
  try { body = await req.json(); } catch { /* default target below */ }
  const target = ALLOWED_TARGETS.includes(body?.target) ? body.target : "English";

  const instructions =
    `You are a simultaneous interpreter for a traveler. Listen to speech in any ` +
    `language and continuously output ONLY its translation into ${target}. ` +
    `Output just the translated text — no commentary, no labels, no quotes, no ` +
    `speaker names. If the speech is already in ${target}, repeat it unchanged.`;

  try {
    // GA Realtime: mint an ephemeral client secret with the session config baked in.
    const r = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session: {
          type: "realtime",
          model: REALTIME_MODEL,
          instructions,
          output_modalities: ["text"],
          audio: {
            input: {
              transcription: { model: "gpt-4o-mini-transcribe" },
              turn_detection: { type: "server_vad", silence_duration_ms: 600 },
            },
          },
        },
      }),
    });

    if (!r.ok) {
      const detail = await r.text();
      console.error("Realtime session failed:", r.status, detail);
      return json({ error: "Could not start the live session." }, 502);
    }

    const data = await r.json();
    const value = data?.value ?? data?.client_secret?.value;
    if (!value) {
      console.error("Realtime session: no ephemeral key in response", JSON.stringify(data).slice(0, 300));
      return json({ error: "Live session response was incomplete." }, 502);
    }

    return json({
      client_secret: value,
      expires_at: data?.expires_at ?? data?.client_secret?.expires_at ?? null,
      model: REALTIME_MODEL,
    });
  } catch (e) {
    console.error("Realtime session error:", e);
    return json({ error: "Live translator had trouble starting." }, 502);
  }
};

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
