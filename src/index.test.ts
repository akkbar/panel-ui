import { beforeEach, describe, expect, it } from "vitest";
import {
  panelAnalogMeter, panelAnnunciator, panelBarGraph, panelControlGroup,
  panelDigitalMeter, panelEmergencyStop, panelGauge, panelGuardedButton,
  panelInput, panelKeypad, panelNumericStepper, panelPilotLamp, panelPushButton,
  panelSelect, panelSelector, panelTag, panelToggle, panelToggleButton, panelUnitField,
} from "./index";
import { definePanelElements } from "./web-components";

describe("panel-ui", () => {
  beforeEach(() => { document.body.innerHTML = ""; });

  const nextFrame = () => new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => resolve());
  });

  it("updates a pilot lamp status", () => {
    const el = document.createElement("i");
    const lamp = panelPilotLamp(el, { status: "off", label: "Trip" });
    lamp.setStatus("fault");
    expect(el.dataset.status).toBe("fault");
    expect(el.getAttribute("aria-label")).toBe("Trip: fault");
  });

  it("keeps the native toggle input in sync", () => {
    const label = document.createElement("label");
    label.innerHTML = '<input type="checkbox">Enable';
    const toggle = panelToggle(label);
    toggle.setChecked(true);
    expect(label.dataset.checked).toBe("true");
    expect(label.querySelector("input")?.checked).toBe(true);
  });

  it("sets push button state", () => {
    const button = document.createElement("button");
    const handle = panelPushButton(button);
    handle.setState("loading");
    expect(button.dataset.state).toBe("loading");
    expect(button.getAttribute("aria-busy")).toBe("true");
  });

  it("disables a push button while an async action is running", async () => {
    const button = document.createElement("button");
    const handle = panelPushButton(button);
    let finish!: (value: string) => void;
    const task = new Promise<string>((resolve) => { finish = resolve; });
    const result = handle.runAsync(() => task, { resetDelay: 0 });
    expect(button.disabled).toBe(true);
    expect(handle.getState()).toBe("loading");
    finish("saved");
    await expect(result).resolves.toBe("saved");
    expect(button.disabled).toBe(false);
    expect(handle.getState()).toBe("success");
  });

  it("shows fault and rethrows when an async action fails", async () => {
    const button = document.createElement("button");
    const handle = panelPushButton(button);
    await expect(handle.runAsync(async () => { throw new Error("network"); })).rejects.toThrow("network");
    expect(handle.getState()).toBe("fault");
    expect(button.disabled).toBe(false);
  });

  it("can disable a toggle programmatically", () => {
    const label = document.createElement("label");
    label.innerHTML = '<input type="checkbox">Enable';
    const toggle = panelToggle(label);
    toggle.setDisabled(true);
    expect(label.querySelector("input")?.disabled).toBe(true);
    expect(label.dataset.disabled).toBe("true");
  });

  it("supports named component sizes", () => {
    const button = document.createElement("button");
    panelPushButton(button, { size: "big" });
    expect(button.dataset.size).toBe("big");
    expect(button.style.getPropertyValue("--pnl-unit")).toBe("");
  });

  it("supports an exact pixel size", () => {
    const lamp = document.createElement("i");
    const handle = panelPilotLamp(lamp, { size: "57px" });
    expect(lamp.dataset.size).toBe("57px");
    expect(lamp.style.getPropertyValue("--pnl-unit")).toBe("1.5");
    handle.destroy();
    expect(lamp.style.getPropertyValue("--pnl-unit")).toBe("");
  });

  it("accepts a number as a pixel size", () => {
    const button = document.createElement("button");
    panelPushButton(button, { size: 156 });
    expect(button.dataset.size).toBe("156px");
    expect(button.style.getPropertyValue("--pnl-unit")).toBe("2");
  });

  it("applies size to a tag", () => {
    const tag = document.createElement("span");
    panelTag(tag, { size: "large" });
    expect(tag.dataset.size).toBe("large");
  });

  it("uses a native checkbox for a toggle button", () => {
    const label = document.createElement("label");
    label.innerHTML = '<input type="checkbox"><span>Latch</span>';
    const handle = panelToggleButton(label, { tone: "amber" });
    handle.setChecked(true);
    expect(handle.isChecked()).toBe(true);
    expect(label.dataset.checked).toBe("true");
  });

  it("keeps native radio option buttons mutually exclusive", () => {
    document.body.innerHTML = `
      <label id="a"><input type="radio" name="mode" checked><span>Auto</span></label>
      <label id="b"><input type="radio" name="mode"><span>Manual</span></label>`;
    const firstElement = document.querySelector<HTMLElement>("#a")!;
    const secondElement = document.querySelector<HTMLElement>("#b")!;
    const first = panelToggleButton(firstElement);
    const second = panelToggleButton(secondElement);
    second.setChecked(true);
    expect(first.isChecked()).toBe(false);
    expect(firstElement.dataset.checked).toBe("false");
    expect(secondElement.dataset.checked).toBe("true");
  });

  it("controls calculator-style input state", () => {
    const input = document.createElement("input");
    input.type = "number";
    const handle = panelInput(input, { width: 180, invalid: true });
    handle.setValue(1450);
    expect(handle.getValue()).toBe("1450");
    expect(input.style.getPropertyValue("--pnl-input-width")).toBe("180px");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    handle.setInvalid(false);
    handle.setDisabled(true);
    expect(input.disabled).toBe(true);
    expect(input.dataset.invalid).toBe("false");
  });

  it("synchronizes a toggle after a native form reset", async () => {
    const form = document.createElement("form");
    form.innerHTML = '<label><input type="checkbox"><span>Enable</span></label>';
    document.body.append(form);
    const label = form.querySelector("label")!;
    const input = form.querySelector("input")!;
    const handle = panelToggle(label);
    handle.setChecked(true);
    expect(label.dataset.checked).toBe("true");
    form.reset();
    await Promise.resolve();
    expect(input.checked).toBe(false);
    expect(label.dataset.checked).toBe("false");
    handle.destroy();
  });

  it("observes direct checked and disabled property assignments", async () => {
    const label = document.createElement("label");
    label.innerHTML = '<input type="checkbox"><span>Latch</span>';
    document.body.append(label);
    const input = label.querySelector("input")!;
    const handle = panelToggleButton(label);
    input.checked = true;
    input.disabled = true;
    await nextFrame();
    expect(label.dataset.checked).toBe("true");
    expect(label.dataset.disabled).toBe("true");
    handle.destroy();
  });

  it("observes direct input value assignments", async () => {
    const input = document.createElement("input");
    document.body.append(input);
    const handle = panelInput(input);
    expect(input.dataset.empty).toBe("true");
    input.value = "external";
    await nextFrame();
    expect(input.dataset.empty).toBe("false");
    handle.destroy();
  });

  it("decorates tag metadata", () => {
    const el = document.createElement("span");
    panelTag(el, { kind: "alarm", description: "Motor trip" });
    expect(el.dataset.kind).toBe("alarm");
    expect(el.dataset.description).toBe("Motor trip");
  });

  it("controls a multi-position rotary selector", () => {
    const el = document.createElement("div");
    el.innerHTML = '<select><option value="off">OFF</option><option value="auto">AUTO</option><option value="hand">HAND</option></select><span data-position-label></span>';
    const selector = panelSelector(el);
    selector.setValue("hand");
    expect(selector.getIndex()).toBe(2);
    expect(el.style.getPropertyValue("--pnl-selector-angle")).toBe("55deg");
    expect(el.querySelector("span")?.textContent).toBe("HAND");
  });

  it("latches and releases an emergency stop", () => {
    const button = document.createElement("button");
    const stop = panelEmergencyStop(button);
    button.click();
    expect(stop.isEngaged()).toBe(true);
    expect(button.getAttribute("aria-pressed")).toBe("true");
    stop.release();
    expect(stop.isEngaged()).toBe(false);
  });

  it("requires a guarded button cover to be opened", () => {
    const el = document.createElement("div");
    el.innerHTML = "<button>TRIP</button>";
    const guarded = panelGuardedButton(el);
    el.querySelector("button")?.click();
    expect(guarded.isGuardOpen()).toBe(true);
    guarded.closeGuard();
    guarded.destroy();
    expect(el.classList.contains("pnl-guarded-button")).toBe(false);
  });

  it("clamps analog, digital, gauge, and bar meter values", () => {
    const factories = [panelAnalogMeter, panelDigitalMeter, panelGauge, panelBarGraph];
    factories.forEach((factory) => {
      const el = document.createElement("div");
      const meter = factory(el, { min: 10, max: 20, value: 15, unit: "A" });
      meter.setValue(30);
      expect(meter.getValue()).toBe(20);
      expect(el.getAttribute("aria-valuenow")).toBe("20");
    });
  });

  it("acknowledges and clears an active alarm", () => {
    const el = document.createElement("div");
    el.textContent = "MOTOR TRIP";
    const alarm = panelAnnunciator(el, { state: "active" });
    alarm.acknowledge();
    expect(alarm.getState()).toBe("acknowledged");
    alarm.clear();
    expect(el.dataset.state).toBe("normal");
  });

  it("steps a native number input and dispatches input", () => {
    const el = document.createElement("div");
    el.innerHTML = '<button data-step="down"></button><input type="number" value="2" step="2"><button data-step="up"></button>';
    let events = 0;
    el.querySelector("input")?.addEventListener("input", () => { events += 1; });
    const stepper = panelNumericStepper(el);
    stepper.stepUp();
    expect(stepper.getValue()).toBe(4);
    expect(events).toBe(1);
  });

  it("enters and clears values with a keypad", () => {
    const target = document.createElement("input");
    const el = document.createElement("div");
    const keypad = panelKeypad(el, { target, keys: ["1", "2", "C"] });
    el.querySelector<HTMLButtonElement>('[data-key="1"]')?.click();
    el.querySelector<HTMLButtonElement>('[data-key="2"]')?.click();
    expect(target.value).toBe("12");
    keypad.clear();
    expect(target.value).toBe("");
  });

  it("controls select and unit-field values", () => {
    const select = document.createElement("select");
    select.innerHTML = '<option value="a">A</option><option value="b">B</option>';
    const selectHandle = panelSelect(select);
    selectHandle.setValue("b");
    expect(selectHandle.getValue()).toBe("b");
    const field = document.createElement("label");
    field.innerHTML = '<input><span data-unit>bar</span>';
    const unit = panelUnitField(field, { unit: "kPa" });
    unit.setValue("125");
    expect(field.textContent).toContain("kPa");
    expect(unit.getValue()).toBe("125");
  });

  it("configures a control-group layout", () => {
    const el = document.createElement("div");
    const handle = panelControlGroup(el, { columns: 3, gap: 12, variant: "recessed" });
    expect(el.style.getPropertyValue("--pnl-group-columns")).toBe("3");
    expect(el.dataset.variant).toBe("recessed");
    handle.destroy();
    expect(el.classList.contains("pnl-control-group")).toBe(false);
  });

  it("registers and mounts the Web Component wrappers", () => {
    const names = definePanelElements("testpanel");
    const element = document.createElement(names.pushButton);
    element.textContent = "START";
    document.body.append(element);
    expect(element.querySelector("button")?.classList.contains("pnl-push-button")).toBe(true);
  });
});
