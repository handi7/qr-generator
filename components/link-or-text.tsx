"use client";

import { cn, Link } from "@heroui/react";

interface Props {
  data: string;
  className?: string;
}

export default function LinkOrText({ data, className }: Props) {
  const isLink = /^https?:\/\//.test(data);

  return isLink ? (
    <Link href={data} target="_blank" className={cn("text-sm hover:underline", className)}>
      {data}
    </Link>
  ) : (
    <p className={cn("text-xs", className)}>{data}</p>
  );
}
