declare module "react-day-picker" {
  import * as React from "react";

  export type DayPickerProps = {
    mode?: string;
    showOutsideDays?: boolean;
    className?: string;
    classNames?: Record<string, string>;
    components?: Record<string, React.ComponentType<any>>;
    [key: string]: any;
  };

  export function DayPicker(props: DayPickerProps): React.ReactElement;
}
