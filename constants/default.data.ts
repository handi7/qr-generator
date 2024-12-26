import {
  BackgroundOptions,
  CornersDotOptions,
  CornersSquareOptions,
  DotsOptions,
  ImageOptions,
} from "@/types/default.type";
import { Options } from "qr-code-styling";

export const mainBg: BackgroundOptions = { color: "#ffffff", round: 0.08 };

export const mainDots: DotsOptions = { color: "#4267b2", type: "rounded" };

export const mainCornersDot: CornersDotOptions = { color: "#4267b2", type: "square" };

export const mainCornersSquare: CornersSquareOptions = { color: "#4267b2", type: "square" };

export const mainImage: ImageOptions = { margin: 0, imageSize: 1 };

export const main: Partial<Options> = {
  width: 240,
  height: 240,
  shape: "square",
  margin: 10,
  imageOptions: mainImage,
  backgroundOptions: mainBg,
  dotsOptions: mainDots,
  cornersDotOptions: mainCornersDot,
  cornersSquareOptions: mainCornersSquare,
};
