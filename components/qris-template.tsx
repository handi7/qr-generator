"use client";

import { Chip } from "@heroui/react";
import { ImageOff, ScanLine, ShieldAlert, TriangleAlert } from "lucide-react";

import useQueryParams from "@/hokks/useQueryParams";
import { useImageStore } from "@/store";
import qrisCodec from "@/utils/payloads/qris";

/**
 * Tag 53 is always 360 (IDR) on a QRIS, so the currency is safe to hardcode.
 * Falls back to the raw string rather than guessing if the amount isn't numeric.
 */
function formatAmount(value: string) {
  const amount = Number(value);

  if (!value || !Number.isFinite(amount)) return value;

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function Notice({
  tone,
  icon,
  children,
}: {
  tone: "warning" | "danger";
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const palette =
    tone === "danger"
      ? "border-danger/30 bg-danger/10 text-danger"
      : "border-warning/30 bg-warning/10 text-warning";

  return (
    <div className={`flex items-start gap-2 rounded-xl border p-2.5 text-xs ${palette}`}>
      <span className="mt-0.5 shrink-0">{icon}</span>
      <p className="text-foreground/75">{children}</p>
    </div>
  );
}

/**
 * Read-only by design.
 *
 * A QRIS is issued by a licensed payment provider, so there is nothing here to
 * author — only an existing payload to inspect and restyle. That is also why
 * this template skips `usePayloadForm`: there are no fields to bind, and the
 * hook's whole job is writing edited state back to the URL.
 */
function QrisTemplate() {
  const query = useQueryParams();
  const image = useImageStore((state) => state.image);

  const text = query.get("text");
  const state = text ? qrisCodec.parse(text) : null;

  if (!state) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-foreground/20 px-4 py-6 text-center">
        <ScanLine className="text-foreground/40" size={22} />
        <p className="text-sm font-medium">No QRIS loaded</p>
        <p className="max-w-xs text-xs text-foreground/60">
          A QRIS can&apos;t be created here — it&apos;s issued by your payment provider. Use{" "}
          <span className="font-medium">Scan QR</span> above to load the one you already have, then
          restyle it.
        </p>
      </div>
    );
  }

  if (!state.isIntact) {
    return (
      <div className="flex flex-col gap-3">
        <Notice tone="danger" icon={<ShieldAlert size={14} />}>
          <span className="font-medium">This payload&apos;s checksum doesn&apos;t match.</span> It
          has been altered since it was issued, so payment apps will reject it. Scan the original
          QRIS again rather than using this one.
        </Notice>

        <p className="break-all rounded-xl border border-foreground/10 bg-background/70 p-2.5 font-mono text-[11px] text-foreground/60">
          {state.raw}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl border border-foreground/10 bg-background/70 p-3">
        <p className="text-[11px] font-medium uppercase tracking-wide text-foreground/50">
          Paid to
        </p>
        <p className="text-sm font-semibold">{state.merchant || "(no merchant name)"}</p>
        {!!state.city && <p className="text-xs text-foreground/60">{state.city}</p>}

        <div className="mt-2.5 flex flex-wrap gap-1.5">
          <Chip size="sm" variant="flat" color={state.isDynamic ? "warning" : "default"}>
            {state.isDynamic ? "Dynamic" : "Static"}
          </Chip>

          {!!state.amount && (
            <Chip size="sm" variant="flat" color="warning">
              {formatAmount(state.amount)}
            </Chip>
          )}
        </div>
      </div>

      {/* The merchant name is inside the payload and every payment app shows it
          before the payer confirms — which is exactly why it's surfaced here.
          Restyling cannot change who gets paid, but checking the name is what
          catches a code that was swapped before it reached you. */}
      <Notice tone="warning" icon={<TriangleAlert size={14} />}>
        Confirm the name above is yours before printing. Styling never changes who receives the
        money, and the payer&apos;s app shows this same name at checkout.
      </Notice>

      {state.isDynamic && (
        <Notice tone="danger" icon={<ShieldAlert size={14} />}>
          <span className="font-medium">This is a dynamic QRIS.</span> The amount is locked in, and
          codes like this are usually single-use or time-limited. Don&apos;t print it for repeat
          payments — ask your provider for a static code instead.
        </Notice>
      )}

      {!!image && (
        <Notice tone="warning" icon={<ImageOff size={14} />}>
          <span className="font-medium">A logo on a payment code is risky.</span> QRIS payloads are
          dense, and a large logo eats the error-correction margin the code needs to survive print,
          glare, and awkward angles. Test the printed result with a real payment app, or shrink the
          logo under Appearance.
        </Notice>
      )}
    </div>
  );
}

export default QrisTemplate;
