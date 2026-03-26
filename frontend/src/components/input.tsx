import { twMerge } from "tailwind-merge";
import { Input as ShadcnInput } from "./ui/input";

export const Input = ({
  className,
  type,
  ...props
}: React.ComponentProps<"input">) => {
  return (
    <ShadcnInput
      className={twMerge("py-2 border-border text-base shadow-none", className)}
      type={type}
      {...props}
    />
  );
};
