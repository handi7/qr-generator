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
import { Accordion, AccordionItem, Button, Image, Radio, RadioGroup, Slider } from "@heroui/react";
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
    <div className="w-full max-w-md">
      <section className="relative overflow-hidden rounded-2xl border border-foreground/10 bg-background/75 p-4 shadow-sm backdrop-blur">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(380px_circle_at_10%_-10%,rgba(25,194,160,0.14),transparent_55%),radial-gradient(360px_circle_at_90%_-10%,rgba(66,103,178,0.12),transparent_50%)]" />

        <div className="relative space-y-4">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-primary">Style</p>
            <h2 className="text-sm font-semibold">Advanced Options</h2>
          </div>

          <Accordion
            variant="splitted"
            fullWidth
            className="px-0"
            itemClasses={{
              base: "bg-background/80 shadow-none border border-foreground/10 rounded-xl",
              title: "text-sm font-semibold",
              trigger: "px-4",
              content: "px-4 pb-4",
            }}
          >
            <AccordionItem
              key="background_options"
              aria-label="Background Options"
              title="Background Options"
            >
              <div className="flex flex-col gap-5">
                <div className="rounded-xl border border-foreground/10 bg-background/70 p-3">
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
                </div>

                <div className="rounded-xl border border-foreground/10 bg-background/70 p-3">
                  <label className="mb-2 block text-sm font-medium">Color</label>
                  <HexAlphaColorPicker
                    color={options.bg_color}
                    onChange={(value) => onChange("bg_color", value, { debounce: true })}
                  />
                </div>
              </div>
            </AccordionItem>

            <AccordionItem key="dots_options" aria-label="Dots Options" title="Dots Options">
              <div className="flex flex-col gap-5">
                <div className="rounded-xl border border-foreground/10 bg-background/70 p-3">
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
                </div>

                <div className="rounded-xl border border-foreground/10 bg-background/70 p-3">
                  <label className="mb-2 block text-sm font-medium">Color</label>
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
                <div className="rounded-xl border border-foreground/10 bg-background/70 p-3">
                  <RadioGroup
                    size="sm"
                    label="Type"
                    value={options.corner_dot_type}
                    onValueChange={(value) => onChange("corner_dot_type", value)}
                  >
                    <Radio value="dot">Dot</Radio>
                    <Radio value="square">Square</Radio>
                  </RadioGroup>
                </div>

                <div className="rounded-xl border border-foreground/10 bg-background/70 p-3">
                  <label className="mb-2 block text-sm font-medium">Color</label>
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
                <div className="rounded-xl border border-foreground/10 bg-background/70 p-3">
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
                </div>

                <div className="rounded-xl border border-foreground/10 bg-background/70 p-3">
                  <label className="mb-2 block text-sm font-medium">Color</label>
                  <HexAlphaColorPicker
                    color={options.corner_square_color}
                    onChange={(value) => onChange("corner_square_color", value, { debounce: true })}
                  />
                </div>
              </div>
            </AccordionItem>

            <AccordionItem key="image_options" aria-label="ImageOptions" title="Image Options">
              <div className="flex flex-col gap-5">
                <div className="rounded-xl border border-foreground/10 bg-background/70 p-3">
                  <Image
                    src={store.image || "/default.svg"}
                    alt="logo"
                    className="cursor-pointer rounded-lg"
                    onClick={() => document.getElementById("logo_input")?.click()}
                  />
                </div>

                {!!store.image && (
                  <Button
                    size="sm"
                    radius="sm"
                    color="danger"
                    variant="flat"
                    onPress={store.removeImage}
                  >
                    Delete Image
                  </Button>
                )}

                <input hidden id="logo_input" type="file" onChange={onSelectImage} />

                <div className="rounded-xl border border-foreground/10 bg-background/70 p-3">
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
                </div>

                <div className="rounded-xl border border-foreground/10 bg-background/70 p-3">
                  <Slider
                    size="sm"
                    className="w-full"
                    label="Image Size"
                    maxValue={1}
                    minValue={0.1}
                    step={0.1}
                    value={options.img_size}
                    onChange={(value) => onChange("img_size", `${value}`, { debounce: true })}
                  />
                </div>
              </div>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
    </div>
  );
}

export default OptionsSection;
