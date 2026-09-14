import { requireElement, setData, setup } from "./core";
import type { Handle, LampStatus, PilotLampOptions } from "./types";

export interface PilotLampHandle extends Handle {
  setStatus(status: LampStatus): void;
}

export function panelPilotLamp(element: HTMLElement | null, options: PilotLampOptions = {}): PilotLampHandle {
  const el = requireElement(element, "panelPilotLamp");
  const base = setup(el, "pilot-lamp", options, 38);
  setData(el, "tone", options.tone ?? "green");
  el.setAttribute("role", el.getAttribute("role") ?? "status");
  el.setAttribute("aria-live", "polite");
  const setStatus = (status: LampStatus) => {
    setData(el, "status", status);
    el.setAttribute("aria-label", options.label ? `${options.label}: ${status}` : status);
  };
  setStatus(options.status ?? "off");
  return { setStatus, destroy: base.destroy };
}
