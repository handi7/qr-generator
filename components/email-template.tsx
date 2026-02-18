"use client";

import useDebouncedCallback from "@/hokks/useDebounceCallback";
import useQueryParams from "@/hokks/useQueryParams";
import { Input, Textarea } from "@heroui/react";
import React, { useEffect } from "react";

interface EmailData {
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  body: string;
}

function EmailTemplate() {
  const query = useQueryParams();

  const to = query.get("to");
  const cc = query.get("cc");
  const bcc = query.get("bcc");
  const subject = query.get("subject");
  const body = query.get("body");

  const { debounced } = useDebouncedCallback((key: keyof EmailData, value: string) => {
    query.update({ [key]: value });
  }, 400);

  useEffect(() => {
    const generated = generateEmailQR({ to, cc, bcc, subject, body });

    const params: Record<string, string> = {
      to: normalizeRecipients(to),
      cc: normalizeRecipients(cc),
      bcc: normalizeRecipients(bcc),
      subject: subject,
      body: body,
    };

    if (generated) params["text"] = generated;
    else delete params["text"];

    query.update(params);
  }, [to, cc, bcc, subject, body]);

  return (
    <div className="flex flex-col gap-3 max-w-md">
      <Input
        variant="bordered"
        isRequired
        label="To"
        name="to"
        placeholder="hello@example.com"
        defaultValue={to}
        onChange={(e) => debounced("to", e.target.value)}
        isInvalid={!to.trim()}
        errorMessage="Recipient is required"
      />

      <Input
        variant="bordered"
        label="CC"
        name="cc"
        placeholder="team@example.com"
        defaultValue={cc}
        onChange={(e) => debounced("cc", e.target.value)}
      />

      <Input
        variant="bordered"
        label="BCC"
        name="bcc"
        placeholder="audit@example.com"
        defaultValue={bcc}
        onChange={(e) => debounced("bcc", e.target.value)}
      />

      <Input
        variant="bordered"
        label="Subject"
        name="subject"
        placeholder="Business Inquiry"
        defaultValue={subject}
        onChange={(e) => debounced("subject", e.target.value)}
      />

      <Textarea
        variant="bordered"
        label="Body"
        name="body"
        placeholder="Hello there"
        defaultValue={body}
        onChange={(e) => debounced("body", e.target.value)}
      />
    </div>
  );
}

function normalizeRecipients(value: string) {
  return value
    .split(",")
    .map((recipient) => recipient.trim())
    .filter(Boolean)
    .join(",");
}

function setOrDelete(params: URLSearchParams, key: string, value: string) {
  if (value) params.set(key, value);
  else params.delete(key);
}

function generateEmailQR(data: EmailData): string {
  const to = normalizeRecipients(data.to);
  if (!to) return "";

  const cc = normalizeRecipients(data.cc);
  const bcc = normalizeRecipients(data.bcc);
  const subject = data.subject.trim();
  const body = data.body;

  const params = new URLSearchParams();

  if (cc) params.set("cc", cc);
  if (bcc) params.set("bcc", bcc);
  if (subject) params.set("subject", subject);
  if (body) params.set("body", body);

  const query = params.toString();

  return `mailto:${to}${query ? `?${query}` : ""}`;
}

export default EmailTemplate;
