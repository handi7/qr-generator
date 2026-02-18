"use client";

import { Input, InputProps } from "@heroui/react";
import React from "react";

function InputNumber(props: InputProps) {
  return (
    <Input type="number" size="sm" radius="sm" color="primary" variant="bordered" {...props} />
  );
}

export default InputNumber;
