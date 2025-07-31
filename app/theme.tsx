"use client";

import { Select, SelectItem } from "@heroui/react";
import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";

type ThemeType = "system" | "light" | "dark";

function ThemeSwitch() {
  const { theme, setTheme } = useTheme();

  const [currentTheme, setCurrentTheme] = useState<ThemeType>();

  useEffect(() => {
    setCurrentTheme(theme as ThemeType);
  }, [theme]);

  return (
    <Select
      size="sm"
      radius="sm"
      label="Theme"
      selectedKeys={currentTheme ? [currentTheme] : []}
      onSelectionChange={(keys) => setTheme(keys.currentKey as ThemeType)}
    >
      <SelectItem key="system">System</SelectItem>
      <SelectItem key="light">Light</SelectItem>
      <SelectItem key="dark">Dark</SelectItem>
    </Select>
  );
}

export default ThemeSwitch;
