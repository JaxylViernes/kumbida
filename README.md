# Digital Wedding Invitation

An interactive, mobile-first wedding invitation: guests tap a wax-sealed envelope, the seal breaks, the flap opens, and the card slides out. They then turn through seven printed "inserts": Invitation, Our Story, Details, Entourage, Dress Code, RSVP, and Until Then.

Built with React, Vite, TypeScript, Tailwind CSS, Framer Motion and Lucide. Supabase is optional and only used for RSVPs.

## Run it

```bash
npm install
npm run dev       # http://localhost:5173 (also on your LAN, so you can open it on your phone)
npm run build     # production build in dist/
```

Deploy `dist/` to any static host, such as Netlify, Vercel, Cloudflare Pages or GitHub Pages.

## Personalise it

**Every word, date, name, color and setting lives in [`src/config/invitation.ts`](src/config/invitation.ts).** All of the current content is sample text. Replace it before sending.

| What | Where in the config |
| --- | --- |
| Couple names and seal initials | `couple` |
| Date, time and countdown target | `wedding` (set `iso` with the venue's UTC offset) |
| Envelope and invitation wording | `wording` |
| Love story and photos | `story.moments[].photo`. Put images in `public/photos/` and use `'/photos/x.jpg'`. Leave the field empty to show an illustrated placeholder. |
| Venues and Google Maps links | `details.ceremony` / `details.reception` |
| Entourage | `entourage` |
| Dress code swatches | `dressCode` |
| RSVP deadline and default seats | `rsvp` |
| Music | `music.src` (for example `'/music/ambient.mp3'`). Leave it empty to play a soft generated music-box melody. |
| Palette and wax color | `theme` |

Photos: use JPG/WebP at about 800px wide so the invitation loads quickly on mobile data.

### Personal links

```
https://your-site.com/?to=Maria%20Santos&seats=2
```

- `to`: shown on the envelope ("Prepared for Maria Santos") and pre-filled in the RSVP form.
- `seats`: the maximum number of guests for this invitation. If it's missing, `rsvp.maxGuests` is used.

## RSVP storage (Supabase)

Without configuration the RSVP runs in **preview mode**: replies are saved only in that guest's browser, and a small note on the card says so.

To collect replies:

1. Create a Supabase project and run [`supabase/schema.sql`](supabase/schema.sql) in its SQL editor.
2. Copy `.env.example` to `.env` and fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. Rebuild. Read the replies in the Supabase table editor.

Protections:
- Guests can only **insert**. Row-level security stops anyone from reading the guest list.
- **Duplicates are blocked** two ways: a unique index on the normalized name (titles, accents, case and spacing are ignored), and each device remembers its own reply.
- Fields are validated on the client and by database constraints.
- A hidden honeypot field quietly drops bot submissions.

## Keepsake features

| Feature | How it works / where to edit |
| --- | --- |
| **Intro film** | Plays after the envelope opens and can always be skipped. Set `intro.video` to an MP4 (H.264, muted, ≤ 20 s, ≤ 4 MB). If it's empty, an animated typographic film plays instead. Guests can rewatch it from the last page. Set `intro.enabled: false` to remove it. |
| **Vinyl song player** | `music.title` / `music.artist` / `music.src`. It's fixed to the corner and is never interrupted by page turns. |
| **Save the Date** | A paper calendar circles the date in ink and a rose blooms beside it, with a live countdown. "Add to calendar" offers a Google Calendar link and an `.ics` download for Apple and Outlook (`calendar`). |
| **Scrapbook** | Draggable Polaroids and a ticket stub (`story.collage`, `story.ticket`), diary notes (`story.moments`), a film strip of moments (`story.film`), and a folded proposal letter that opens on tap (`story.letter`). |
| **Photo / video / voice moments** | Each `story.film` item can take a `photo`, a `video` (MP4, ~10 s, 720p) and/or a `voice` (MP3/M4A). Media load only when the frame is opened, and the music pauses while the couple speaks. |
| **Secrets** | The gold heart on the invitation, the pressed flower in the scrapbook, and the tiny envelope at the foot of the entourage each open a note. A fourth sealed note appears on the last page once every page has been viewed. Write them in `secrets`. |
| **Guestbook** | A handwritten note card with a writing animation and a heart stamp. Messages are private to the couple, and each guest chooses whether the couple may share theirs. Notes with links are blocked, and each device can leave at most 3 (`guestbook`). |
| **Personal greeting** | `?to=Name` adds a handwritten "Dear Name…" line to the invitation (`greeting.line`). |
| **Time-aware** | Before the wedding: the full invitation. On the day: a "Today is the day" greeting and schedule (`weddingDay`). Afterwards: a thank-you card with photos (`thankYou`). Which pages appear in each mode is set in `pageOrder`. |

**Preview each mode** with `?preview=before`, `?preview=day` or `?preview=after`.

**Supabase:** [`supabase/schema.sql`](supabase/schema.sql) now creates both `rsvps` and `guestbook`. Both are insert-only for guests; read them in the Supabase dashboard.

## Notes

- Music never autoplays. Guests start it with the button in the corner. Setting `music.startOnOpen: true` starts it when the envelope is tapped, which counts as a user gesture.
- Pages turn by swipe, arrow buttons, roman-numeral tabs or the keyboard arrow keys. Swipes that begin on form fields or buttons are ignored, so filling in the RSVP never turns the page by accident.
- Motion is reduced automatically when the device has "reduce motion" turned on.
