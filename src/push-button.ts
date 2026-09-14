import { requireElement, setData, setup, watchElementState } from "./core";
import type { AsyncButtonOptions, ButtonState, Handle, PushButtonOptions } from "./types";

export interface PushButtonHandle extends Handle {
  setState(state: ButtonState): void;
  getState(): ButtonState;
  setDisabled(disabled: boolean): void;
  runAsync<T>(task: () => Promise<T>, options?: AsyncButtonOptions): Promise<T>;
  press(): void;
  release(): void;
}

export function panelPushButton(
  element: HTMLButtonElement | null,
  options: PushButtonOptions = {},
): PushButtonHandle {
  const el = requireElement(element, "panelPushButton");
  const base = setup(el, "push-button", options, 78);
  setData(el, "tone", options.tone ?? "green");
  setData(el, "momentary", options.momentary ?? true);

  let state: ButtonState = options.state ?? "idle";
  let running = false;
  let resetTimer: number | undefined;
  const applyState = (next: ButtonState) => {
    state = next;
    setData(el, "state", next);
    el.setAttribute("aria-busy", String(next === "loading"));
  };
  const setState = (next: ButtonState) => {
    if (resetTimer !== undefined) window.clearTimeout(resetTimer);
    resetTimer = undefined;
    applyState(next);
  };
  const setDisabled = (disabled: boolean) => {
    el.disabled = disabled;
    setData(el, "disabled", disabled);
  };
  const scheduleIdle = (from: ButtonState, delay: number) => {
    if (resetTimer !== undefined) window.clearTimeout(resetTimer);
    resetTimer = window.setTimeout(() => {
      if (state === from) applyState("idle");
      resetTimer = undefined;
    }, Math.max(0, delay));
  };
  const runAsync = async <T>(task: () => Promise<T>, asyncOptions: AsyncButtonOptions = {}): Promise<T> => {
    if (running) throw new Error("panel-ui: this push button is already running an async action");
    running = true;
    const wasDisabled = el.disabled;
    if (!asyncOptions.allowInteraction) setDisabled(true);
    setState("loading");
    try {
      const result = await task();
      applyState("success");
      scheduleIdle("success", asyncOptions.resetDelay ?? 1200);
      return result;
    } catch (error) {
      applyState("fault");
      scheduleIdle("fault", asyncOptions.resetDelay ?? 1800);
      throw error;
    } finally {
      running = false;
      if (!asyncOptions.allowInteraction) setDisabled(wasDisabled);
    }
  };
  const press = () => setData(el, "pressed", true);
  const release = () => setData(el, "pressed", false);
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === " " || event.key === "Enter") press();
  };
  const onKeyUp = (event: KeyboardEvent) => {
    if (event.key === " " || event.key === "Enter") release();
  };
  const onPointerDown = () => press();
  const onPointerUp = () => release();
  el.addEventListener("keydown", onKeyDown);
  el.addEventListener("keyup", onKeyUp);
  el.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointerup", onPointerUp);
  setState(state);
  setDisabled(el.disabled);
  const stateWatcher = watchElementState(el, () => String(el.disabled), () => setData(el, "disabled", el.disabled));

  return {
    setState,
    getState: () => state,
    setDisabled,
    runAsync,
    press,
    release,
    destroy() {
      stateWatcher.destroy();
      if (resetTimer !== undefined) window.clearTimeout(resetTimer);
      el.removeEventListener("keydown", onKeyDown);
      el.removeEventListener("keyup", onKeyUp);
      el.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      base.destroy();
    },
  };
}
