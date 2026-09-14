import { requireElement, setData, setup, watchElementState, watchFormReset } from "./core";
import type { Handle, SelectorOptions } from "./types";

export interface SelectorHandle extends Handle {
  setIndex(index: number): void;
  getIndex(): number;
  setValue(value: string): void;
  getValue(): string;
  setDisabled(disabled: boolean): void;
}

export function panelSelector(element: HTMLElement | null, options: SelectorOptions = {}): SelectorHandle {
  const el = requireElement(element, "panelSelector");
  const select = el.querySelector<HTMLSelectElement>("select");
  if (!select) throw new Error("panel-ui: panelSelector expects a native select element");
  const base = setup(el, "selector", options, 72);
  setData(el, "tone", options.tone ?? "white");
  if (options.disabled !== undefined) select.disabled = options.disabled;

  const sync = () => {
    const count = Math.max(1, select.options.length - 1);
    const start = options.startAngle ?? -55;
    const end = options.endAngle ?? 55;
    const angle = start + ((end - start) * Math.max(0, select.selectedIndex)) / count;
    el.style.setProperty("--pnl-selector-angle", `${angle}deg`);
    const displayValue = select.options[select.selectedIndex]?.text ?? select.value;
    setData(el, "value", displayValue);
    const label = el.querySelector<HTMLElement>("[data-position-label]");
    if (label) label.textContent = displayValue;
    setData(el, "disabled", select.disabled);
  };
  select.addEventListener("change", sync);
  sync();
  const watcher = watchElementState(el, () => `${select.selectedIndex}|${select.disabled}`, sync);
  const resetWatcher = watchFormReset(select, sync);

  return {
    setIndex(index) { select.selectedIndex = Math.max(0, Math.min(select.options.length - 1, index)); sync(); },
    getIndex: () => select.selectedIndex,
    setValue(value) { select.value = value; sync(); },
    getValue: () => select.value,
    setDisabled(disabled) { select.disabled = disabled; sync(); },
    destroy() { watcher.destroy(); resetWatcher.destroy(); select.removeEventListener("change", sync); base.destroy(); },
  };
}
