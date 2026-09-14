import type { BaseOptions, Handle, PanelNamedSize, PanelSize } from "./types";

const aliases: Record<string, PanelNamedSize> = {
  sm: "small",
  md: "medium",
  lg: "large",
};

const namedSizes = new Set<PanelNamedSize>(["xsmall", "small", "medium", "big", "large"]);

function resolveSize(size: PanelSize | undefined, basePx: number): { name: string; scale?: number } {
  if (size === undefined) return { name: "medium" };
  if (typeof size === "number") {
    if (!Number.isFinite(size) || size <= 0) throw new Error("panel-ui: numeric size must be greater than 0");
    return { name: `${size}px`, scale: size / basePx };
  }
  const named = aliases[size] ?? size;
  if (namedSizes.has(named as PanelNamedSize)) return { name: named };
  if (/^(?:\d+\.?\d*|\.\d+)px$/.test(size)) {
    const pixels = Number.parseFloat(size);
    if (pixels > 0) return { name: `${pixels}px`, scale: pixels / basePx };
  }
  throw new Error(`panel-ui: invalid size "${size}"`);
}

export function requireElement<T extends Element>(el: T | null, name: string): T {
  if (!el) throw new Error(`panel-ui: ${name} requires an element`);
  return el;
}

export function setup(el: HTMLElement, part: string, options: BaseOptions = {}, basePx = 1): Handle {
  const originalClass = el.className;
  const originalDisabled = "disabled" in el ? Boolean((el as HTMLButtonElement).disabled) : undefined;
  const originalSize = el.dataset.size;
  const originalUnit = el.style.getPropertyValue("--pnl-unit");
  const size = resolveSize(options.size, basePx);
  el.classList.add("pnl", `pnl-${part}`);
  el.dataset.size = size.name;
  if (size.scale !== undefined) el.style.setProperty("--pnl-unit", String(size.scale));
  if (options.label) el.setAttribute("aria-label", options.label);
  if (options.disabled !== undefined && "disabled" in el) {
    (el as HTMLButtonElement).disabled = options.disabled;
  }
  return {
    destroy() {
      el.className = originalClass;
      if (originalSize === undefined) delete el.dataset.size;
      else el.dataset.size = originalSize;
      if (originalUnit) el.style.setProperty("--pnl-unit", originalUnit);
      else el.style.removeProperty("--pnl-unit");
      if (originalDisabled !== undefined) (el as HTMLButtonElement).disabled = originalDisabled;
    },
  };
}

export function setData(el: HTMLElement, key: string, value: string | boolean): void {
  el.dataset[key] = String(value);
}

/** Polls native DOM properties once per animation frame so property assignments made
 * without an event still reach the visual wrapper. */
export function watchElementState(
  el: HTMLElement,
  read: () => string,
  sync: () => void,
): Handle {
  const view = el.ownerDocument.defaultView;
  let active = true;
  let frame = 0;
  let snapshot = read();
  const schedule = (callback: FrameRequestCallback): number => {
    if (view?.requestAnimationFrame) return view.requestAnimationFrame(callback);
    return (view ?? window).setTimeout(() => callback(Date.now()), 16);
  };
  const tick: FrameRequestCallback = () => {
    if (!active) return;
    const next = read();
    if (next !== snapshot) {
      snapshot = next;
      sync();
    }
    frame = schedule(tick);
  };
  frame = schedule(tick);
  return {
    destroy() {
      active = false;
      if (view?.cancelAnimationFrame) view.cancelAnimationFrame(frame);
      else (view ?? window).clearTimeout(frame);
    },
  };
}

/** Native reset values are applied after the reset event begins. Queueing the sync
 * updates the component after the browser has restored default form values. */
export function watchFormReset(input: HTMLInputElement | HTMLSelectElement, sync: () => void): Handle {
  const form = input.form;
  const onReset = () => queueMicrotask(sync);
  form?.addEventListener("reset", onReset);
  return { destroy: () => form?.removeEventListener("reset", onReset) };
}
