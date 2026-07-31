"use client";

import { Input, Textarea } from "@heroui/react";
import React from "react";

import usePayloadForm from "@/hokks/usePayloadForm";
import emailCodec from "@/utils/payloads/email";

function EmailTemplate() {
  const { data, patch } = usePayloadForm(emailCodec);

  return (
    <div className="flex flex-col gap-3 max-w-md">
      <Input
        variant="bordered"
        isRequired
        label="To"
        name="to"
        placeholder="hello@example.com"
        value={data.to}
        onChange={(e) => patch({ to: e.target.value })}
        isInvalid={!data.to.trim()}
        errorMessage="Recipient is required"
      />

      <Input
        variant="bordered"
        label="CC"
        name="cc"
        placeholder="team@example.com"
        value={data.cc}
        onChange={(e) => patch({ cc: e.target.value })}
      />

      <Input
        variant="bordered"
        label="BCC"
        name="bcc"
        placeholder="audit@example.com"
        value={data.bcc}
        onChange={(e) => patch({ bcc: e.target.value })}
      />

      <Input
        variant="bordered"
        label="Subject"
        name="subject"
        placeholder="Business Inquiry"
        value={data.subject}
        onChange={(e) => patch({ subject: e.target.value })}
      />

      <Textarea
        variant="bordered"
        label="Body"
        name="body"
        placeholder="Hello there"
        value={data.body}
        onChange={(e) => patch({ body: e.target.value })}
      />
    </div>
  );
}

export default EmailTemplate;
