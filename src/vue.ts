import { defineComponent, h, onBeforeUnmount, onMounted, ref, shallowRef, type PropType, type Ref } from "vue";
import { panelInput } from "./input";
import { panelPilotLamp } from "./pilot-lamp";
import { panelPushButton, type PushButtonHandle } from "./push-button";
import { panelToggleButton, type ToggleButtonHandle } from "./toggle-button";
import type { InputHandle } from "./input";
import type { PilotLampHandle } from "./pilot-lamp";
import type { InputFieldOptions, PilotLampOptions, PushButtonOptions, ToggleButtonOptions } from "./types";

export function usePanelControl<E extends HTMLElement, H extends { destroy(): void }, O>(
  attach: (element: E, options: O) => H,
  options: O,
) {
  const element = ref(null) as Ref<E | null>;
  const handle = shallowRef<H | null>(null);
  onMounted(() => { if (element.value) handle.value = attach(element.value as E, options); });
  onBeforeUnmount(() => { handle.value?.destroy(); handle.value = null; });
  return { element, handle };
}

export const PanelPushButton = defineComponent({
  name: "PanelPushButton",
  inheritAttrs: false,
  props: { options: { type: Object as PropType<PushButtonOptions>, default: () => ({}) } },
  setup(props, { attrs, slots, expose }) {
    const binding = usePanelControl<HTMLButtonElement, PushButtonHandle, PushButtonOptions>(panelPushButton, props.options);
    expose(binding);
    return () => h("button", { ...attrs, ref: binding.element }, slots.default?.());
  },
});

export const PanelPilotLamp = defineComponent({
  name: "PanelPilotLamp",
  inheritAttrs: false,
  props: { options: { type: Object as PropType<PilotLampOptions>, default: () => ({}) } },
  setup(props, { attrs, expose }) {
    const binding = usePanelControl<HTMLElement, PilotLampHandle, PilotLampOptions>(panelPilotLamp, props.options);
    expose(binding);
    return () => h("span", { ...attrs, ref: binding.element });
  },
});

export const PanelInput = defineComponent({
  name: "PanelInput",
  inheritAttrs: false,
  props: { options: { type: Object as PropType<InputFieldOptions>, default: () => ({}) } },
  setup(props, { attrs, expose }) {
    const binding = usePanelControl<HTMLInputElement, InputHandle, InputFieldOptions>(panelInput, props.options);
    expose(binding);
    return () => h("input", { ...attrs, ref: binding.element });
  },
});

export const PanelOptionButton = defineComponent({
  name: "PanelOptionButton",
  inheritAttrs: false,
  props: {
    options: { type: Object as PropType<ToggleButtonOptions>, default: () => ({}) },
    type: { type: String as PropType<"checkbox" | "radio">, default: "radio" },
    name: String,
    value: String,
  },
  setup(props, { attrs, slots, expose }) {
    const binding = usePanelControl<HTMLElement, ToggleButtonHandle, ToggleButtonOptions>(panelToggleButton, props.options);
    expose(binding);
    return () => h("label", { ...attrs, ref: binding.element }, [h("input", { type: props.type, name: props.name, value: props.value }), h("span", null, slots.default?.())]);
  },
});
