"use client";

import { useMemo } from "react";

import QrCode from "@/app/studio/qr";
import useQueryParams from "@/hokks/useQueryParams";
import { useImageStore } from "@/store";
import { dataFromParams, optionsFromParams } from "@/utils/qr-options.utils";

export default function QRStudio() {
  const { query } = useQueryParams();
  const image = useImageStore((state) => state.image);

  // Memoised on the params object, which `useQueryParams` already rebuilds only
  // when the URL changes. A fresh object every render would retrigger the
  // render-and-cache-PNG effect in QrCode on every keystroke.
  const data = useMemo(() => dataFromParams(query), [query]);
  const options = useMemo(() => optionsFromParams(query, image), [query, image]);

  return <QrCode data={data} options={options} />;
}
