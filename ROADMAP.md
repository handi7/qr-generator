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
| 3   | Scan a QR code to prefill Studio      | M      | next    |
| 4   | Persist the uploaded logo             | S      |         |
| 5   | Saved QR list                         | L      |         |

Scanning is next because the codecs it needs are already in place — only the
decoder and its UI are missing. The saved list stays last: it needs the storage
layer, and the logo fix has to land first or saved codes would lose their logo.

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

### Not covered by a codec

The free-text form stays inline in `app/studio/configuration.tsx`: it is a
single field bound directly to `text`, so the hook would add nothing.
`textCodec` still supplies its `defaultText` and its place in detection.

## Foundation

- [ ] **Persist the uploaded logo** — `store.ts` currently holds
      `URL.createObjectURL(file)`. A blob URL dies on reload and never reaches
      the query string, so a saved QR would silently lose its logo and a shared
      link would render without it. Store the image as a `Blob` in IndexedDB
      (via `idb-keyval`) keyed by id; avoid localStorage, where base64 logos
      quickly hit the ~5MB quota.

## Studio Features

- [ ] **Scan a QR code to prefill Studio** — decode an existing QR and load it
      into Studio for restyling. The codec side is done; what's left is the
      decoder and the UI.

  - Ship **file upload, clipboard paste and drag-and-drop first**; camera
    capture second. File decoding is ~30 lines (image → canvas →
    `getImageData` → decode), works in every browser, needs no permission, and
    covers the most common case: restyling a QR you already have a screenshot
    or photo of. Camera needs HTTPS, a permission prompt, `playsInline` +
    `muted` for iOS, and careful track cleanup on unmount.
  - Use the native `BarcodeDetector` when available, with a lazily imported
    `jsqr` fallback for Safari and Firefox. The decoder must sit behind a
    dynamic import — most visitors never scan, so it should stay out of the
    main Studio bundle.
  - Feed the decoded string to `detectCodec()`, then write
    `?template=<codec.key>` plus `text` (and the codec's own params, if it has
    them) — `usePayloadForm` picks it up from there. Unrecognized payloads land
    on free text by design, not as an error.
  - Treat decoded content as untrusted: render it as text first and never
    auto-navigate, so the user sees what they scanned before clicking. Keep
    `rel="noopener noreferrer"` on the rendered link in
    `components/link-or-text.tsx`.

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
  - Persist with Zustand's `persist` middleware pointed at an
    `idb-keyval`-backed custom storage, so metadata and logo blobs share one
    store.
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
- **Camera-first scanning** — more effort and narrower reach than file upload
  and paste. Kept as the second step of the scan feature, not the entry point.
- **Logos in shared links** — an image can't be encoded in a URL. Studio says
  so explicitly when a logo is set. A remote-logo `img_url` param could carry
  one later, at the cost of depending on someone else's hosting.

## Other Ideas

- [ ] **Tests for the codecs.** They are pure functions with a lot of edge
      cases (escaping, field order, round-trips) and are the foundation the
      scan feature sits on; a throwaway script written during the refactor
      already caught a real parsing bug. Needs a decision on the runner —
      `tsx` plus a plain assertion script is the smallest thing that works and
      matches the project's zero-test-infra starting point.
- [ ] Logo upload presets in Studio (common social icons as embedded logos).
- [ ] Shareable template gallery — curated style presets encoded as Studio
      URLs, since every style setting already lives in the URL.
- [ ] Compress the Studio state into a single `?d=` param (deflate +
      base64url). Long vCard payloads produce URLs that some chat apps
      truncate when shared.
- [ ] Rename `hokks/` to `hooks/`. Four files and a handful of importers
      today — cheapest to fix before that count grows.
