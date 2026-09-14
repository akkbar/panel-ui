import {
  createElement,
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
} from "react";
import { panelInput, type InputHandle } from "./input";
import { panelPilotLamp, type PilotLampHandle } from "./pilot-lamp";
import { panelPushButton, type PushButtonHandle } from "./push-button";
import { panelToggle } from "./toggle";
import { panelToggleButton, type ToggleButtonHandle } from "./toggle-button";
import type { InputFieldOptions, PilotLampOptions, PushButtonOptions, ToggleButtonOptions, ToggleOptions } from "./types";

export interface PanelComponentRef<E, H> { element: E | null; handle: H | null; }

function useAttach<E extends HTMLElement, H extends { destroy(): void }>(
  attach: (element: E, options: never) => H,
  options: unknown,
) {
  const elementRef = useRef<E | null>(null);
  const handleRef = useRef<H | null>(null);
  const signature = JSON.stringify(options ?? {});
  useLayoutEffect(() => {
    if (!elementRef.current) return;
    handleRef.current = attach(elementRef.current, (options ?? {}) as never);
    return () => { handleRef.current?.destroy(); handleRef.current = null; };
  }, [attach, signature]);
  return { elementRef, handleRef };
}

export function usePanelControl<E extends HTMLElement, H extends { destroy(): void }, O>(
  attach: (element: E, options: O) => H,
  options: O,
) {
  return useAttach(attach as (element: E, options: never) => H, options);
}

export interface PanelPushButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> { options?: PushButtonOptions; }
export const PanelPushButton = forwardRef(function PanelPushButton(
  { options, children, ...props }: PanelPushButtonProps,
  ref: Ref<PanelComponentRef<HTMLButtonElement, PushButtonHandle>>,
) {
  const binding = useAttach<HTMLButtonElement, PushButtonHandle>(panelPushButton, options);
  useImperativeHandle(ref, () => ({ get element() { return binding.elementRef.current; }, get handle() { return binding.handleRef.current; } }), []);
  return createElement("button", { ...props, ref: binding.elementRef }, children);
});

export interface PanelPilotLampProps extends HTMLAttributes<HTMLSpanElement> { options?: PilotLampOptions; }
export const PanelPilotLamp = forwardRef(function PanelPilotLamp(
  { options, ...props }: PanelPilotLampProps,
  ref: Ref<PanelComponentRef<HTMLSpanElement, PilotLampHandle>>,
) {
  const binding = useAttach<HTMLSpanElement, PilotLampHandle>(panelPilotLamp, options);
  useImperativeHandle(ref, () => ({ get element() { return binding.elementRef.current; }, get handle() { return binding.handleRef.current; } }), []);
  return createElement("span", { ...props, ref: binding.elementRef });
});

export interface PanelInputProps extends InputHTMLAttributes<HTMLInputElement> { options?: InputFieldOptions; }
export const PanelInput = forwardRef(function PanelInput(
  { options, ...props }: PanelInputProps,
  ref: Ref<PanelComponentRef<HTMLInputElement, InputHandle>>,
) {
  const binding = useAttach<HTMLInputElement, InputHandle>(panelInput, options);
  useImperativeHandle(ref, () => ({ get element() { return binding.elementRef.current; }, get handle() { return binding.handleRef.current; } }), []);
  return createElement("input", { ...props, ref: binding.elementRef });
});

interface ChoiceProps extends HTMLAttributes<HTMLLabelElement> {
  options?: ToggleOptions | ToggleButtonOptions;
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
  children?: ReactNode;
}

export const PanelToggle = forwardRef(function PanelToggle(
  { options, inputProps, children, ...props }: ChoiceProps,
  ref: Ref<PanelComponentRef<HTMLLabelElement, ReturnType<typeof panelToggle>>>,
) {
  const binding = useAttach<HTMLLabelElement, ReturnType<typeof panelToggle>>(panelToggle, options);
  useImperativeHandle(ref, () => ({ get element() { return binding.elementRef.current; }, get handle() { return binding.handleRef.current; } }), []);
  return createElement("label", { ...props, ref: binding.elementRef }, createElement("input", { type: "checkbox", ...inputProps }), createElement("span", null, children));
});

export const PanelOptionButton = forwardRef(function PanelOptionButton(
  { options, inputProps, children, ...props }: ChoiceProps,
  ref: Ref<PanelComponentRef<HTMLLabelElement, ToggleButtonHandle>>,
) {
  const binding = useAttach<HTMLLabelElement, ToggleButtonHandle>(panelToggleButton, options);
  useImperativeHandle(ref, () => ({ get element() { return binding.elementRef.current; }, get handle() { return binding.handleRef.current; } }), []);
  return createElement("label", { ...props, ref: binding.elementRef }, createElement("input", { type: "radio", ...inputProps }), createElement("span", null, children));
});
