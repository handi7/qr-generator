"use client";

import { ButtonProps, Button as HeroButton } from "@heroui/react";
import React, { PropsWithChildren } from "react";

interface Props extends PropsWithChildren, ButtonProps {}

function Button({ children, ...props }: Props) {
  return (
    <HeroButton type="button" color="primary" radius="sm" {...props}>
      {children}
    </HeroButton>
  );
}

export default Button;
