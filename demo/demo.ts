import {
  panelAcknowledgeButton, panelAnnunciator, panelBarGraph,
  panelBezel, panelControlGroup, panelEmergencyStop,
  panelFieldset, panelGauge, panelGuardedButton, panelInput, panelKeypad,
  panelNumericStepper, panelPilotLamp, panelPushButton, panelSelect, panelSelector,
  panelSurface, panelTag, panelToggle, panelToggleButton, panelUnitField,
} from "../src";

panelPilotLamp(document.querySelector("#system-lamp"), { tone: "green", status: "on", size: "small", label: "System" });
const runLamp = panelPilotLamp(document.querySelector("#run-lamp"), { tone: "green", status: "on", label: "Pump running" });
const tripLamp = panelPilotLamp(document.querySelector("#trip-lamp"), { tone: "red", status: "off", label: "Pump trip" });
panelTag(document.querySelector("#tag-p101"), { description: "Main feed pump", kind: "device" });
panelToggle(document.querySelector("#auto-toggle"), { onLabel: "AUTO", offLabel: "MAN", tone: "blue" });

const start = panelPushButton(document.querySelector("#start-button"), { tone: "green" });
const stop = panelPushButton(document.querySelector("#stop-button"), { tone: "red" });
const reset = panelPushButton(document.querySelector("#reset-button"), { tone: "blue", size: "small" });
document.querySelector("#start-button")?.addEventListener("click", () => { runLamp.setStatus("on"); tripLamp.setStatus("off"); start.setState("success"); });
document.querySelector("#stop-button")?.addEventListener("click", () => { runLamp.setStatus("off"); stop.setState("active"); });
document.querySelector("#reset-button")?.addEventListener("click", () => {
  void reset.runAsync(() => new Promise<void>((resolve) => window.setTimeout(resolve, 900)));
});

const asyncDemo = panelPushButton(document.querySelector(".mini-button"), { tone: "amber", size: "small" });
document.querySelector(".mini-button")?.addEventListener("click", () => {
  void asyncDemo.runAsync(() => new Promise<void>((resolve) => window.setTimeout(resolve, 1200)));
});
panelToggle(document.querySelector("#catalog-toggle"), { tone: "green", size: "small" });
document.querySelectorAll<HTMLElement>(".catalog-lamp").forEach((lamp, i) => panelPilotLamp(lamp, {
  tone: (["green", "amber", "red"] as const)[i], status: i === 2 ? "blink" : "on", size: "small",
}));
panelTag(document.querySelector("#tag-lsh"), { description: "High level switch", kind: "signal" });
document.querySelectorAll<HTMLElement>(".mode-option").forEach((option) => panelToggleButton(option, {
  tone: "blue",
  size: "small",
}));
const setpointElement = document.querySelector<HTMLInputElement>("#setpoint-input");
const setpoint = panelInput(setpointElement, { tone: "green", size: "small", width: 150 });
setpointElement?.addEventListener("input", () => setpoint.setInvalid(!setpointElement.checkValidity()));

panelSelector(document.querySelector("#selector-demo"), { tone: "white", size: "small" });
panelEmergencyStop(document.querySelector("#estop-demo"), { size: "small", label: "Emergency stop" });
panelGuardedButton(document.querySelector("#guarded-demo"), { size: "small", tone: "red" });
panelGauge(document.querySelector("#gauge-demo"), { min: 0, max: 100, value: 72, unit: "%", tone: "blue", size: "small", label: "Tank level" });
panelBarGraph(document.querySelector("#bar-demo"), { min: 0, max: 100, value: 68, unit: "%", tone: "amber", size: "small", textPosition: "bottom", label: "Motor load" });
const alarm = panelAnnunciator(document.querySelector("#alarm-demo"), { state: "active", tone: "red", size: "small", label: "Motor trip" });
panelAcknowledgeButton(document.querySelector("#ack-demo"), { size: "xsmall" });
document.querySelector("#ack-demo")?.addEventListener("click", () => alarm.acknowledge());
panelNumericStepper(document.querySelector("#stepper-demo"), { tone: "green", size: "small", step: 5 });
const keypadTarget = document.querySelector<HTMLInputElement>("#keypad-target")!;
panelInput(keypadTarget, { tone: "blue", size: "xsmall", width: 150, align: "right" });
panelKeypad(document.querySelector("#keypad-demo"), { target: keypadTarget, tone: "blue", size: "xsmall", allowDecimal: true });
panelSelect(document.querySelector("#select-demo"), { tone: "amber", size: "xsmall", width: 170 });
panelUnitField(document.querySelector("#unit-demo"), { unit: "bar", tone: "green", size: "xsmall", width: 130 });
panelSurface(document.querySelector("#surface-demo"), { variant: "raised", label: "Pump control surface" });
panelBezel(document.querySelector("#bezel-demo"), { variant: "recessed" });
panelFieldset(document.querySelector("#fieldset-demo"), { variant: "flat" });
panelControlGroup(document.querySelector("#group-demo"), { columns: 2, gap: 18 });
panelPilotLamp(document.querySelector(".layout-lamp"), { status: "on", tone: "green", size: "xsmall", label: "Running" });
panelPushButton(document.querySelector(".layout-button"), { tone: "green", size: "xsmall" });
