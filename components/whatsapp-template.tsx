"use client";

import { Input, Textarea } from "@heroui/react";
import React from "react";

import usePayloadForm from "@/hokks/usePayloadForm";
import whatsappCodec from "@/utils/payloads/whatsapp";

function WhatsappTemplate() {
  const { data, patch } = usePayloadForm(whatsappCodec);

  return (
    <div className="flex flex-col gap-3 max-w-md">
      <Input
        label="Phone Number"
        name="phone"
        placeholder="6281234567890"
        value={data.phone}
        onChange={(e) => patch({ phone: e.target.value })}
      />

      <Textarea
        label="Message"
        name="message"
        placeholder="Hello! 👋"
        value={data.message}
        onChange={(e) => patch({ message: e.target.value })}
      />
    </div>
  );
}

export default WhatsappTemplate;
