# Shaffers Abroad — Trip Highlight Film (plan of record)

Single polished trip video. Planning doc; update as we lock decisions.

## Locked decisions (2026-06-05)
- **Length:** tight highlight, 3–4 min (target ~3:30).
- **Music:** warm & nostalgic (gentle piano/strings, intimate). Source a royalty-free cinematic track; AI-generated score only if Jason wants custom.
- **AI motion clips:** a few, tasteful — open + a couple of chapter bridges only. Real photos are the heart.
- **Audience:** family & close friends — shareable, lightly contextualized, still personal.
- **Tone:** quiet, observational, intimate (introvert aesthetic; no broadcast energy). No embellishment — only what happened.

## Toolchain (all confirmed available 2026-06-05)
- **Remotion** (React video engine) — already used for the weekly manager videos at `~/code/weekly-focus-video`. Ken Burns, @remotion/transitions, captions, google-fonts, media-utils, MapLibre+Turf map animation supported. Reuse `kinetic.tsx`, theme system, RecapVideo/manifest audio-sync pattern.
- **Voices:** Gemini `gemini-3.1-flash-tts-preview` multi-speaker (Charon "Daniel" + Sulafat "Maya"), director profile + tags. See `gemini_tts_recipe` memory. Key = `GEMINI_API_KEY`.
- **Imagen 4** (`imagen-4.0-generate-001`) — title card, vintage Mediterranean map, chapter dividers, end card.
- **Gemini image** (`gemini-2.5-flash-image`) — quick stylized frames/touch-ups.
- **Veo 3.1** (`veo-3.1-generate-preview`) — short cinematic motion clips (open drift over sea, MSM sweep). Use sparingly.
- **Antigravity CLI** (`~/.local/bin/agy -p "…"`) — Gemini-powered visual assistant; delegate image/visual tasks. Smoke-tested OK.
- **Assets:** 137 trip photos in `images/` (gen 19, nor 17, casa 16, lisbon 14, seville 12, ali 12, mrs 10, men 10, mad 10, par 4, +ship/jfk/gulf); 9 murals (days 2,4,5,7,8,9,10,11,12 — days 0,1,3,6 have none); ffmpeg.
- **Music fallback:** `~/code/weekly-focus-video/public/music-bed*.mp3` (corporate; prefer a warmer travel track).

## Visual system
- **Spine:** animated vintage route map (Texas → Casablanca → Málaga → Cádiz/Seville → Lisbon → at sea → Alicante → Menorca → Sardinia → Genoa → Marseille → Paris → Normandy). Route line draws progressively, recurs between chapters, fully drawn at the close.
- **Chapter cards:** the murals.
- **Photos:** slow Ken Burns; ~40–50 strongest of the 137, ordered to the script.
- **Motion clips:** open (sea at dawn), 1 mid-bridge (ship at sea), close (MSM / sweeping sea).
- **Type:** Cormorant Garamond + Caveat + Special Elite (match the site).

## Arc (~3:30)
1. Open 0:00–0:20 — sea-at-dawn clip, title card, music swell, hook (two weeks; completes all seven continents).
2. The leap 0:20–0:40 — Texas→Africa; route begins. Casablanca: 7th continent, medina, spectacle.
3. Voyage west 0:40–1:25 — board ship; Seville cathedral; Lisbon pastries + trams.
4. Islands & Italy 1:25–2:05 — Guadalest, Menorca, Sardinia turquoise + gelato, Genoa in rain.
5. France crescendo 2:05–2:50 — Marseille→Paris (Lionel Richie cabbie, a smile), Normandy (weight), Mont Saint-Michel from the bay.
6. Close 2:50–3:20 — pull back to full route on the map; seven continents, two weeks, the two of them. End card.

## Production steps
1. Write film narration script (two-voice, ~3:30, flowing arc — NOT the 13 daily recaps). → Jason approves in chat.
2. Generate narration audio (voices); measure segment durations → manifest.
3. Curate photo shortlist (~40–50) ordered to script; fix any orientation.
4. Generate AI cards (Imagen: title, map, chapter dividers, end) + 2–3 Veo clips.
5. Build animated route map.
6. Assemble in Remotion: scenes timed to narration manifest, Ken Burns, transitions, murals, music bed with ducking/swells.
7. Render, review, revise, deliver. Decide separately whether it goes on the trip site.

## Open items
- Music: pick the specific track (warm nostalgic) — free library vs custom.
- Confirm script before any production spend.
