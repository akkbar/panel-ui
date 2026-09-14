import { requireElement, setData, setup } from "./core";
import { panelPushButton, type PushButtonHandle } from "./push-button";
import type { AlarmState, AnnunciatorOptions, PushButtonOptions } from "./types";

export interface AnnunciatorHandle {
  setState(state: AlarmState): void;
  getState(): AlarmState;
  acknowledge(): void;
  clear(): void;
  destroy(): void;
}

export function panelAnnunciator(element: HTMLElement | null, options: AnnunciatorOptions = {}): AnnunciatorHandle {
  const el = requireElement(element, "panelAnnunciator");
  const base = setup(el, "annunciator", options, 72);
  setData(el, "tone", options.tone ?? "red");
  el.setAttribute("role", "status");
  el.setAttribute("aria-live", "assertive");
  let state = options.state ?? "normal";
  const setState = (next: AlarmState) => {
    state = next;
    setData(el, "state", next);
    const name = options.label ?? el.textContent?.trim() ?? "Alarm";
    el.setAttribute("aria-label", `${name}: ${next}`);
  };
  setState(state);
  return {
    setState,
    getState: () => state,
    acknowledge: () => { if (state === "active") setState("acknowledged"); },
    clear: () => setState("normal"),
    destroy: base.destroy,
  };
}

export function panelAcknowledgeButton(
  element: HTMLButtonElement | null,
  options: PushButtonOptions = {},
): PushButtonHandle {
  const el = requireElement(element, "panelAcknowledgeButton");
  el.classList.add("pnl-acknowledge-button");
  const handle = panelPushButton(el, { tone: "amber", ...options });
  const destroy = handle.destroy;
  handle.destroy = () => { el.classList.remove("pnl-acknowledge-button"); destroy(); };
  return handle;
}
