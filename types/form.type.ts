import { CornerDotType, CornerSquareType, DotType } from "qr-code-styling";

export interface OptionsForm {
  bg_round?: number;
  bg_color?: string;
  dot_type?: DotType;
  dot_color?: string;
  corner_dot_type?: CornerDotType;
  corner_dot_color?: string;
  corner_square_type?: CornerSquareType;
  corner_square_color?: string;
  image?: string;
  img_margin?: number;
  img_size?: number;
}
