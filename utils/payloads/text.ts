import { PayloadCodec } from "@/types/payload.type";

export interface TextState {
  text: string;
}

const empty: TextState = { text: "" };

const textCodec: PayloadCodec<TextState> = {
  key: "text",
  empty,
  defaultText: "https://gaweqr.my.id/",

  // The catch-all: anything is valid free text, so the registry only ever
  // consults this codec after every specific one has declined.
  detect: () => true,

  parse: (text) => ({ text }),

  build: (state) => state.text,

  paramKeys: [],
  toParams: () => ({}),
  fromParams: () => null,
};

export default textCodec;
