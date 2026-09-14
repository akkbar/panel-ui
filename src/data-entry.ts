import { requireElement, setData, setup, watchElementState, watchFormReset } from "./core";
import { panelInput, type InputHandle } from "./input";
import type { Handle, KeypadOptions, NumericStepperOptions, SelectOptions, UnitFieldOptions } from "./types";

function cssPixels(value: number | `${number}px` | undefined): string | undefined {
  if (value === undefined) return undefined;
  const result = typeof value === "number" ? `${value}px` : value;
  if (!/^(?:\d+\.?\d*|\.\d+)px$/.test(result) || Number.parseFloat(result) <= 0) {
    throw new Error(`panel-ui: invalid pixel value "${value}"`);
  }
  return result;
}

export interface NumericStepperHandle extends Handle {
  stepUp(): void;
  stepDown(): void;
  setValue(value: number): void;
  getValue(): number;
  setDisabled(disabled: boolean): void;
}

export function panelNumericStepper(
  element: HTMLElement | null,
  options: NumericStepperOptions = {},
): NumericStepperHandle {
  const el = requireElement(element, "panelNumericStepper");
  const input = el.querySelector<HTMLInputElement>('input[type="number"]');
  if (!input) throw new Error('panel-ui: panelNumericStepper expects an input[type="number"]');
  const down = el.querySelector<HTMLButtonElement>('[data-step="down"]');
  const up = el.querySelector<HTMLButtonElement>('[data-step="up"]');
  if (!down || !up) throw new Error('panel-ui: numeric stepper expects buttons with data-step="down" and data-step="up"');
  const base = setup(el, "numeric-stepper", options, 44);
  setData(el, "tone", options.tone ?? "green");
  if (options.step !== undefined) input.step = String(options.step);
  if (options.disabled !== undefined) input.disabled = options.disabled;
  const field = panelInput(input, { tone: options.tone, size: options.size, align: "right", disabled: input.disabled });
  const dispatch = () => input.dispatchEvent(new Event("input", { bubbles: true }));
  const stepUp = () => { input.stepUp(); dispatch(); };
  const stepDown = () => { input.stepDown(); dispatch(); };
  const onUp = () => stepUp();
  const onDown = () => stepDown();
  up.addEventListener("click", onUp);
  down.addEventListener("click", onDown);
  const setDisabled = (disabled: boolean) => { input.disabled = disabled; up.disabled = disabled; down.disabled = disabled; setData(el, "disabled", disabled); };
  setDisabled(input.disabled);
  return {
    stepUp,
    stepDown,
    setValue(value) { field.setValue(value); },
    getValue: () => input.valueAsNumber,
    setDisabled,
    destroy() { up.removeEventListener("click", onUp); down.removeEventListener("click", onDown); field.destroy(); base.destroy(); },
  };
}

export interface KeypadHandle extends Handle {
  setDisabled(disabled: boolean): void;
  clear(): void;
}

export function panelKeypad(element: HTMLElement | null, options: KeypadOptions): KeypadHandle {
  const el = requireElement(element, "panelKeypad");
  const original = el.innerHTML;
  const base = setup(el, "keypad", options, 48);
  setData(el, "tone", options.tone ?? "blue");
  const keys = options.keys ?? ["7", "8", "9", "4", "5", "6", "1", "2", "3", "C", "0", options.allowDecimal ? "." : "⌫"];
  el.replaceChildren(...keys.map((key) => {
    const button = el.ownerDocument.createElement("button");
    button.type = "button";
    button.dataset.key = key;
    button.textContent = key;
    button.setAttribute("aria-label", key === "C" ? "Clear" : key === "⌫" ? "Backspace" : key === "↵" ? "Enter" : key);
    return button;
  }));
  const onClick = (event: MouseEvent) => {
    const button = (event.target as Element).closest<HTMLButtonElement>("button[data-key]");
    if (!button || button.disabled) return;
    const key = button.dataset.key!;
    if (key === "C") options.target.value = "";
    else if (key === "⌫") options.target.value = options.target.value.slice(0, -1);
    else if (key === "↵") options.target.dispatchEvent(new Event("change", { bubbles: true }));
    else options.target.value += key;
    options.target.dispatchEvent(new Event("input", { bubbles: true }));
  };
  el.addEventListener("click", onClick);
  const setDisabled = (disabled: boolean) => {
    el.querySelectorAll<HTMLButtonElement>("button").forEach((button) => { button.disabled = disabled; });
    setData(el, "disabled", disabled);
  };
  setDisabled(options.disabled ?? false);
  return { setDisabled, clear() { options.target.value = ""; options.target.dispatchEvent(new Event("input", { bubbles: true })); }, destroy() { el.removeEventListener("click", onClick); el.innerHTML = original; base.destroy(); } };
}

export interface SelectHandle extends Handle {
  setValue(value: string): void;
  getValue(): string;
  setDisabled(disabled: boolean): void;
}

export function panelSelect(element: HTMLSelectElement | null, options: SelectOptions = {}): SelectHandle {
  const el = requireElement(element, "panelSelect");
  const width = cssPixels(options.width);
  const originalWidth = el.style.getPropertyValue("--pnl-select-width");
  const base = setup(el, "select", options, 44);
  setData(el, "tone", options.tone ?? "green");
  if (width) el.style.setProperty("--pnl-select-width", width);
  const sync = () => setData(el, "disabled", el.disabled);
  sync();
  const watcher = watchElementState(el, () => `${el.value}|${el.disabled}`, sync);
  const resetWatcher = watchFormReset(el, sync);
  return {
    setValue(value) { el.value = value; sync(); },
    getValue: () => el.value,
    setDisabled(disabled) { el.disabled = disabled; sync(); },
    destroy() { watcher.destroy(); resetWatcher.destroy(); if (originalWidth) el.style.setProperty("--pnl-select-width", originalWidth); else el.style.removeProperty("--pnl-select-width"); base.destroy(); },
  };
}

export interface UnitFieldHandle extends InputHandle { setUnit(unit: string): void; }

export function panelUnitField(element: HTMLElement | null, options: UnitFieldOptions): UnitFieldHandle {
  const el = requireElement(element, "panelUnitField");
  const input = el.querySelector<HTMLInputElement>("input");
  if (!input) throw new Error("panel-ui: panelUnitField expects an input child");
  const originalUnitNode = el.querySelector<HTMLElement>("[data-unit]");
  const unitNode = originalUnitNode ?? el.ownerDocument.createElement("span");
  if (!originalUnitNode) { unitNode.dataset.unit = ""; el.append(unitNode); }
  const originalUnit = unitNode.textContent;
  const base = setup(el, "unit-field", options, 44);
  const field = panelInput(input, options);
  const destroyField = field.destroy.bind(field);
  const setUnit = (unit: string) => { unitNode.textContent = unit; };
  setUnit(options.unit);
  return Object.assign(field, {
    setUnit,
    destroy() { destroyField(); base.destroy(); if (originalUnitNode) unitNode.textContent = originalUnit; else unitNode.remove(); },
  });
}
