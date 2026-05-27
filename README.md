# Shaffers Abroad — Europe 2026

Trip site for Jason & Rachel's 15-day Europe trip (May 22 – June 5, 2026). Lives at https://bespokes.ai/shaffer-europe-2026/.

## The one file you edit: data.js

Everything you'd normally change — the day-by-day, "where they are now", reservations on the private side — lives in `data.js`. Edit it, commit, push.

### Updating "where we are now" (the live widget on the homepage)

Open `data.js`, find `whereNow`, change the three fields, save, commit:

```javascript
whereNow: {
  city: "Lisbon, Portugal",
  country: "Stop 2",
  note: "Sintra palaces today",
  updated: "2026-05-27",
},
```

### Adding photos to a day

1. Drop your images into the `images/` folder. Suggested naming: `day-6-lisbon-1.jpg`, `day-6-lisbon-2.jpg`.
2. In `data.js`, find that day, and list the filenames in `photos`:

```javascript
{
  id: "day-6",
  city: "Lisbon",
  ...
  photos: ["images/day-6-lisbon-1.jpg", "images/day-6-lisbon-2.jpg"],
}
```

The first photo becomes the card cover on the homepage; all photos show on the day's detail page.

### Writing a journal entry for a day

In `data.js`, set the day's `journal` field. Double line breaks become paragraphs.

### The Small Find (recommended — one per day)

One paragraph on the single weirdest, smallest, most specific object you noticed today. Photographed like a museum specimen card. Quiet, observational — fits the introvert energy of the site.

In `data.js` on any day, fill `smallFind`:

```javascript
smallFind: {
  number: "04",
  label: "Blue azulejo tile, Alfama",
  text: "Found a single hand-painted tile loose in a courtyard wall — a fishing boat, a bird, the date 1894 in faded script. Whoever made it is long gone. The tile is still there.",
  photo: "images/day-5-tile.jpg"
},
```

Leave any field blank to hide it. Empty `text` hides the whole block.

### Logging a meal (shows on the "Things we ate" page)

Each day has a `meals` list — every entry is one meal. Leave it as `[]` for a day with nothing notable.

```javascript
meals: [
  { place: "Time Out Market",          dish: "bacalhau croquettes + vinho verde", when: "lunch",   cost: "€18" },
  { place: "A Cevicheria",             dish: "tuna tartare + the special",         when: "dinner", cost: "€62" },
],
```

`place`, `dish`, `when`, and `cost` are all optional. Leave any of them blank if you didn't catch them.

### Postcard to a person (recommended — one per day)

A short typed note written TO one person by name — Jai, Noah, Rachel's mom, a friend. Three sentences is plenty. Feels like a letter, not a blog post.

In `data.js` on any day, fill `postcardTo`:

```javascript
postcardTo: {
  to: "Jai",
  text: "We had pastéis de nata for breakfast and your mother declared them better than any donut. There's a yellow tram outside the bakery that goes up the hill so steep it makes the cup tilt. I thought of you on the river walk — you'd have liked the light.\n\nWe'll be home soon.",
  signoff: "— Dad"
},
```

Two newlines (`\n\n`) make a paragraph break.

## The private (logistics) side

Open `private.html`. Near the top there's a line:

```javascript
const PASSWORD = 'rachel2026';
```

Change that to whatever password you and Rachel want. Anyone with the password sees the reservation details on `private.html`. **Note:** this is a soft lock for v1 — the data is in the public source, just hidden until the password matches. Fine for a personal family site; we can upgrade to real encryption if needed.

## The translator (`/translate`)

Two modes, both behind the same soft password:

- **Quick** (`translate.html`, served as `/translate`) — pick a target language (English / French / Spanish), tap the mic, speak; it transcribes one clip and shows the translation. One-shot. Helper: `netlify/functions/translate.mts` (`/api/translate`).
- **Live** (`live.html`) — a continuous interpreter. Hold an open connection to OpenAI's Realtime (GA) API over WebRTC and stream translated captions as people speak. The browser gets a short-lived ephemeral key from `netlify/functions/session.mts` (`/api/session`); the real key never reaches the browser. Output is text-only (`output_modalities: ["text"]`), translation accumulates line by line.

Unlike the rest of the site, the translator needs server-side helpers to keep the OpenAI key secret, so these pages are served by **Netlify**, not GitHub Pages. The main trip site stays on GitHub Pages and links out to the translator (button on `private.html`).

### Required environment variable

| Variable | Required | Purpose |
|---|---|---|
| `OPENAI_API_KEY` | **Yes** | Your OpenAI key, billing enabled. Set it in the Netlify site settings (Environment variables). **Never commit it.** |
| `OPENAI_TRANSCRIBE_MODEL` | No | Quick-mode speech-to-text model. Defaults to `gpt-4o-transcribe`. |
| `OPENAI_TRANSLATE_MODEL` | No | Quick-mode translation model. Defaults to `gpt-4o-mini`. |
| `OPENAI_REALTIME_MODEL` | No | Live-mode realtime model. Defaults to `gpt-realtime`. |

To run/test locally:

```bash
echo "OPENAI_API_KEY=sk-..." > .env   # .env is gitignored — never committed
netlify dev                            # serves the site + the /api/translate helper
```

Then open the local URL netlify prints and go to `/translate`.

**Cost control:** set a monthly usage limit in the OpenAI billing dashboard so the page (which is only behind a soft password) can't run up an unexpected bill.

## How updates go live

After editing files:

```bash
git add .
git commit -m "Update Lisbon photos"
git push
```

GitHub Pages picks it up within a minute or two.

## File map

- `index.html` — homepage
- `day.html` — individual day pages
- `private.html` — locked logistics side
- `style.css` — scrapbook styling
- `data.js` — **all content lives here**
- `app.js` — homepage rendering (countdown, day cards)
- `images/` — trip photos
- `translate.html` — quick speak-to-read translator page (served by Netlify as `/translate`)
- `live.html` — live streaming translator (continuous captions via OpenAI Realtime over WebRTC)
- `netlify/functions/translate.mts` — quick-mode helper (holds the OpenAI key, transcribes + translates one clip)
- `netlify/functions/session.mts` — live-mode helper (mints a short-lived key so the browser can open a Realtime connection)
- `netlify.toml` — Netlify config for the translator add-on
