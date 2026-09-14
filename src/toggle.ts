import { requireElement, setData, setup, watchElementState, watchFormReset } from "./core";
import type { Handle, ToggleOptions } from "./types";

export interface ToggleHandle extends Handle {
  setChecked(checked: boolean): void;
  setDisabled(disabled: boolean): void;
}

export function panelToggle(element: HTMLElement | null, options: ToggleOptions = {}): ToggleHandle {
  const el = requireElement(element, "panelToggle");
  const input = el.querySelector<HTMLInputElement>('input[type="checkbox"]');
  if (!input) throw new Error('panel-ui: panelToggle expects an input[type="checkbox"]');
  const base = setup(el, "toggle", options, 64);
  setData(el, "tone", options.tone ?? "green");
  el.style.setProperty("--pnl-on-label", `'${options.onLabel ?? "ON"}'`);
  el.style.setProperty("--pnl-off-label", `'${options.offLabel ?? "OFF"}'`);
  if (options.disabled !== undefined) input.disabled = options.disabled;

  const sync = () => {
    setData(el, "checked", input.checked);
    setData(el, "disabled", input.disabled);
  };
  input.addEventListener("change", sync);
  sync();
  const stateWatcher = watchElementState(el, () => `${input.checked}|${input.disabled}`, sync);
  const resetWatcher = watchFormReset(input, sync);
  return {
    setChecked(checked) {
      input.checked = checked;
      sync();
    },
    setDisabled(disabled) {
      input.disabled = disabled;
      sync();
    },
    destroy() {
      stateWatcher.destroy();
      resetWatcher.destroy();
      input.removeEventListener("change", sync);
      base.destroy();
    },
  };
}
