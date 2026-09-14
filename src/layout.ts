import { requireElement, setData } from "./core";
import type { ControlGroupOptions, Handle, LayoutOptions } from "./types";

function layout(element: HTMLElement | null, part: string, options: LayoutOptions = {}): Handle {
  const el = requireElement(element, part);
  const original = el.className;
  el.classList.add("pnl", `pnl-${part}`);
  setData(el, "variant", options.variant ?? "flat");
  if (options.label) el.setAttribute("aria-label", options.label);
  return { destroy() { el.className = original; delete el.dataset.variant; } };
}

export const panelSurface = (element: HTMLElement | null, options: LayoutOptions = {}) => layout(element, "surface", options);
export const panelBezel = (element: HTMLElement | null, options: LayoutOptions = {}) => layout(element, "bezel", options);
export const panelFieldset = (element: HTMLElement | null, options: LayoutOptions = {}) => layout(element, "fieldset", options);

export function panelControlGroup(element: HTMLElement | null, options: ControlGroupOptions = {}): Handle {
  const el = requireElement(element, "panelControlGroup");
  const originalColumns = el.style.getPropertyValue("--pnl-group-columns");
  const originalGap = el.style.getPropertyValue("--pnl-group-gap");
  const base = layout(el, "control-group", options);
  el.style.setProperty("--pnl-group-columns", String(Math.max(1, options.columns ?? 1)));
  el.style.setProperty("--pnl-group-gap", `${Math.max(0, options.gap ?? 20)}px`);
  return { destroy() { if (originalColumns) el.style.setProperty("--pnl-group-columns", originalColumns); else el.style.removeProperty("--pnl-group-columns"); if (originalGap) el.style.setProperty("--pnl-group-gap", originalGap); else el.style.removeProperty("--pnl-group-gap"); base.destroy(); } };
}
