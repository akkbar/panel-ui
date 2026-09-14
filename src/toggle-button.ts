import { requireElement, setData, setup, watchElementState, watchFormReset } from "./core";
import type { Handle, ToggleButtonOptions } from "./types";

export interface ToggleButtonHandle extends Handle {
  setChecked(checked: boolean): void;
  isChecked(): boolean;
  setDisabled(disabled: boolean): void;
}

function isSameRadioGroup(a: HTMLInputElement, b: HTMLInputElement): boolean {
  return a.type === "radio" && b.type === "radio" && a.name !== "" && a.name === b.name && a.form === b.form;
}

export function panelToggleButton(
  element: HTMLElement | null,
  options: ToggleButtonOptions = {},
): ToggleButtonHandle {
  const el = requireElement(element, "panelToggleButton");
  const input = el.querySelector<HTMLInputElement>('input[type="checkbox"], input[type="radio"]');
  if (!input) {
    throw new Error('panel-ui: panelToggleButton expects an input[type="checkbox"] or input[type="radio"]');
  }
  const base = setup(el, "toggle-button", options, 52);
  setData(el, "tone", options.tone ?? "green");
  setData(el, "shape", options.shape ?? "square");
  if (options.disabled !== undefined) input.disabled = options.disabled;

  const syncOne = (target: HTMLInputElement, wrapper: HTMLElement) => {
    setData(wrapper, "checked", target.checked);
    setData(wrapper, "disabled", target.disabled);
  };
  const syncGroup = () => {
    syncOne(input, el);
    if (input.type !== "radio") return;
    const radioInputs = Array.from(
      el.ownerDocument.querySelectorAll<HTMLInputElement>('input[type="radio"]'),
    );
    for (const candidate of radioInputs) {
      if (!isSameRadioGroup(input, candidate)) continue;
      const wrapper = candidate.closest(".pnl-toggle-button") as HTMLElement | null;
      if (wrapper) syncOne(candidate, wrapper);
    }
  };
  const onChange = () => syncGroup();
  input.addEventListener("change", onChange);
  syncGroup();
  const stateWatcher = watchElementState(el, () => `${input.checked}|${input.disabled}`, syncGroup);
  const resetWatcher = watchFormReset(input, syncGroup);

  return {
    setChecked(checked) {
      input.checked = checked;
      syncGroup();
    },
    isChecked: () => input.checked,
    setDisabled(disabled) {
      input.disabled = disabled;
      syncGroup();
    },
    destroy() {
      stateWatcher.destroy();
      resetWatcher.destroy();
      input.removeEventListener("change", onChange);
      base.destroy();
    },
  };
}

/** Semantic alias for radio-style option groups. */
export const panelOptionButton = panelToggleButton;
