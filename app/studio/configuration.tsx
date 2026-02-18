"use client";

import React, { useEffect, useState } from "react";
import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Input,
  Radio,
  RadioGroup,
  Slider,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { templates } from "@/constants/template.data";
import WifiTemplate from "@/components/wifi-template";
import WhatsappTemplate from "@/components/whatsapp-template";
import ContactTemplate from "@/components/contact-template";
import useQueryParams from "@/hokks/useQueryParams";
import InputNumber from "@/components/Shared/InputNumber";

interface DataState {
  text: string;
  size: string;
  shape: string;
  margin: string;
}

const defaultData: DataState = {
  text: "https://handiani.my.id/",
  margin: "10",
  shape: "square",
  size: "240",
};

function ConfigurationSection() {
  const router = useRouter();
  const query = useQueryParams();

  const template = query.get("template");
  const text = query.get("text");
  const size = query.get("size");
  const shape = query.get("shape");
  const margin = query.get("margin");

  const [data, setData] = useState<DataState>(defaultData);

  const debounce = useDebouncedCallback((key: string, value: string) => {
    query.update({ [key]: value });
  }, 500);

  const onChange = (key: string, value: string, opt?: { debounce?: boolean }) => {
    setData((prev) => ({ ...prev, [key]: value }));
    if (opt?.debounce) debounce(key, value);
    else query.update({ [key]: value });
  };

  function renderTemplate(type: string) {
    switch (type) {
      case "wifi":
        return <WifiTemplate />;

      case "wa":
        return <WhatsappTemplate />;

      case "contact":
        return <ContactTemplate />;

      default:
        return (
          <Input
            size="sm"
            radius="sm"
            label="Text or URL"
            color="primary"
            variant="bordered"
            className="w-full"
            value={data?.text}
            onChange={(e) => onChange("text", e.target.value, { debounce: true })}
            isInvalid={!data.text}
            errorMessage="Please input data"
          />
        );
    }
  }

  useEffect(() => {
    if (text) setData((prev) => ({ ...prev, text }));
    if (size) setData((prev) => ({ ...prev, size }));
    if (shape) setData((prev) => ({ ...prev, shape }));
    if (margin) setData((prev) => ({ ...prev, margin }));
  }, [text, size, shape, margin]);

  return (
    <div className="w-full max-w-md space-y-4">
      <section className="relative overflow-hidden rounded-2xl border border-foreground/10 bg-background/75 p-4 shadow-sm backdrop-blur">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(380px_circle_at_5%_0%,rgba(25,194,160,0.14),transparent_55%),radial-gradient(320px_circle_at_100%_0%,rgba(66,103,178,0.12),transparent_50%)]" />

        <div className="relative space-y-4">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-primary">Content</p>
            <h2 className="text-sm font-semibold">Template & Data</h2>
          </div>

          <Autocomplete
            variant="bordered"
            className="w-full"
            items={templates}
            defaultSelectedKey={template}
            label="Select Template"
            placeholder="Search template"
            onSelectionChange={(key) => {
              const selected = templates.find((item) => item.key === key);
              query.reset({
                text: selected?.default || "https://handiani.my.id/",
                template: key?.toString() || "",
              });
            }}
          >
            {(item) => <AutocompleteItem key={item.key}>{item.label}</AutocompleteItem>}
          </Autocomplete>

          <div className="rounded-xl border border-foreground/10 bg-background/70 p-3">{renderTemplate(template)}</div>
        </div>
      </section>

      <section className="rounded-2xl border border-foreground/10 bg-background/75 p-4 shadow-sm backdrop-blur">
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-primary">Appearance</p>
            <h2 className="text-sm font-semibold">QR Configuration</h2>
          </div>

          <InputNumber
            label="Size"
            className="w-full"
            value={data.size}
            onChange={(e) => onChange("size", e.target.value, { debounce: true })}
          />

          <div className="rounded-xl border border-foreground/10 bg-background/70 p-3">
            <RadioGroup
              name="shape"
              size="sm"
              label="Shape"
              value={data.shape}
              onChange={(e) => onChange("shape", e.target.value)}
            >
              <Radio value="circle">Circle</Radio>
              <Radio value="square">Square</Radio>
            </RadioGroup>
          </div>

          <div className="rounded-xl border border-foreground/10 bg-background/70 p-3">
            <Slider
              size="sm"
              className="w-full"
              label="Margin"
              maxValue={20}
              minValue={1}
              step={1}
              value={Number(data.margin)}
              onChange={(value) => onChange("margin", `${value}`, { debounce: true })}
            />
          </div>
        </div>
      </section>

      <Button size="sm" color="danger" variant="flat" className="w-full" onPress={() => router.replace("/")}>
        Reset All
      </Button>
    </div>
  );
}

export default ConfigurationSection;
