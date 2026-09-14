import { requireElement, setData, setup } from "./core";
import type { BarGraphOptions, Handle, MeterOptions } from "./types";

export interface MeterHandle extends Handle {
  setValue(value: number): void;
  getValue(): number;
}

function range(options: MeterOptions) {
  const min = options.min ?? 0;
  const max = options.max ?? 100;
  if (!(max > min)) throw new Error("panel-ui: meter max must be greater than min");
  return { min, max };
}

function clamp(value: number, min: number, max: number) { return Math.min(max, Math.max(min, value)); }

function decorateMeter(el: HTMLElement, part: string, options: MeterOptions, basePx: number) {
  const bounds = range(options);
  const base = setup(el, part, options, basePx);
  setData(el, "tone", options.tone ?? "green");
  el.setAttribute("role", "meter");
  el.setAttribute("aria-valuemin", String(bounds.min));
  el.setAttribute("aria-valuemax", String(bounds.max));
  if (options.label) el.setAttribute("aria-label", options.label);
  return { ...bounds, base };
}

export function panelGauge(element: HTMLElement | null, options: MeterOptions = {}): MeterHandle {
  const el = requireElement(element, "panelGauge");
  const original = el.innerHTML;
  const { min, max, base } = decorateMeter(el, "gauge", options, 120);
  el.innerHTML = '<output></output><small></small>';
  const output = el.querySelector("output")!;
  el.querySelector("small")!.textContent = options.unit ?? "";
  let value = options.value ?? min;
  const setValue = (next: number) => {
    value = clamp(next, min, max);
    const ratio = (value - min) / (max - min);
    el.style.setProperty("--pnl-meter-percent", `${ratio * 100}%`);
    output.textContent = value.toFixed(options.decimals ?? 0);
    el.setAttribute("aria-valuenow", String(value));
  };
  setValue(value);
  return { setValue, getValue: () => value, destroy() { el.innerHTML = original; base.destroy(); } };
}

export function panelBarGraph(element: HTMLElement | null, options: BarGraphOptions = {}): MeterHandle {
  const el = requireElement(element, "panelBarGraph");
  const original = el.innerHTML;
  const { min, max, base } = decorateMeter(el, "bar-graph", options, 160);
  el.innerHTML = '<span class="pnl-bar-fill"></span><output></output>';
  setData(el, "orientation", options.orientation ?? "horizontal");
  setData(el, "textPosition", options.textPosition ?? "inside");
  el.style.setProperty("--pnl-segments", String(options.segments ?? 12));
  const output = el.querySelector("output")!;
  let value = options.value ?? min;
  const setValue = (next: number) => {
    value = clamp(next, min, max);
    el.style.setProperty("--pnl-meter-percent", `${((value - min) / (max - min)) * 100}%`);
    output.textContent = `${value.toFixed(options.decimals ?? 0)}${options.unit ? ` ${options.unit}` : ""}`;
    el.setAttribute("aria-valuenow", String(value));
  };
  setValue(value);
  return { setValue, getValue: () => value, destroy() { el.innerHTML = original; base.destroy(); } };
}
