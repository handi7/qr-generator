"use client";

import { useEffect, useState } from "react";
import QR from "./qr";
import { CornerDotType, CornerSquareType, DotType, Options, ShapeType } from "qr-code-styling";
import { useRouter, useSearchParams } from "next/navigation";
import {
  main,
  mainBg,
  mainCornersDot,
  mainCornersSquare,
  mainDots,
  mainImage,
} from "@/constants/default.data";
import { useImageStore } from "@/store";
import { Button, Drawer, DrawerBody, DrawerContent } from "@nextui-org/react";
import SettingsIcon from "@/components/settings-icon";
import ConfigurationSection from "./configuration";
import OptionsSection from "./options";

export default function Home() {
  const router = useRouter();
  const sp = useSearchParams();
  const searchParams = new URLSearchParams(sp);

  const text = searchParams.get("text") || "";
  const size = Number(searchParams.get("size")) || 240;
  const shape = (searchParams.get("shape") || main.shape) as ShapeType;
  const margin = Number(searchParams.get("margin")) || main.margin || 0;

  const bgRound = Number(searchParams.get("bg_round")) || mainBg.round;
  const bgColor = searchParams.get("bg_color") || mainBg.color;

  const dotType = searchParams.get("dot_type") || mainDots.type;
  const dotColor = searchParams.get("dot_color") || mainDots.color;

  const cDotType = searchParams.get("corner_dot_type") || mainCornersDot.type;
  const cDotColor = searchParams.get("corner_dot_color") || mainCornersDot.color;

  const cSquareType = searchParams.get("corner_square_type") || mainCornersSquare.type;
  const cSquareColor = searchParams.get("corner_square_color") || mainCornersSquare.color;

  const imgMargin = Number(searchParams.get("img_margin")) || mainImage.margin;
  const imageSize = Number(searchParams.get("img_size")) || mainImage.imageSize;

  const store = useImageStore();

  const [data, setData] = useState("https://handiani.my.id");
  const [options, setOptions] = useState<Partial<Options>>({});
  const [isOpen, setOpen] = useState(false);

  const getOptions = (prev: Partial<Options>): Partial<Options> => {
    const qrSize = size < 50 ? 50 : size;
    const qrMargin = isNaN(margin) ? 10 : margin > 20 ? 20 : margin;
    const tempOptions: Partial<Options> = {
      ...prev,
      width: qrSize,
      height: qrSize,
      shape,
      margin: qrMargin,
      image: store.image,
      backgroundOptions: { round: bgRound, color: bgColor },
      dotsOptions: { type: dotType as DotType, color: dotColor },
      cornersDotOptions: { type: cDotType as CornerDotType, color: cDotColor },
      cornersSquareOptions: { type: cSquareType as CornerSquareType, color: cSquareColor },
      imageOptions: { margin: imgMargin, imageSize },
    };
    return tempOptions;
  };

  useEffect(() => {
    if (text) setData(text);
    setOptions(getOptions);
  }, [sp, router, store]);

  return (
    <div className="w-full lg:w-fit min-h-[100dvh] flex flex-col md:flex-row justify-center gap-5 px-6">
      <div className="w-full md:w-fit lg:min-w-[720px] flex flex-col items-center gap-5">
        <Button
          isIconOnly
          size="sm"
          variant="flat"
          className="fixed top-5 right-5 z-10 lg:hidden"
          onPress={() => setOpen(true)}
        >
          <SettingsIcon size={18} className="fill-primary" />
        </Button>

        <Drawer size="xs" isOpen={isOpen} onClose={() => setOpen(false)} className="bg-background">
          <DrawerContent>
            <DrawerBody className="py-10">
              <ConfigurationSection />
              <OptionsSection />
            </DrawerBody>
          </DrawerContent>
        </Drawer>

        <QR data={data} options={options} />
      </div>
    </div>
  );
}
