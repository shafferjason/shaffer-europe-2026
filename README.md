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

### Adding a voice note (audio postcard)

1. Drop your MP3 into the `audio/` folder. Suggested naming: `day-5-cadiz.mp3`.
2. In `data.js`, on that day, set `audio` to the path:

```javascript
audio: "audio/day-5-cadiz.mp3",
```

It will show up as a player on both the day page and in the Postcards Home section on the homepage.

### Writing a journal entry for a day

In `data.js`, set the day's `journal` field. Double line breaks become paragraphs.

## The private (logistics) side

Open `private.html`. Near the top there's a line:

```javascript
const PASSWORD = 'rachel2026';
```

Change that to whatever password you and Rachel want. Anyone with the password sees the reservation details on `private.html`. **Note:** this is a soft lock for v1 — the data is in the public source, just hidden until the password matches. Fine for a personal family site; we can upgrade to real encryption if needed.

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
- `app.js` — homepage rendering (countdown, day cards, postcards)
- `images/` — trip photos
- `audio/` — voice notes
