import { cn } from "@heroui/theme";
import { DynamicIcon } from "lucide-react/dynamic";
import { MouseEventHandler } from "react";
import { ClassValue } from "tailwind-variants";

type DynamicIconProps = React.ComponentProps<typeof DynamicIcon>;

interface Props extends Omit<DynamicIconProps, "onClick"> {
  asButton?: boolean;
  wrapperClassName?: ClassValue;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

function Icon(props: Props) {
  const { asButton, wrapperClassName, onClick, size = 18, ...rest } = props;

  if (asButton) {
    return (
      <button
        type="button"
        aria-label="icon button"
        className={cn("cursor-pointer", [wrapperClassName])}
        onClick={onClick}
      >
        <DIcon size={size} {...rest} />
      </button>
    );
  }

  return <DIcon size={size} {...rest} />;
}

function DIcon({ size = 18, className, ...props }: Omit<DynamicIconProps, "onClick">) {
  return (
    <DynamicIcon size={size} tabIndex={-1} {...props} className={cn("outline-none", className)} />
  );
}

export default Icon;
