# GaweQR Roadmap

Planned improvements for GaweQR. Items are ordered by priority within each
section. Contributions and suggestions are welcome — open an issue to discuss.

## Guiding constraint

GaweQR is fully client-side with no backend, and **the entire state of a QR
code lives in the URL query string** (template, content, colors, dot types,
size, margin). Every feature below is designed to preserve that: a URL is a
complete, portable QR definition, and no user data ever leaves the device.

## Delivery order

The Studio features below depend on the foundation work. Suggested sequence:

| # | Work | Effort |
| - | ---- | ------ |
| 1 | Share as image + Copy link | S |
| 2 | Payload codec registry + parser fixes | M |
| 3 | Scan a QR code to prefill Studio | M |
| 4 | Persist the uploaded logo | S |
| 5 | Saved QR list | L |

Share ships first because it is self-contained and immediately visible. The
codec registry lands next because it unblocks both scanning and the six new
templates. The saved list comes last since it needs the storage layer and the
logo fix in place.

## Foundation

Not user-visible on their own, but every feature below depends on them.

- [ ] **Payload codec registry** — move the per-template `parse*` / `format*`
  helpers out of the form components into
  `utils/payloads/{text,wifi,whatsapp,contact,email}.ts` behind one shared
  interface:

  ```ts
  export interface PayloadCodec<T> {
    key: TemplateKey;
    detect(text: string): boolean;              // "WIFI:", "BEGIN:VCARD", "mailto:", wa.me
    parse(text: string): T | null;              // payload → form state
    build(state: T): string;                    // form state → payload
    toParams(state: T): Record<string, string>; // form state → query params
  }
  ```

  Today this logic is duplicated across four components using three different
  query-sync styles (`wifi-template.tsx`, `whatsapp-template.tsx` and
  `contact-template.tsx` each hand-roll `router.replace` + `searchParams`,
  while `email-template.tsx` uses `useQueryParams`). A single registry gives
  scan-to-prefill one dispatch point and reduces each new template to one file.

- [ ] **Persist the uploaded logo** — `store.ts` currently holds
  `URL.createObjectURL(file)`. A blob URL dies on reload and never reaches the
  query string, so a saved QR would silently lose its logo and a shared link
  would render without it. Store the image as a `Blob` in IndexedDB (via
  `idb-keyval`) keyed by id; avoid localStorage, where base64 logos quickly hit
  the ~5MB quota.

### Known parser bugs to fix alongside the registry

These are harmless today but become user-facing the moment scanning ships.

- [ ] **`parseWifiQR` is too strict** — the regex
      `^WIFI:T:(.*?);S:(.*?);P:(.*?);;?$` hard-codes the field order `T→S→P`
      and does not handle escaped `\;`, `\:` or `\\` inside SSID and password.
      WiFi QR codes produced by other generators often order fields
      differently and would fail to parse.
- [ ] **Templates parse only once** — `wifi`, `whatsapp` and `contact` run
      their parser in a `useEffect` with an empty dependency array, so a
      payload arriving after mount (as scanning does) never populates the
      form. Depend on `text` instead.
- [ ] **Email has no parser** — `email-template.tsx` only builds `mailto:`
      payloads. Scanning a `mailto:` QR cannot prefill the form until a
      `parse` counterpart exists.

## Studio Features

- [ ] **Share as image (no download)** — share the rendered QR straight to
  WhatsApp, Instagram or any share target using the Web Share API Level 2:

  ```ts
  const blob = await qr.getRawData("png");
  const file = new File([blob], `${name}.png`, { type: "image/png" });
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: name });
  }
  ```

  Requirements:

  - Feature-detect and hide the button where unsupported — Web Share with
    files is unavailable on Firefox desktop and Chrome desktop on Linux.
  - Pre-generate the blob on config change (debounced) so the click handler
    calls `share()` with a ready `File`. Long `await` chains before `share()`
    can lose the user-gesture requirement on Safari.
  - Share PNG only; SVG is poorly supported by target apps.
  - Fallback chain: Web Share →
    `navigator.clipboard.write([new ClipboardItem({ "image/png": blob })])` →
    Copy link → Download.

- [ ] **Copy link** — a second, separate action next to Share. Because the URL
      already encodes the full configuration, the recipient can open and keep
      editing the design. Note in the UI that the uploaded logo is *not*
      included in the link (it cannot be encoded in a URL). A future `img_url`
      param could carry a remote logo.

- [ ] **Scan a QR code to prefill Studio** — decode an existing QR and load it
  into Studio for restyling, then save it.

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
  - Route the decoded string through `codec.detect()`; fall back to the
    free-text template for anything unrecognized (plain URLs, tracking
    numbers) rather than showing an error.
  - Treat decoded content as untrusted: render it as text first and never
    auto-navigate, so the user sees what they scanned before clicking. Keep
    `rel="noopener noreferrer"` on the rendered link in
    `components/link-or-text.tsx`.

- [ ] **Saved QR list** (`/my-qr`) — create, save, rename and delete QR codes,
  stored on-device. Since the URL is the state, the record is small:

  ```ts
  interface SavedQr {
    id: string;          // crypto.randomUUID()
    name: string;
    template: TemplateKey;
    params: string;      // URLSearchParams.toString() — the whole Studio state
    logoKey?: string;    // IndexedDB key
    thumbnail?: string;  // small PNG data URL (~120px)
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

All of these can be built fully client-side, following the same pattern as the
existing templates (an entry in `constants/template.data.ts`, a form component
in `components/`, and a payload builder). Once the codec registry lands, each
one is a single file under `utils/payloads/` plus its form.

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

## Other Ideas

- [ ] Logo upload presets in Studio (common social icons as embedded logos).
- [ ] Shareable template gallery — curated style presets encoded as Studio
      URLs, since every style setting already lives in the URL.
- [ ] Compress the Studio state into a single `?d=` param (deflate +
      base64url). Long vCard payloads produce URLs that some chat apps
      truncate when shared.
- [ ] Rename `hokks/` to `hooks/`. Only two files and three importers today —
      cheapest to fix before that count grows.
