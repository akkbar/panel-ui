import { panelAnnunciator } from "./annunciator";
import { panelInput } from "./input";
import { panelDigitalMeter } from "./meters";
import { panelPilotLamp } from "./pilot-lamp";
import { panelPushButton } from "./push-button";
import { panelToggleButton } from "./toggle-button";
import type { Handle, PanelSize, PanelTone } from "./types";

export interface PanelElementNames {
  pushButton: string;
  pilotLamp: string;
  optionButton: string;
  input: string;
  annunciator: string;
  digitalMeter: string;
}

function numericAttribute(element: Element, name: string, fallback: number): number {
  const value = Number(element.getAttribute(name));
  return Number.isFinite(value) ? value : fallback;
}

/** Register Panel UI custom elements. Calling this more than once is safe. */
export function definePanelElements(prefix = "panel"): PanelElementNames {
  if (typeof customElements === "undefined" || typeof HTMLElement === "undefined") {
    throw new Error("panel-ui: Web Components require a browser customElements registry");
  }
  if (!/^[a-z][a-z0-9]*$/.test(prefix)) throw new Error("panel-ui: custom-element prefix must use lowercase letters and numbers");

  const names: PanelElementNames = {
    pushButton: `${prefix}-push-button`,
    pilotLamp: `${prefix}-pilot-lamp`,
    optionButton: `${prefix}-option-button`,
    input: `${prefix}-input`,
    annunciator: `${prefix}-annunciator`,
    digitalMeter: `${prefix}-digital-meter`,
  };

  abstract class PanelElement extends HTMLElement {
    protected handle: Handle | null = null;
    disconnectedCallback() { this.handle?.destroy(); this.handle = null; }
    protected size(): PanelSize | undefined { return (this.getAttribute("size") as PanelSize | null) ?? undefined; }
    protected tone(): PanelTone | undefined { return (this.getAttribute("tone") as PanelTone | null) ?? undefined; }
  }

  class PushButtonElement extends PanelElement {
    connectedCallback() {
      if (this.handle) return;
      const button = this.querySelector("button") ?? this.ownerDocument.createElement("button");
      if (!button.isConnected) { button.type = "button"; button.textContent = this.textContent?.trim() || "BUTTON"; this.replaceChildren(button); }
      this.handle = panelPushButton(button, { tone: this.tone(), size: this.size(), disabled: this.hasAttribute("disabled") });
    }
  }

  class PilotLampElement extends PanelElement {
    connectedCallback() {
      if (this.handle) return;
      const lamp = this.querySelector<HTMLElement>("[data-lamp]") ?? this.ownerDocument.createElement("span");
      if (!lamp.isConnected) { lamp.dataset.lamp = ""; this.prepend(lamp); }
      this.handle = panelPilotLamp(lamp, {
        tone: this.tone(), size: this.size(), label: this.getAttribute("label") ?? undefined,
        status: (this.getAttribute("status") as "off" | "on" | "fault" | "blink" | null) ?? "off",
      });
    }
  }

  class OptionButtonElement extends PanelElement {
    connectedCallback() {
      if (this.handle) return;
      const label = this.ownerDocument.createElement("label");
      const input = this.ownerDocument.createElement("input");
      const face = this.ownerDocument.createElement("span");
      input.type = (this.getAttribute("type") === "checkbox" ? "checkbox" : "radio");
      input.name = this.getAttribute("name") ?? "";
      input.value = this.getAttribute("value") ?? "on";
      input.checked = this.hasAttribute("checked");
      input.disabled = this.hasAttribute("disabled");
      face.textContent = this.textContent?.trim() || input.value;
      label.append(input, face);
      this.replaceChildren(label);
      this.handle = panelToggleButton(label, { tone: this.tone(), size: this.size() });
    }
  }

  class InputElement extends PanelElement {
    connectedCallback() {
      if (this.handle) return;
      const input = this.querySelector("input") ?? this.ownerDocument.createElement("input");
      if (!input.isConnected) { input.value = this.getAttribute("value") ?? ""; this.replaceChildren(input); }
      this.handle = panelInput(input, {
        tone: this.tone(), size: this.size(), disabled: this.hasAttribute("disabled"),
        width: this.hasAttribute("width") ? numericAttribute(this, "width", 180) : undefined,
      });
    }
  }

  class AnnunciatorElement extends PanelElement {
    connectedCallback() {
      if (this.handle) return;
      this.handle = panelAnnunciator(this, {
        tone: this.tone(), size: this.size(), label: this.getAttribute("label") ?? this.textContent?.trim(),
        state: (this.getAttribute("state") as "normal" | "active" | "acknowledged" | "shelved" | null) ?? "normal",
      });
    }
  }

  class DigitalMeterElement extends PanelElement {
    connectedCallback() {
      if (this.handle) return;
      this.handle = panelDigitalMeter(this, {
        tone: this.tone(), size: this.size(), label: this.getAttribute("label") ?? undefined,
        min: numericAttribute(this, "min", 0), max: numericAttribute(this, "max", 100),
        value: numericAttribute(this, "value", 0), unit: this.getAttribute("unit") ?? undefined,
        decimals: numericAttribute(this, "decimals", 0),
      });
    }
  }

  const definitions: Array<[string, CustomElementConstructor]> = [
    [names.pushButton, PushButtonElement], [names.pilotLamp, PilotLampElement],
    [names.optionButton, OptionButtonElement], [names.input, InputElement],
    [names.annunciator, AnnunciatorElement], [names.digitalMeter, DigitalMeterElement],
  ];
  definitions.forEach(([name, definition]) => { if (!customElements.get(name)) customElements.define(name, definition); });
  return names;
}
