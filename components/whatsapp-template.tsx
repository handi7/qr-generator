"use client";

import { Input, Textarea } from "@heroui/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { ChangeEvent, useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

interface WhatsappState {
  phone?: string;
  message?: string;
}

function WhatsappTemplate() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = new URLSearchParams(useSearchParams());

  const text = searchParams.get("text") || "";

  const [data, setData] = useState<WhatsappState>({});

  const setQuery = (key: string, value: string) => {
    if (value) searchParams.set(key, value);
    else searchParams.delete(key);
    router.replace(`${pathname}?${searchParams.toString()}`);
  };

  const debounce = useDebouncedCallback(setQuery, 500);

  const onChange = (key: string, value: string) => {
    setData((prev) => {
      const newVal = { ...prev, [key]: value };
      const formatted = formatWhatsappQR(newVal);

      debounce("text", formatted);

      return newVal;
    });
  };

  const onInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onChange(name, value);
  };

  useEffect(() => {
    const parsed = parseWhatsappQR(text);
    if (parsed) setData(parsed);
  }, []);

  return (
    <div className="flex flex-col gap-3 max-w-md">
      <Input
        label="Phone Number"
        name="phone"
        placeholder="6281234567890"
        value={data.phone}
        onChange={onInputChange}
      />

      <Textarea
        label="Message"
        name="message"
        placeholder="Hello! 👋"
        value={data.message}
        onChange={onInputChange}
      />
    </div>
  );
}

function parseWhatsappQR(qrString: string): WhatsappState | null {
  try {
    const url = new URL(qrString);
    if (!url.hostname.includes("wa.me")) return null;

    const phone = url.pathname.replace("/", "");
    const message = url.searchParams.get("text") || "";

    return { phone, message };
  } catch {
    return null;
  }
}

function formatWhatsappQR(data: WhatsappState): string {
  const { phone = "", message = "" } = data;

  const baseUrl = `https://wa.me/${phone}`;
  const encodedMessage = encodeURIComponent(message);

  return message ? `${baseUrl}?text=${encodedMessage}` : baseUrl;
}

export default WhatsappTemplate;
