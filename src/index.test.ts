import { beforeEach, describe, expect, it } from "vitest";
import { panelInput, panelPilotLamp, panelPushButton, panelTag, panelToggle, panelToggleButton } from "./index";

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
});
