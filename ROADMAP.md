# GaweQR Roadmap

Planned improvements for GaweQR. Items are ordered by priority within each
section. Contributions and suggestions are welcome — open an issue to discuss.

## Guiding constraint

GaweQR is fully client-side with no backend, and **the entire state of a QR
code lives in the URL query string** (template, content, colors, dot types,
size, margin). Every feature below is designed to preserve that: a URL is a
complete, portable QR definition, and no user data ever leaves the device.

## Delivery order

| #   | Work                                  | Effort | Status  |
| --- | ------------------------------------- | ------ | ------- |
| 1   | Share as image + Copy link            | S      | shipped |
| 2   | Payload codec registry + parser fixes | M      | shipped |
| 3   | Scan a QR code to prefill Studio      | M      | shipped |
| 4   | Persist the uploaded logo             | S      | shipped |
| 5   | Saved QR list                         | L      | next    |

Everything the saved list depends on is now in place: the URL already describes
a QR completely, and logos survive a reload in IndexedDB, so a saved code can
reference one instead of losing it.

## Architecture in place

What the shipped work established, and the invariants that keep it working.

### Payload codecs — `utils/payloads/`

One file per format, each implementing `PayloadCodec<TState>` from
`types/payload.type.ts`: `detect` / `parse` / `build`, plus optional
`toParams` / `fromParams`. `detectCodec(text)` in `utils/payloads/index.ts`
routes any payload to the template that owns it.

- **`detect()` must not claim payloads another codec owns.** `whatsapp` matches
  only known WhatsApp hosts, which is precisely what lets every other URL fall
  through to `text`. `text` is the catch-all and is consulted last.
- **The `WIFI:` parser must stay field-order independent and escape-aware.**
  Other generators emit `S:` before `T:`, and `\;` `\:` `\,` `\\` `\"` are
  legal inside an SSID or password. It is a hand-rolled tokenizer, not a regex,
  for exactly this reason.
- **The `WIFI:` build output is frozen** at `WIFI:T:…;S:…;P:…;;`, with an empty
  `T:` for an open network rather than the spec's `nopass`. Changing it would
  make QR codes generated from links already in the wild decode differently.
  Parsing accepts `nopass` as well.
- **`toParams` / `fromParams` exist only for `contact` and `email`.** Their
  `build()` returns an empty string until there is a full name / recipient, so
  without mirrored params a half-filled form would lose its content on reload.
  `wifi`, `whatsapp` and `text` always build a non-empty payload, so `text`
  alone preserves them — and their URLs stay short. Do not add mirrored params
  to a codec that does not need them.

### Form ↔ URL binding — `hokks/usePayloadForm.ts`

Every template form except free text uses this hook; new ones should too.

The form owns its state while the user types and writes to the URL on a
debounce. It reads back **only** when `text` changes for a reason that isn't its
own write — a pasted link, the back button, or a scanned payload. That guard
(`writtenRef`) is what makes a payload arriving after mount reach the fields,
and it is initialised to the current `text` rather than `null`: otherwise an
unrelated param change (moving a colour slider) mid-typing would pull stale
state back over what the user is entering.

### Share — `hokks/useShareQr.ts`

The PNG is regenerated eagerly on every QR change, not inside the click
handler, because Safari treats a long `await` between the click and
`navigator.share()` as a loss of user activation. The `File` is built at click
time from the cached blob so the filename field stays live without
invalidating the cache. Capability is probed after mount with a throwaway
`File` — Web Share only reports file support for a concrete file, and reading
`navigator` during render would desync hydration.

### Scanning — `utils/scan.utils.ts`, `components/scan-qr-dialog.tsx`

Four inputs: camera, file picker, drag-and-drop, clipboard paste. Two decoders:
the native `BarcodeDetector` where it exists, a **lazily imported** jsQR
everywhere else. Keep that import dynamic — jsQR is ~130KB and most visitors
never scan. `paramsForPayload()` turns a decoded payload into Studio params.

- **A scan keeps the style and replaces only the content.** `paramsForPayload`
  clears the content params of _every_ codec, not just the active one, so
  switching contact → wifi can't leave `full_name` stranded. Size, colours and
  margin are preserved on purpose: people scan a QR in order to restyle it.
- **`text` is stored exactly as scanned**, never rebuilt, so nothing the
  original payload encoded is quietly normalised away.
- **A decoded payload is untrusted input.** The dialog renders it as monospace
  text and never as a link, so nothing is one stray click from opening. In
  Studio, `components/link-or-text.tsx` makes only `http(s)` clickable — that
  regex is what keeps `javascript:` and `data:` inert — with
  `rel="noopener noreferrer"`.
- **The camera stream must be released on every exit path**: successful scan,
  Stop, closing the dialog, Escape, unmount. Cleanup is guarded by a local
  `cancelled` flag and re-checked _after_ `startCamera()` resolves, because the
  effect can be torn down while that await is still in flight — which is exactly
  what React StrictMode does in development. Get this wrong and the camera
  indicator stays lit.
- The camera loop reuses one canvas; one-off image decodes each get their own,
  so a paste arriving mid-scan can't overwrite pixels the other decode is about
  to read.

### Logo persistence — `utils/logo.utils.ts`, `store.ts`

The logo is a `Blob` in IndexedDB under a named store (`gaweqr` / `logos`), and
the app renders it through an object URL.

- **Use `del`, never `clear`.** `clear()` empties the whole store; the saved-QR
  list will live in the same database.
- **Revoke the previous object URL** whenever the logo is replaced or removed,
  or every logo swap leaks a blob for the lifetime of the document.
- **Every IndexedDB call is wrapped.** It is unavailable in some private-browsing
  modes and can be switched off entirely; `setImage` returns whether the write
  landed so the UI can say "added, but not saved" instead of lying.
- `restoreImage` claims its guard flag _before_ awaiting, so StrictMode's double
  effect can't mint two object URLs for the same blob.
- `createStore()` is safe at module scope: idb-keyval opens the database lazily
  on first access, so importing this from a client component doesn't break SSR.

### Not covered by a codec

The free-text form stays inline in `app/studio/configuration.tsx`: it is a
single field bound directly to `text`, so the hook would add nothing.
`textCodec` still supplies its `defaultText` and its place in detection.

## Studio Features

- [ ] **Saved QR list** (`/my-qr`) — create, save, rename and delete QR codes,
      stored on-device. Since the URL is the state, the record is small:

  ```ts
  interface SavedQr {
    id: string; // crypto.randomUUID()
    name: string;
    template: TemplateKey;
    params: string; // URLSearchParams.toString() — the whole Studio state
    logoKey?: string; // IndexedDB key
    thumbnail?: string; // small PNG data URL (~120px)
    createdAt: number;
    updatedAt: number;
  }
  ```

  - Restore is `router.push('/studio?' + params)`. Keep `?id=` in the Studio
    URL so Save updates the existing record instead of creating a duplicate.
  - **Do not mount one `QRCodeStyling` per list item** — 20 saved codes would
    mean 20 canvas renders. Generate a small PNG thumbnail once at save time
    from a throwaway instance
    (`new QRCodeStyling({ ...options, width: 120, height: 120 })` →
    `getRawData("png")`) and render a plain `<img>` in the list.
  - Persist into the database `utils/logo.utils.ts` already opens (`gaweqr`),
    in its own object store. Saving a QR that has a logo means copying the
    current `studio:logo` blob to a per-record key, so replacing the Studio logo
    later doesn't silently change every saved code that used it.
  - **Export / import JSON is part of this feature, not a follow-up.** Without
    accounts, clearing browser data wipes everything. Export also reinforces
    the product's position: the data never leaves the device.
  - Privacy: WiFi passwords and vCard details would sit in plaintext in
    browser storage, which is visible on a shared computer. Show a short
    notice and make deletion obvious.
  - Add a "My QR" entry to `components/Navbar.tsx`, next to Templates.

## New QR Templates

Each one is now four small pieces, all client-side:

1. a codec in `utils/payloads/<name>.ts` implementing `PayloadCodec`,
2. its registration in `utils/payloads/index.ts` (`codecs` map and, if it has a
   recognisable prefix, `DETECTION_ORDER` — before `textCodec`),
3. a form component in `components/` built on `usePayloadForm`,
4. entries in `constants/template.data.ts` (`templateOptions` for the picker,
   `templates` for the gallery card) and in `TemplateKey`.

### High priority — low effort, real demand

- [ ] **Location / Maps** — `geo:lat,lng` payload or a Google Maps share link.
      Useful for event invitations, store cards, and property flyers. Form:
      a Maps link field, or latitude/longitude inputs.
- [ ] **Phone Call** — `tel:+628123456789`. Single phone-number input; common
      on service banners and flyers.
- [ ] **SMS** — `SMSTO:+62812:Message body`. Phone number + message inputs;
      useful for businesses not on WhatsApp.
- [ ] **Social Profile** — Instagram / TikTok / LinkedIn / X. One template
      with a platform dropdown + username field that composes the profile
      URL. Frequently requested by small businesses for name cards and
      product packaging.

### Medium priority — more effort, but a differentiator

- [ ] **Calendar Event** — vEvent/ICS payload (`BEGIN:VEVENT … END:VEVENT`)
      with title, location, and start/end time. Scanning adds the event to
      the calendar — a great fit for wedding and event invitations. Needs a
      date-time picker, so the form is the most complex of the batch.
- [ ] **Google Review** — `https://search.google.com/local/writereview?placeid=…`.
      Popular with cafes and restaurants ("scan to rate us"). Form is a single
      Place ID / link field; the main work is explaining how to find the
      Place ID.

### Considered and rejected (for now)

- **QRIS / payments** — QRIS payloads follow the EMVCo standard and are issued
  by licensed payment providers; they can't legitimately be generated
  client-side.
- **MeCard** — duplicates the existing Contact vCard template.
- **Smart app-download link** (iOS/Android detection) — requires a redirect
  backend, which is outside the current static architecture.

## Out of scope (for now)

Architectural decisions, recorded so they don't get relitigated.

- **Accounts and cross-device sync** — a backend brings auth, rate limiting,
  hosting cost and personal-data obligations, in exchange for undermining the
  product's main claim: nothing is stored on our servers. Export / import JSON
  covers most of the need.
- **Short links** (`gaweqr.my.id/q/abc`) — needs a backend and permanent
  storage, and creates dead QR codes if the service ever stops.
- **Logos in shared links** — an image can't be encoded in a URL. Studio says
  so explicitly when a logo is set. A remote-logo `img_url` param could carry
  one later, at the cost of depending on someone else's hosting.

## Other Ideas

- [ ] **Tests for the pure logic.** The codecs, `paramsForPayload` and
      `logo.utils` are all pure or easily faked, and cover a lot of edge cases
      (escaping, field order, round-trips, store isolation). Throwaway scripts
      written while building them caught two real bugs — a WhatsApp URL parsed
      to the phone number `"send"`, and `clearLogo` wiping a whole IndexedDB
      store. Needs a decision on the runner: `tsx` plus plain assertion scripts
      is the smallest thing that works, with `fake-indexeddb` for the storage
      layer.
- [ ] Logo upload presets in Studio (common social icons as embedded logos).
- [ ] Shareable template gallery — curated style presets encoded as Studio
      URLs, since every style setting already lives in the URL.
- [ ] Compress the Studio state into a single `?d=` param (deflate +
      base64url). Long vCard payloads produce URLs that some chat apps
      truncate when shared.
- [ ] Rename `hokks/` to `hooks/`. Four files and a handful of importers
      today — cheapest to fix before that count grows.
