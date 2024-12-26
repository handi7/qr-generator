import { CornerDotType, CornerSquareType, DotType } from "qr-code-styling";

export interface BackgroundOptions {
  color?: string;
  round?: number;
}

export interface DotsOptions {
  type?: DotType;
  color?: string;
}

export interface CornersDotOptions {
  type?: CornerDotType;
  color?: string;
}

export interface CornersSquareOptions {
  type?: CornerSquareType;
  color?: string;
}

export interface ImageOptions {
  margin?: number;
  imageSize?: number;
}
