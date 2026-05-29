// Speak-to-read translator helper.
//
// Receives a short audio clip from the browser, transcribes it with OpenAI,
// then translates the text into the chosen target language. Returns both the
// original transcription and the translation as JSON.
//
// The OPENAI_API_KEY never leaves the server — the browser only ever talks to
// this function, never directly to OpenAI.

export const config = { path: "/api/translate" };

const TRANSCRIBE_MODEL = process.env.OPENAI_TRANSCRIBE_MODEL || "gpt-4o-transcribe";
const TRANSLATE_MODEL = process.env.OPENAI_TRANSLATE_MODEL || "gpt-4o-mini";
const ALLOWED_TARGETS = ["English", "French", "Spanish", "Italian", "German", "Portuguese"];
const MAX_AUDIO_BYTES = 8 * 1024 * 1024; // ~8 MB — guards against oversized/abusive calls

export default async (req: Request): Promise<Response> => {
  const cors = corsHeaders(req.headers.get("origin"));

  // Browser permission check ("preflight") for cross-site calls (e.g. the
  // bespokes.ai mirror calling this Netlify engine).
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405, cors);
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return json({ error: "Translator is not configured (missing API key)." }, 500, cors);
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Bad request." }, 400, cors);
  }

  const { audioBase64, mimeType, target } = body || {};
  if (!audioBase64 || typeof audioBase64 !== "string") {
    return json({ error: "No audio received." }, 400, cors);
  }
  if (!ALLOWED_TARGETS.includes(target)) {
    return json({ error: "Unsupported target language." }, 400, cors);
  }

  let audioBytes: Buffer;
  try {
    audioBytes = Buffer.from(audioBase64, "base64");
  } catch {
    return json({ error: "Audio could not be read." }, 400, cors);
  }
  if (audioBytes.length === 0) {
    return json({ error: "Empty recording." }, 400, cors);
  }
  if (audioBytes.length > MAX_AUDIO_BYTES) {
    return json({ error: "Recording too long — keep it under ~30 seconds." }, 413, cors);
  }

  const ext = (mimeType && mimeType.includes("wav")) ? "wav"
            : (mimeType && mimeType.includes("mp4")) ? "mp4"
            : (mimeType && mimeType.includes("mpeg")) ? "mp3"
            : "webm";

  // Step 1 — transcribe the speech in whatever language it was spoken.
  let original = "";
  try {
    const form = new FormData();
    const blob = new Blob([audioBytes], { type: mimeType || "audio/webm" });
    form.append("file", blob, `clip.${ext}`);
    form.append("model", TRANSCRIBE_MODEL);
    form.append("response_format", "json");

    const r = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    });
    if (!r.ok) {
      const detail = await r.text();
      console.error("Transcription failed:", r.status, detail);
      return json({ error: "Could not understand the audio. Try again." }, 502, cors);
    }
    const data = await r.json();
    original = (data.text || "").trim();
  } catch (e) {
    console.error("Transcription error:", e);
    return json({ error: "Translator had trouble hearing that." }, 502, cors);
  }

  if (!original) {
    return json({ error: "Didn't catch any speech — try again." }, 200, cors);
  }

  // Step 2 — translate the transcription into the target language.
  let translation = "";
  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: TRANSLATE_MODEL,
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content:
              `You are a translator for travelers. Translate the user's text into ${target}. ` +
              `If it is already in ${target}, return it unchanged. ` +
              `Output ONLY the translation — no quotes, no notes, no explanation.`,
          },
          { role: "user", content: original },
        ],
      }),
    });
    if (!r.ok) {
      const detail = await r.text();
      console.error("Translation failed:", r.status, detail);
      return json({ error: "Could not translate that. Try again." }, 502, cors);
    }
    const data = await r.json();
    translation = (data.choices?.[0]?.message?.content || "").trim();
  } catch (e) {
    console.error("Translation error:", e);
    return json({ error: "Translator had trouble." }, 502, cors);
  }

  return json({ original, translation, target }, 200, cors);
};

// Allow the trip-site mirror (bespokes.ai) and the Netlify deploy to call this
// engine from the browser. Reflect the request's origin when it's one we trust.
function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = !!origin && (
    /(^|\.)netlify\.app$/.test(hostOf(origin)) ||
    /(^|\.)bespokes\.ai$/.test(hostOf(origin)) ||
    hostOf(origin) === "localhost" ||
    hostOf(origin) === "127.0.0.1"
  );
  return {
    "Access-Control-Allow-Origin": allowed ? (origin as string) : "https://shaffers-abroad.netlify.app",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  };
}

function hostOf(origin: string): string {
  try { return new URL(origin).hostname; } catch { return ""; }
}

function json(payload: unknown, status = 200, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json", ...extra },
  });
}
