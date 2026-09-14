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
