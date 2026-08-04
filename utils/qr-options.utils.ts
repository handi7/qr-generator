import { CornerDotType, CornerSquareType, DotType, Options, ShapeType } from "qr-code-styling";

import {
  main,
  mainBg,
  mainCornersDot,
  mainCornersSquare,
  mainDots,
  mainImage,
} from "@/constants/default.data";
import { normalizeTemplateType } from "@/utils/template.utils";

/**
 * Turning a Studio query string back into render options.
 *
 * Shared rather than inlined in the Studio because the saved-code preview has
 * to reach the same answer from the same params: two copies would drift, and a
 * preview that disagrees with what Open in Studio shows is worse than no
 * preview at all.
 */

/** What a QR falls back to when the template has no payload yet. */
const FALLBACK_TEXT = "https://gaweqr.my.id";

const MIN_SIZE = 100;
const MAX_MARGIN = 20;

export function dataFromParams(params: URLSearchParams): string {
  const text = params.get("text");

  if (text) return text;

  // Neither template has a sensible starting payload, and falling back to the
  // site URL would be worse than blank — a QRIS placeholder that silently
  // encodes gaweqr.my.id is a payment code pointing at the wrong place.
  const template = normalizeTemplateType(params.get("template") ?? undefined);

  if (template === "email" || template === "qris") return "";

  return FALLBACK_TEXT;
}

/**
 * `image` is passed in rather than read from the store: the Studio renders the
 * live logo slot, while a preview renders that record's own copy.
 */
export function optionsFromParams(params: URLSearchParams, image: string): Partial<Options> {
  const size = Number(params.get("size")) || 320;
  const margin = Number(params.get("margin")) || main.margin || 0;

  return {
    width: size < MIN_SIZE ? MIN_SIZE : size,
    height: size < MIN_SIZE ? MIN_SIZE : size,
    shape: (params.get("shape") || main.shape) as ShapeType,
    margin: margin > MAX_MARGIN ? MAX_MARGIN : margin,
    image,
    backgroundOptions: {
      round: Number(params.get("bg_round")) || mainBg.round,
      color: params.get("bg_color") || mainBg.color,
    },
    dotsOptions: {
      type: (params.get("dot_type") || mainDots.type) as DotType,
      color: params.get("dot_color") || mainDots.color,
    },
    cornersDotOptions: {
      type: (params.get("corner_dot_type") || mainCornersDot.type) as CornerDotType,
      color: params.get("corner_dot_color") || mainCornersDot.color,
    },
    cornersSquareOptions: {
      type: (params.get("corner_square_type") || mainCornersSquare.type) as CornerSquareType,
      color: params.get("corner_square_color") || mainCornersSquare.color,
    },
    imageOptions: {
      margin: Number(params.get("img_margin")) || mainImage.margin,
      imageSize: Number(params.get("img_size")) || mainImage.imageSize,
    },
  };
}

/** The size the record would actually export at, for display next to a preview. */
export function exportSizeFromParams(params: URLSearchParams): number {
  const size = Number(params.get("size")) || 320;

  return size < MIN_SIZE ? MIN_SIZE : size;
}
