"use client";

import { Input, Select, SelectItem } from "@heroui/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { ChangeEvent, useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

interface DataState {
  type?: string;
  ssid?: string;
  password?: string;
}

function WifiTemplate() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = new URLSearchParams(useSearchParams());

  const text = searchParams.get("text") || "";

  const [data, setData] = useState<DataState>({});

  const setQuery = (key: string, value: string) => {
    if (value) searchParams.set(key, value);
    else searchParams.delete(key);
    router.replace(`${pathname}?${searchParams.toString()}`);
  };

  const debounce = useDebouncedCallback(setQuery, 500);

  const onChange = (key: string, value: string) => {
    setData((prev) => {
      const newVal = { ...prev, [key]: value };
      const formatted = formatWifiQR(newVal);

      debounce("text", formatted);

      return newVal;
    });
  };

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    onChange(name, value);
  };

  useEffect(() => {
    const parsed = parseWifiQR(text);

    if (parsed) setData(parsed);
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <Select
        className="max-w-xs"
        label="Security"
        placeholder="Security"
        defaultSelectedKeys={["WPA"]}
        selectedKeys={[data.type ?? "WPA"]}
        onSelectionChange={(keys) => onChange("type", keys.currentKey || "")}
      >
        <SelectItem key="WPA">WPA</SelectItem>
        <SelectItem key="WEP">WEP</SelectItem>
        <SelectItem key="">None</SelectItem>
      </Select>

      <Input
        label="SSID"
        name="ssid"
        placeholder="SSID"
        value={data.ssid}
        onChange={onInputChange}
      />

      <Input
        label="Password"
        name="password"
        placeholder="Password"
        value={data.password}
        onChange={onInputChange}
      />
    </div>
  );
}

function parseWifiQR(qrString: string) {
  const match = qrString.match(/^WIFI:T:(.*?);S:(.*?);P:(.*?);;?$/);

  if (!match) return null;

  const [, type, ssid, password] = match;

  return {
    type,
    ssid,
    password,
  };
}

function formatWifiQR(data: DataState): string {
  const { type = "", ssid = "", password = "" } = data;

  return `WIFI:T:${type};S:${ssid};P:${password};;`;
}

export default WifiTemplate;
