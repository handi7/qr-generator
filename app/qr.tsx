"use client";

import { useEffect, useRef, useState } from "react";
import QRCodeStyling, { FileExtension, Options } from "qr-code-styling";
import { Button } from "@nextui-org/button";
import { Select, SelectItem } from "@nextui-org/select";
import { Input } from "@nextui-org/react";

type QrCodeProps = {
  data: string;
  options?: Partial<Options>;
};

const QrCode: React.FC<QrCodeProps> = ({ data, options }) => {
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const qrCode = useRef<QRCodeStyling | null>(null);

  const [extension, setExtension] = useState<FileExtension>("png");
  const [name, setName] = useState<string>("qr");

  const onDownloadClick = () => {
    qrCode.current?.download({ name, extension });
  };

  useEffect(() => {
    if (!qrCode.current) {
      qrCode.current = new QRCodeStyling({
        data,
        width: 300,
        height: 300,
        dotsOptions: {
          color: "#000",
          type: "rounded",
        },
        backgroundOptions: {
          color: "#ffffff",
        },
        ...options,
      });
    }

    qrCode.current.update({ data, ...options });

    if (qrCodeRef.current) {
      qrCode.current.append(qrCodeRef.current);
    }
  }, [data, options]);

  return (
    <div className="w-full min-w-72 flex flex-col items-center gap-3">
      <h1 className="font-semibold py-5">QR Code Generator</h1>
      <div className="w-full max-w-full flex flex-col items-center overflow-auto">
        <div ref={qrCodeRef} />
      </div>

      <div className="w-full md:max-w-72 flex flex-col gap-3 py-5">
        <Input
          size="sm"
          radius="sm"
          label="Filename"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Select
          size="sm"
          radius="sm"
          className=""
          label="Select file type"
          selectionMode="single"
          selectedKeys={[extension]}
          onSelectionChange={(keys) => setExtension(keys.currentKey as FileExtension)}
        >
          <SelectItem key="jpeg">JPEG</SelectItem>
          <SelectItem key="png">PNG</SelectItem>
          <SelectItem key="svg">SVG</SelectItem>
          <SelectItem key="webp">WEBP</SelectItem>
        </Select>

        <Button size="sm" color="primary" onPress={onDownloadClick}>
          Download
        </Button>
      </div>
    </div>
  );
};

export default QrCode;
