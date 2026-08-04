"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

import { PayloadCodec } from "@/types/payload.type";

const WRITE_DELAY = 500;

/**
 * Two-way binding between a template form and the URL.
 *
 * The form owns its state while the user types and pushes it to the URL on a
 * debounce. It pulls back only when `text` changes for a reason that isn't our
 * own write — a pasted link, the back button, or a scanned QR — which is what
 * lets a payload arriving after mount actually reach the fields.
 */
function usePayloadForm<T extends object>(codec: PayloadCodec<T>) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  // useSearchParams hands back a read-only view; codecs and writes need a real
  // URLSearchParams they can mutate.
  const params = useMemo(() => new URLSearchParams(searchParams.toString()), [searchParams]);

  const text = params.get("text") ?? "";

  const [data, setData] = useState<T>(
    () => codec.fromParams(params) ?? codec.parse(text) ?? codec.empty,
  );

  const dataRef = useRef(data);
  /** Params as of the last commit, so a write never builds on a stale URL. */
  const paramsRef = useRef(params);
  /** The payload the fields currently hold, to tell our echo from a real change. */
  const writtenRef = useRef(text);

  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  const write = useCallback(
    (next: T) => {
      const params = new URLSearchParams(paramsRef.current);
      const payload = codec.build(next);

      // Clearing first is what makes repeated keys (?phone=a&phone=b) shrink
      // when a row is removed.
      codec.paramKeys.forEach((key) => params.delete(key));

      Object.entries(codec.toParams(next)).forEach(([key, value]) => {
        const values = Array.isArray(value) ? value : [value];

        values.filter(Boolean).forEach((item) => params.append(key, item));
      });

      if (payload) params.set("text", payload);
      else params.delete("text");

      writtenRef.current = payload;
      paramsRef.current = params;
      router.replace(`${pathname}?${params.toString()}`);
    },
    [codec, pathname, router],
  );

  const debouncedWrite = useDebouncedCallback(write, WRITE_DELAY);

  const set = useCallback(
    (updater: (prev: T) => T) => {
      const next = updater(dataRef.current);

      dataRef.current = next;
      setData(next);
      debouncedWrite(next);
    },
    [debouncedWrite],
  );

  const patch = useCallback(
    (partial: Partial<T>) => set((prev) => ({ ...prev, ...partial }) as T),
    [set],
  );

  useEffect(() => {
    // Our own write echoing back through the router. Re-deriving here would
    // overwrite fields the user has kept typing since the debounce fired.
    if (text === writtenRef.current) return;

    const next = codec.fromParams(params) ?? codec.parse(text);

    if (!next) return;

    dataRef.current = next;
    writtenRef.current = text;
    setData(next);
  }, [codec, params, text]);

  return { data, set, patch };
}

export default usePayloadForm;
