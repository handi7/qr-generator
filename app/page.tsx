"use client";

import { ChangeEvent, useState } from "react";
import QR from "./qr";
import { Input } from "@nextui-org/input";
import { CornerDotType, DotType, Options, ShapeType } from "qr-code-styling";
import { HexAlphaColorPicker } from "react-colorful";
import { Accordion, AccordionItem } from "@nextui-org/accordion";
import { Slider } from "@nextui-org/slider";
import { Radio, RadioGroup } from "@nextui-org/radio";
import ThemeSwitch from "./theme";
import { Divider } from "@nextui-org/react";

const defaultOptions: Partial<Options> = {
  width: 240,
  height: 240,
  shape: "square",
  margin: 10,
  imageOptions: { margin: 0, imageSize: 1 },
  backgroundOptions: { color: "#ffffff", round: 0.08 },
  dotsOptions: { color: "#4267b2", type: "rounded" },
  cornersDotOptions: { color: "#4267b2", type: "square" },
  cornersSquareOptions: { color: "#4267b2", type: "square" },
};

export default function Home() {
  const [data, setData] = useState("https://handiani.my.id");
  const [options, setOptions] = useState<Partial<Options>>(defaultOptions);

  const onSelectImage = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      const image = URL.createObjectURL(e.target.files[0]);
      setOptions((prev) => ({ ...prev, image }));
    }
  };

  return (
    <div className="w-full min-h-[100dvh] flex flex-col md:flex-row justify-center items-center gap-5 px-6">
      <div className="w-full md:w-fit min-w-72 flex flex-col items-center gap-5">
        <QR data={data} options={options} />
      </div>

      <div className="w-full md:max-w-72 flex flex-col gap-5 py-10">
        <ThemeSwitch />

        <Divider />

        <Input
          size="sm"
          radius="sm"
          label="Text or URL"
          className="w-full md:max-w-72"
          value={data}
          onChange={(e) => setData(e.target.value)}
          placeholder="Input your text"
        />

        <Input
          type="number"
          size="sm"
          radius="sm"
          label="Size"
          className="w-full md:max-w-72"
          defaultValue="240"
          onChange={(e) => {
            const value = e.target.value;
            if (Number(value) > 50) {
              setOptions((prev) => ({ ...prev, width: Number(value), height: Number(value) }));
            }
          }}
          placeholder="Input your text"
        />

        <Input type="file" size="sm" radius="sm" label="Image" onChange={onSelectImage} />

        <RadioGroup
          size="sm"
          label="Shape"
          value={options.shape}
          onValueChange={(shape) =>
            setOptions((prev) => ({
              ...prev,
              shape: shape as ShapeType,
            }))
          }
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
          value={options.margin}
          onChange={(margin) =>
            setOptions((prev) => ({
              ...prev,
              margin: typeof margin === "object" ? margin[0] : margin,
            }))
          }
        />

        <Accordion variant="light">
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
                value={options.backgroundOptions?.round}
                onChange={(round) =>
                  setOptions((prev) => ({
                    ...prev,
                    backgroundOptions: {
                      ...prev.backgroundOptions,
                      round: typeof round === "object" ? round[0] : round,
                    },
                  }))
                }
              />

              <label>Color</label>
              <HexAlphaColorPicker
                color={options.backgroundOptions?.color}
                onChange={(color) =>
                  setOptions((prev) => ({
                    ...prev,
                    backgroundOptions: { ...prev.backgroundOptions, color },
                  }))
                }
              />
            </div>
          </AccordionItem>

          <AccordionItem key="dots_options" aria-label="Dots Options" title="Dots Options">
            <div className="flex flex-col gap-5">
              <RadioGroup
                size="sm"
                label="Type"
                value={options.dotsOptions?.type}
                onValueChange={(type) =>
                  setOptions((prev) => ({
                    ...prev,
                    dotsOptions: { ...prev.dotsOptions, type: type as DotType },
                  }))
                }
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
                  color={options.dotsOptions?.color}
                  onChange={(color) =>
                    setOptions((prev) => ({ ...prev, dotsOptions: { ...prev.dotsOptions, color } }))
                  }
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
                value={options.cornersDotOptions?.type}
                onValueChange={(type) =>
                  setOptions((prev) => ({
                    ...prev,
                    cornersDotOptions: { ...prev.cornersDotOptions, type: type as CornerDotType },
                  }))
                }
              >
                <Radio value="dot">Dot</Radio>
                <Radio value="square">Square</Radio>
              </RadioGroup>

              <div className="">
                <label>Color</label>
                <HexAlphaColorPicker
                  color={options.cornersDotOptions?.color}
                  onChange={(color) =>
                    setOptions((prev) => ({
                      ...prev,
                      cornersDotOptions: { ...prev.cornersDotOptions, color },
                    }))
                  }
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
                value={options.cornersSquareOptions?.type}
                onValueChange={(type) =>
                  setOptions((prev) => ({
                    ...prev,
                    cornersSquareOptions: {
                      ...prev.cornersSquareOptions,
                      type: type as CornerDotType,
                    },
                  }))
                }
              >
                <Radio value="dot">Dot</Radio>
                <Radio value="extra-rounded">Extra Rounded</Radio>
                <Radio value="square">Square</Radio>
              </RadioGroup>

              <div className="">
                <label>Color</label>
                <HexAlphaColorPicker
                  color={options.cornersSquareOptions?.color}
                  onChange={(color) =>
                    setOptions((prev) => ({
                      ...prev,
                      cornersSquareOptions: { ...prev.cornersSquareOptions, color },
                    }))
                  }
                />
              </div>
            </div>
          </AccordionItem>

          <AccordionItem key="image_options" aria-label="ImageOptions" title="ImageOptions">
            <div className="flex flex-col gap-5">
              <Slider
                size="sm"
                className="w-full"
                label="Margin"
                maxValue={20}
                minValue={1}
                step={1}
                value={options.imageOptions?.margin}
                onChange={(margin) =>
                  setOptions((prev) => ({
                    ...prev,
                    imageOptions: {
                      ...prev.imageOptions,
                      margin: typeof margin === "object" ? margin[0] : margin,
                    },
                  }))
                }
              />

              <Slider
                size="sm"
                className="w-full"
                label="Image SIze"
                maxValue={1}
                minValue={0.1}
                step={0.1}
                value={options.imageOptions?.imageSize}
                onChange={(size) =>
                  setOptions((prev) => ({
                    ...prev,
                    imageOptions: {
                      ...prev.imageOptions,
                      imageSize: typeof size === "object" ? size[0] : size,
                    },
                  }))
                }
              />
            </div>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
