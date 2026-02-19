"use client";

import { useCallback, useEffect, useState } from "react";
import { CornerDotType, CornerSquareType, DotType, Options, ShapeType } from "qr-code-styling";
import {
  main,
  mainBg,
  mainCornersDot,
  mainCornersSquare,
  mainDots,
  mainImage,
} from "@/constants/default.data";
import { useImageStore } from "@/store";
import useQueryParams from "@/hokks/useQueryParams";
import { normalizeTemplateType } from "@/utils/template.utils";
import QrCode from "@/app/studio/qr";

export default function QRStudio() {
  const query = useQueryParams();

  const currentType = normalizeTemplateType(query.get("template"));
  const text = query.get("text");
  const size = Number(query.get("size")) || 320;
  const shape = (query.get("shape") || main.shape) as ShapeType;
  const margin = Number(query.get("margin")) || main.margin || 0;

  const bgRound = Number(query.get("bg_round")) || mainBg.round;
  const bgColor = query.get("bg_color") || mainBg.color;

  const dotType = query.get("dot_type") || mainDots.type;
  const dotColor = query.get("dot_color") || mainDots.color;

  const cDotType = query.get("corner_dot_type") || mainCornersDot.type;
  const cDotColor = query.get("corner_dot_color") || mainCornersDot.color;

  const cSquareType = query.get("corner_square_type") || mainCornersSquare.type;
  const cSquareColor = query.get("corner_square_color") || mainCornersSquare.color;

  const imgMargin = Number(query.get("img_margin")) || mainImage.margin;
  const imageSize = Number(query.get("img_size")) || mainImage.imageSize;

  const store = useImageStore();

  const [data, setData] = useState("https://gaweqr.my.id");
  const [options, setOptions] = useState<Partial<Options>>({});

  const getOptions = useCallback(
    (prev: Partial<Options>): Partial<Options> => {
      const qrSize = size < 100 ? 100 : size;
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
    },
    [
      size,
      margin,
      shape,
      store.image,
      bgRound,
      bgColor,
      dotType,
      dotColor,
      cDotType,
      cDotColor,
      cSquareType,
      cSquareColor,
      imgMargin,
      imageSize,
    ],
  );

  useEffect(() => {
    if (text) setData(text);
    else if (currentType === "email") setData("");
    else setData("https://gaweqr.my.id");

    setOptions((prev) => getOptions(prev));
  }, [text, currentType, getOptions]);

  return (
    <div className="w-full flex flex-col items-center">
      <QrCode data={data} options={options} />
    </div>
  );
}
