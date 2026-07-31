"use client";

import { Input, Select, SelectItem } from "@heroui/react";
import { Eye, EyeClosed } from "lucide-react";
import { useState } from "react";

import usePayloadForm from "@/hokks/usePayloadForm";
import wifiCodec from "@/utils/payloads/wifi";

function WifiTemplate() {
  const { data, patch } = usePayloadForm(wifiCodec);

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <Select
        variant="bordered"
        className="max-w-xs"
        label="Security"
        placeholder="Security"
        selectedKeys={[data.type]}
        onSelectionChange={(keys) => patch({ type: keys.currentKey ?? "" })}
      >
        <SelectItem key="WPA">WPA</SelectItem>
        <SelectItem key="WEP">WEP</SelectItem>
        <SelectItem key="">None</SelectItem>
      </Select>

      <Input
        variant="bordered"
        label="SSID"
        name="ssid"
        placeholder="SSID"
        value={data.ssid}
        onChange={(e) => patch({ ssid: e.target.value })}
      />

      <Input
        variant="bordered"
        type={showPassword ? "text" : "password"}
        label="Password"
        name="password"
        placeholder="Password"
        endContent={
          showPassword ? (
            <Eye className="cursor-pointer" onClick={() => setShowPassword(false)} />
          ) : (
            <EyeClosed className="cursor-pointer" onClick={() => setShowPassword(true)} />
          )
        }
        value={data.password}
        onChange={(e) => patch({ password: e.target.value })}
      />
    </div>
  );
}

export default WifiTemplate;
