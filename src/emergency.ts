import { requireElement, setData, setup } from "./core";
import { panelPushButton, type PushButtonHandle } from "./push-button";
import type { EmergencyStopOptions, GuardedButtonOptions, Handle } from "./types";

export interface EmergencyStopHandle extends Handle {
  setEngaged(engaged: boolean): void;
  isEngaged(): boolean;
  engage(): void;
  release(): void;
}

export function panelEmergencyStop(
  element: HTMLButtonElement | null,
  options: EmergencyStopOptions = {},
): EmergencyStopHandle {
  const el = requireElement(element, "panelEmergencyStop");
  const base = setup(el, "emergency-stop", options, 96);
  setData(el, "latching", options.latching ?? true);
  let engaged = options.engaged ?? false;
  const setEngaged = (next: boolean) => {
    engaged = next;
    setData(el, "engaged", next);
    el.setAttribute("aria-pressed", String(next));
  };
  const onClick = () => {
    if (options.latching ?? true) setEngaged(!engaged);
  };
  el.addEventListener("click", onClick);
  setEngaged(engaged);
  return {
    setEngaged,
    isEngaged: () => engaged,
    engage: () => setEngaged(true),
    release: () => setEngaged(false),
    destroy() { el.removeEventListener("click", onClick); base.destroy(); },
  };
}

export interface GuardedButtonHandle extends PushButtonHandle {
  openGuard(): void;
  closeGuard(): void;
  isGuardOpen(): boolean;
}

export function panelGuardedButton(
  element: HTMLElement | null,
  options: GuardedButtonOptions = {},
): GuardedButtonHandle {
  const el = requireElement(element, "panelGuardedButton");
  const button = el.querySelector<HTMLButtonElement>("button");
  if (!button) throw new Error("panel-ui: panelGuardedButton expects a button child");
  const base = setup(el, "guarded-button", options, 88);
  const push = panelPushButton(button, { tone: options.tone ?? "red", size: "small", disabled: options.disabled });
  let open = options.open ?? false;
  const setOpen = (next: boolean) => { open = next; setData(el, "open", next); };
  const onGuardClick = (event: MouseEvent) => {
    if (open) return;
    event.preventDefault();
    event.stopPropagation();
    setOpen(true);
  };
  const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
  el.addEventListener("click", onGuardClick, true);
  el.addEventListener("keydown", onKeyDown);
  setOpen(open);
  const destroyPush = push.destroy.bind(push);
  return Object.assign(push, {
    openGuard: () => setOpen(true),
    closeGuard: () => setOpen(false),
    isGuardOpen: () => open,
    destroy() { el.removeEventListener("click", onGuardClick, true); el.removeEventListener("keydown", onKeyDown); destroyPush(); base.destroy(); },
  });
}
