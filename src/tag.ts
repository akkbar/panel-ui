import { requireElement, setup } from "./core";
import type { Handle, TagOptions } from "./types";

export function panelTag(element: HTMLElement | null, options: TagOptions = {}): Handle {
  const el = requireElement(element, "panelTag");
  const originalKind = el.dataset.kind;
  const originalDescription = el.dataset.description;
  const base = setup(el, "tag", options, 74);
  el.dataset.kind = options.kind ?? "device";
  if (options.description) el.dataset.description = options.description;
  return {
    destroy() {
      if (originalKind === undefined) delete el.dataset.kind;
      else el.dataset.kind = originalKind;
      if (originalDescription === undefined) delete el.dataset.description;
      else el.dataset.description = originalDescription;
      base.destroy();
    },
  };
}
