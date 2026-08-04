"use client";

import { Link, cn } from "@heroui/react";

interface Props {
  data: string;
  className?: string;
}

export default function LinkOrText({ data, className }: Props) {
  // Only http(s) becomes clickable. `data` can come from a scanned image, so
  // schemes like javascript: or data: must stay inert text.
  const isLink = /^https?:\/\//.test(data);

  return isLink ? (
    <Link
      href={data}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("text-sm hover:underline", className)}
    >
      {data}
    </Link>
  ) : (
    <p className={cn("text-xs", className)}>{data}</p>
  );
}
