// Live translator — session minter.
//
// The browser can't hold the real OpenAI key, so this hands it a short-lived
// "ephemeral" key (good for ~1 minute) that's only usable to open a live
// Realtime connection. The long-lived OPENAI_API_KEY never leaves the server.
//
// This uses OpenAI's dedicated live-translation model (gpt-realtime-translate,
// May 2026). Unlike the old conversational model, it does NOT wait for the
// speaker to pause: it auto-detects the spoken language (70+ supported) and
// streams a running translation — both spoken audio and text — into the chosen
// output language while the person keeps talking. Perfect for a tour guide who
// never stops to take a breath.

export const config = { path: "/api/session" };

const TRANSLATE_MODEL = process.env.OPENAI_TRANSLATE_MODEL || "gpt-realtime-translate";
const TRANSCRIBE_MODEL = process.env.OPENAI_TRANSLATE_TRANSCRIBE_MODEL || "gpt-realtime-whisper";

// The 13 output languages gpt-realtime-translate can produce.
const ALLOWED_OUTPUT = new Set([
  "en", "es", "fr", "de", "it", "pt", "ja", "ko", "zh", "hi", "ru", "id", "vi",
]);

export default async (req: Request): Promise<Response> => {
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return json({ error: "Live translator is not configured (missing API key)." }, 500);
  }

  let body: any = {};
  try { body = await req.json(); } catch { /* default below */ }
  const language = ALLOWED_OUTPUT.has(body?.target) ? body.target : "en";

  try {
    // Mint an ephemeral client secret for a translation session. This uses the
    // dedicated /translations endpoint and a translation-shaped body (no
    // turn_detection, no instructions, no output_modalities) — the model runs
    // continuously on the incoming audio stream. The spoken translation comes
    // back as audio; the matching text transcript streams over the data channel.
    const r = await fetch("https://api.openai.com/v1/realtime/translations/client_secrets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session: {
          model: TRANSLATE_MODEL,
          audio: {
            input: {
              transcription: { model: TRANSCRIBE_MODEL },
              noise_reduction: null,
            },
            output: {
              language,
            },
          },
        },
      }),
    });

    if (!r.ok) {
      const detail = await r.text();
      console.error("Realtime translation session failed:", r.status, detail);
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
      model: TRANSLATE_MODEL,
    });
  } catch (e) {
    console.error("Realtime translation session error:", e);
    return json({ error: "Live translator had trouble starting." }, 502);
  }
};

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
