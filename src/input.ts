import { requireElement, setData, setup, watchElementState, watchFormReset } from "./core";
import type { Handle, InputFieldOptions } from "./types";

export interface InputHandle extends Handle {
  setValue(value: string | number): void;
  getValue(): string;
  setDisabled(disabled: boolean): void;
  setInvalid(invalid: boolean): void;
  focus(): void;
}

function resolveWidth(width: InputFieldOptions["width"]): string | undefined {
  if (width === undefined) return undefined;
  if (typeof width === "number") {
    if (!Number.isFinite(width) || width <= 0) throw new Error("panel-ui: input width must be greater than 0");
    return `${width}px`;
  }
  if (!/^(?:\d+\.?\d*|\.\d+)px$/.test(width) || Number.parseFloat(width) <= 0) {
    throw new Error(`panel-ui: invalid input width "${width}"`);
  }
  return width;
}

export function panelInput(
  element: HTMLInputElement | null,
  options: InputFieldOptions = {},
): InputHandle {
  const el = requireElement(element, "panelInput");
  const width = resolveWidth(options.width);
  const originalWidth = el.style.getPropertyValue("--pnl-input-width");
  const originalInvalid = el.getAttribute("aria-invalid");
  const base = setup(el, "input", options, 44);
  setData(el, "tone", options.tone ?? "green");
  setData(el, "align", options.align ?? (el.type === "number" ? "right" : "left"));
  if (width) el.style.setProperty("--pnl-input-width", width);

  const setDisabled = (disabled: boolean) => {
    el.disabled = disabled;
    setData(el, "disabled", disabled);
  };
  const setInvalid = (invalid: boolean) => {
    setData(el, "invalid", invalid);
    el.setAttribute("aria-invalid", String(invalid));
  };
  const syncNativeState = () => {
    setData(el, "disabled", el.disabled);
    setData(el, "empty", el.value === "");
  };
  setDisabled(el.disabled);
  setInvalid(options.invalid ?? false);
  syncNativeState();
  const stateWatcher = watchElementState(el, () => `${el.value}|${el.disabled}`, syncNativeState);
  const resetWatcher = watchFormReset(el, syncNativeState);

  return {
    setValue(value) { el.value = String(value); syncNativeState(); },
    getValue: () => el.value,
    setDisabled,
    setInvalid,
    focus: () => el.focus(),
    destroy() {
      stateWatcher.destroy();
      resetWatcher.destroy();
      if (originalWidth) el.style.setProperty("--pnl-input-width", originalWidth);
      else el.style.removeProperty("--pnl-input-width");
      if (originalInvalid === null) el.removeAttribute("aria-invalid");
      else el.setAttribute("aria-invalid", originalInvalid);
      base.destroy();
    },
  };
}
