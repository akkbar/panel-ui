import { panelInput, panelPilotLamp, panelPushButton, panelTag, panelToggle, panelToggleButton } from "../src";

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
