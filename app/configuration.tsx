"use client";

import React, { useEffect, useState } from "react";
import ThemeSwitch from "./theme";
import { Button, Divider, Input, Radio, RadioGroup, Slider } from "@nextui-org/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

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
  const searchParams = new URLSearchParams(useSearchParams());

  const text = searchParams.get("text") || "";
  const size = searchParams.get("size") || "";
  const shape = searchParams.get("shape") || "";
  const margin = searchParams.get("margin") || "";

  const [data, setData] = useState<DataState>(defaultData);

  const setQuery = (key: string, value: string) => {
    if (value) searchParams.set(key, value);
    else searchParams.delete(key);
    router.replace(`?${searchParams.toString()}`);
  };

  const debounce = useDebouncedCallback(setQuery, 500);

  const onChange = (key: string, value: string, opt?: { debounce?: boolean }) => {
    setData((prev) => ({ ...prev, [key]: value }));
    if (opt?.debounce) debounce(key, value);
    else setQuery(key, value);
  };

  useEffect(() => {
    if (text) setData((prev) => ({ ...prev, text }));
    if (size) setData((prev) => ({ ...prev, size }));
    if (shape) setData((prev) => ({ ...prev, shape }));
    if (margin) setData((prev) => ({ ...prev, margin }));
  }, [text, size, shape, margin]);

  return (
    <>
      <ThemeSwitch />
      <Divider />
      <Input
        size="sm"
        radius="sm"
        label="Text or URL"
        color="primary"
        variant="bordered"
        className="w-full md:max-w-72"
        value={data?.text}
        onChange={(e) => onChange("text", e.target.value, { debounce: true })}
        isInvalid={!data.text}
        errorMessage="Please input data"
      />
      <Input
        type="number"
        size="sm"
        radius="sm"
        label="Size"
        color="primary"
        variant="bordered"
        className="w-full md:max-w-72"
        value={data.size}
        onChange={(e) => onChange("size", e.target.value, { debounce: true })}
      />
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
      <Button size="sm" color="danger" onPress={() => router.replace("/")}>
        Reset All
      </Button>
    </>
  );
}

export default ConfigurationSection;
