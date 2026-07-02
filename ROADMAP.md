# GaweQR Roadmap

Planned improvements for GaweQR. Items are ordered by priority within each
section. Contributions and suggestions are welcome — open an issue to discuss.

## New QR Templates

All of these can be built fully client-side, following the same pattern as the
existing templates (an entry in `constants/template.data.ts`, a form component
in `components/`, and a payload builder).

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

## Other Ideas

- [ ] Logo upload presets in Studio (common social icons as embedded logos).
- [ ] Shareable template gallery — curated style presets encoded as Studio
      URLs, since every style setting already lives in the URL.
