export type PanelNamedSize = "xsmall" | "small" | "medium" | "big" | "large";
export type PanelLegacySize = "sm" | "md" | "lg";
export type PanelPixelSize = number | `${number}px`;
export type PanelSize = PanelNamedSize | PanelLegacySize | PanelPixelSize;
export type PanelTone = "green" | "red" | "amber" | "blue" | "white";
export type LampStatus = "off" | "on" | "fault" | "blink";
export type ButtonState = "idle" | "active" | "loading" | "success" | "fault";

export interface Handle {
  destroy(): void;
}

export interface BaseOptions {
  size?: PanelSize;
  disabled?: boolean;
  label?: string;
}

export interface PushButtonOptions extends BaseOptions {
  tone?: PanelTone;
  state?: ButtonState;
  momentary?: boolean;
}

export interface AsyncButtonOptions {
  /** How long success/fault feedback remains visible before returning to idle. */
  resetDelay?: number;
  /** Keep the button enabled while the Promise is running. Default: false. */
  allowInteraction?: boolean;
}

export interface ToggleOptions extends BaseOptions {
  onLabel?: string;
  offLabel?: string;
  tone?: PanelTone;
}

export interface ToggleButtonOptions extends BaseOptions {
  tone?: PanelTone;
  shape?: "square" | "round";
}

export type InputAlignment = "left" | "center" | "right";

export interface InputFieldOptions extends BaseOptions {
  tone?: PanelTone;
  align?: InputAlignment;
  width?: number | `${number}px`;
  invalid?: boolean;
}

export interface PilotLampOptions extends BaseOptions {
  tone?: PanelTone;
  status?: LampStatus;
}

export interface TagOptions extends Pick<BaseOptions, "size" | "label"> {
  description?: string;
  kind?: "device" | "signal" | "alarm";
}

export interface SelectorOptions extends BaseOptions {
  tone?: PanelTone;
  startAngle?: number;
  endAngle?: number;
}

export interface EmergencyStopOptions extends BaseOptions {
  engaged?: boolean;
  latching?: boolean;
}

export interface GuardedButtonOptions extends BaseOptions {
  tone?: PanelTone;
  open?: boolean;
}

export interface MeterOptions extends Pick<BaseOptions, "size" | "label"> {
  min?: number;
  max?: number;
  value?: number;
  unit?: string;
  decimals?: number;
  tone?: PanelTone;
}

export interface AnalogMeterOptions extends MeterOptions {
  low?: number;
  high?: number;
}

export interface BarGraphOptions extends MeterOptions {
  orientation?: "horizontal" | "vertical";
  segments?: number;
}

export type AlarmState = "normal" | "active" | "acknowledged" | "shelved";

export interface AnnunciatorOptions extends Pick<BaseOptions, "size" | "label"> {
  state?: AlarmState;
  tone?: PanelTone;
}

export interface NumericStepperOptions extends BaseOptions {
  tone?: PanelTone;
  step?: number;
}

export interface KeypadOptions extends Pick<BaseOptions, "size" | "label" | "disabled"> {
  target: HTMLInputElement;
  keys?: string[];
  tone?: PanelTone;
  allowDecimal?: boolean;
}

export interface SelectOptions extends BaseOptions {
  tone?: PanelTone;
  width?: number | `${number}px`;
}

export interface UnitFieldOptions extends InputFieldOptions {
  unit: string;
}

export interface LayoutOptions extends Pick<BaseOptions, "label"> {
  variant?: "flat" | "raised" | "recessed";
}

export interface ControlGroupOptions extends LayoutOptions {
  columns?: number;
  gap?: number;
}
