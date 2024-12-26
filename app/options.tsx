"use client";

import {
  mainBg,
  mainCornersDot,
  mainCornersSquare,
  mainDots,
  mainImage,
} from "@/constants/default.data";
import { useImageStore } from "@/store";
import { OptionsForm } from "@/types/form.type";
import {
  Accordion,
  AccordionItem,
  Button,
  Image,
  Radio,
  RadioGroup,
  Slider,
} from "@nextui-org/react";
import { useRouter, useSearchParams } from "next/navigation";
import { CornerDotType, CornerSquareType, DotType } from "qr-code-styling";
import React, { ChangeEvent, useEffect, useState } from "react";
import { HexAlphaColorPicker } from "react-colorful";
import { useDebouncedCallback } from "use-debounce";

function OptionsSection() {
  const router = useRouter();
  const searchParams = new URLSearchParams(useSearchParams());

  const bg_round = Number(searchParams.get("bg_round")) || mainBg.round;
  const bg_color = searchParams.get("bg_color") || mainBg.color;

  const dot_type = searchParams.get("dot_type") || mainDots.type;
  const dot_color = searchParams.get("dot_color") || mainDots.color;

  const corner_dot_type = (searchParams.get("corner_dot_type") ||
    mainCornersDot.type) as CornerDotType;
  const corner_dot_color = searchParams.get("corner_dot_color") || mainCornersDot.color;

  const corner_square_type = (searchParams.get("corner_square_type") ||
    mainCornersSquare.type) as CornerSquareType;
  const corner_square_color = searchParams.get("corner_square_color") || mainCornersSquare.color;

  const img_margin = Number(searchParams.get("img_margin")) || mainImage.margin;
  const img_size = Number(searchParams.get("img_size")) || mainImage.imageSize;

  const store = useImageStore();

  const [options, setOptions] = useState<OptionsForm>({});

  const setQuery = (key: string, value: string) => {
    if (value) searchParams.set(key, value);
    else searchParams.delete(key);
    router.replace(`?${searchParams.toString()}`);
  };

  const debounce = useDebouncedCallback(setQuery, 500);

  const onChange = (key: keyof OptionsForm, value: string, opt?: { debounce?: boolean }) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
    if (opt?.debounce) debounce(key, value);
    else setQuery(key, value);
  };

  const onSelectImage = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      const image = URL.createObjectURL(e.target.files[0]);
      store.setImage(image);
    }
  };

  useEffect(() => {
    setOptions((prev) => ({
      ...prev,
      bg_round,
      bg_color,
      dot_type: dot_type as DotType,
      dot_color,
      corner_dot_type,
      corner_dot_color,
      corner_square_type,
      corner_square_color,
      img_margin,
      img_size,
    }));
  }, [
    bg_round,
    bg_color,
    dot_type,
    dot_color,
    corner_dot_type,
    corner_dot_color,
    corner_square_type,
    corner_square_color,
    img_margin,
    img_size,
  ]);

  return (
    <Accordion
      variant="splitted"
      fullWidth
      className="px-0"
      itemClasses={{
        base: "bg-background shadow-none border rounded-lg",
        title: "text-sm font-semibold",
      }}
    >
      <AccordionItem
        key="background_options"
        aria-label="Background Options"
        title="Background Options"
      >
        <div className="flex flex-col gap-5">
          <Slider
            size="sm"
            className="w-full"
            label="Round"
            maxValue={1}
            minValue={0}
            step={0.01}
            value={options.bg_round}
            onChange={(value) => onChange("bg_round", `${value}`, { debounce: true })}
          />

          <label>Color</label>
          <HexAlphaColorPicker
            color={options.bg_color}
            onChange={(value) => onChange("bg_color", value, { debounce: true })}
          />
        </div>
      </AccordionItem>

      <AccordionItem key="dots_options" aria-label="Dots Options" title="Dots Options">
        <div className="flex flex-col gap-5">
          <RadioGroup
            size="sm"
            label="Type"
            value={options.dot_type}
            onValueChange={(value) => onChange("dot_type", value)}
          >
            <Radio value="classy">Classy</Radio>
            <Radio value="classy-rounded">Classy Rounded</Radio>
            <Radio value="dots">Dots</Radio>
            <Radio value="extra-rounded">Extra Rounded</Radio>
            <Radio value="rounded">Rounded</Radio>
            <Radio value="square">Square</Radio>
          </RadioGroup>

          <div className="">
            <label>Color</label>
            <HexAlphaColorPicker
              color={options.dot_color}
              onChange={(value) => onChange("dot_color", value, { debounce: true })}
            />
          </div>
        </div>
      </AccordionItem>

      <AccordionItem
        key="corners_dots_options"
        aria-label="Corners Dots Options"
        title="Corners Dots Options"
      >
        <div className="flex flex-col gap-5">
          <RadioGroup
            size="sm"
            label="Type"
            value={options.corner_dot_type}
            onValueChange={(value) => onChange("corner_dot_type", value)}
          >
            <Radio value="dot">Dot</Radio>
            <Radio value="square">Square</Radio>
          </RadioGroup>

          <div className="">
            <label>Color</label>
            <HexAlphaColorPicker
              color={options.corner_dot_color}
              onChange={(value) => onChange("corner_dot_color", value, { debounce: true })}
            />
          </div>
        </div>
      </AccordionItem>

      <AccordionItem
        key="corners_square_options"
        aria-label="Corner Square Options"
        title="Corner Square Options"
      >
        <div className="flex flex-col gap-5">
          <RadioGroup
            size="sm"
            label="Type"
            value={options.corner_square_type}
            onValueChange={(value) => onChange("corner_square_type", value)}
          >
            <Radio value="dot">Dot</Radio>
            <Radio value="extra-rounded">Extra Rounded</Radio>
            <Radio value="square">Square</Radio>
          </RadioGroup>

          <div className="">
            <label>Color</label>
            <HexAlphaColorPicker
              color={options.corner_square_color}
              onChange={(value) => onChange("corner_square_color", value, { debounce: true })}
            />
          </div>
        </div>
      </AccordionItem>

      <AccordionItem key="image_options" aria-label="ImageOptions" title="ImageOptions">
        <div className="flex flex-col gap-5">
          <Image
            src={store.image || "/default.svg"}
            alt="logo"
            className="cursor-pointer"
            onClick={() => document.getElementById("logo_input")?.click()}
          />

          {!!store.image && (
            <Button size="sm" radius="sm" color="danger" onPress={store.removeImage}>
              Delete Image
            </Button>
          )}

          <input hidden id="logo_input" type="file" onChange={onSelectImage} />

          <Slider
            size="sm"
            className="w-full"
            label="Margin"
            maxValue={20}
            minValue={1}
            step={1}
            value={options.img_margin}
            onChange={(value) => onChange("img_margin", `${value}`, { debounce: true })}
          />

          <Slider
            size="sm"
            className="w-full"
            label="Image SIze"
            maxValue={1}
            minValue={0.1}
            step={0.1}
            value={options.img_size}
            onChange={(value) => onChange("img_size", `${value}`, { debounce: true })}
          />
        </div>
      </AccordionItem>
    </Accordion>
  );
}

export default OptionsSection;
