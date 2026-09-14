import {
  panelAcknowledgeButton, panelAnalogMeter, panelAnnunciator, panelBarGraph,
  panelBezel, panelControlGroup, panelDigitalMeter, panelEmergencyStop,
  panelFieldset, panelGauge, panelGuardedButton, panelInput, panelKeypad,
  panelNumericStepper, panelPilotLamp, panelPushButton, panelSelect,
  panelSelector, panelSurface, panelTag, panelToggle, panelToggleButton,
  panelUnitField,
} from "./index";

type Handle = { destroy(): void };
export type PanelAction<O> = (node: never, options?: O) => { update(options: O): void; destroy(): void };

function action<E, O>(attach: (element: E, options: O) => Handle) {
  return (node: E, options = {} as O) => {
    let handle = attach(node, options);
    return {
      update(next: O) { handle.destroy(); handle = attach(node, next); },
      destroy() { handle.destroy(); },
    };
  };
}

export const pushButton = action(panelPushButton);
export const toggle = action(panelToggle);
export const toggleButton = action(panelToggleButton);
export const pilotLamp = action(panelPilotLamp);
export const input = action(panelInput);
export const tag = action(panelTag);
export const selector = action(panelSelector);
export const emergencyStop = action(panelEmergencyStop);
export const guardedButton = action(panelGuardedButton);
export const analogMeter = action(panelAnalogMeter);
export const digitalMeter = action(panelDigitalMeter);
export const gauge = action(panelGauge);
export const barGraph = action(panelBarGraph);
export const annunciator = action(panelAnnunciator);
export const acknowledgeButton = action(panelAcknowledgeButton);
export const numericStepper = action(panelNumericStepper);
export const keypad = action(panelKeypad);
export const select = action(panelSelect);
export const unitField = action(panelUnitField);
export const surface = action(panelSurface);
export const bezel = action(panelBezel);
export const fieldset = action(panelFieldset);
export const controlGroup = action(panelControlGroup);
