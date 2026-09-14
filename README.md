# Panel UI

Industrial control-panel components for the web. Panel UI decorates real HTML controls instead of replacing them, so keyboard input, forms, events, and screen readers continue to work as expected.

Available components:

- panel push buttons with async states;
- native checkbox-based toggle switches;
- toggle push buttons for checkboxes, radio buttons, and option groups;
- pilot lamps with steady, fault, and blinking states;
- device, signal, and alarm tag labels;
- calculator-style input fields using regular monospace text;
- rotary selectors, emergency stops, and guarded buttons;
- circular gauges and bar graphs;
- alarm annunciators and acknowledgement buttons;
- numeric steppers, keypads, selects, and unit fields;
- panel, bezel, fieldset, and control-group layout primitives;
- React, Vue, Svelte, and Web Component integration layers.

The core library has no runtime dependencies. All visuals are provided by a single stylesheet.

## Installation

```bash
npm install panel-ui
```

Import the functions you need and the shared stylesheet:

```ts
import {
  panelInput,
  panelAnnunciator,
  panelEmergencyStop,
  panelSelector,
  panelOptionButton,
  panelPilotLamp,
  panelPushButton,
  panelTag,
  panelToggle,
  panelToggleButton,
} from "panel-ui";
import "panel-ui/style.css";
```

## Quick start

```html
<button id="start">Start</button>
<i id="running"></i>

<label id="auto-mode">
  <input type="checkbox" />
  <span>Auto mode</span>
</label>

<span id="pump-tag">P-101</span>
```

```ts
const start = panelPushButton(document.querySelector("#start"), {
  tone: "green",
  label: "Start feed water pump",
});

const running = panelPilotLamp(document.querySelector("#running"), {
  tone: "green",
  status: "off",
  label: "Feed water pump",
});

panelToggle(document.querySelector("#auto-mode"), {
  tone: "blue",
  onLabel: "AUTO",
  offLabel: "MAN",
});

panelTag(document.querySelector("#pump-tag"), {
  kind: "device",
  description: "Main feed pump",
});
```

## Push button

Use `panelPushButton()` with a native `<button>`. Standard attributes such as `type`, `name`, `value`, and `disabled` continue to work.

```html
<button id="save" type="button">Save</button>
```

```ts
const saveButton = panelPushButton(document.querySelector("#save"), {
  tone: "green",
  size: "medium",
  state: "idle",
  disabled: false,
  momentary: true,
});
```

### Button states

| State | Purpose |
| --- | --- |
| `idle` | Normal state, ready for interaction |
| `active` | The controlled function is active |
| `loading` | An asynchronous operation is running |
| `success` | The operation completed successfully |
| `fault` | The operation failed or entered a fault condition |

States can be controlled manually:

```ts
saveButton.setState("loading");
saveButton.setDisabled(true);

saveButton.getState(); // "loading"

saveButton.setState("success");
saveButton.setDisabled(false);
```

### Running asynchronous operations

`runAsync()` manages the complete async state cycle:

1. changes the state to `loading`;
2. disables the button to prevent duplicate submissions;
3. runs the supplied Promise;
4. changes the state to `success` or `fault`;
5. restores the previous disabled state;
6. returns to `idle` after the configured delay.

```ts
document.querySelector("#save")?.addEventListener("click", async () => {
  try {
    const result = await saveButton.runAsync(
      () => fetch("/api/settings", {
        method: "POST",
        body: JSON.stringify({ mode: "auto" }),
        headers: { "Content-Type": "application/json" },
      }).then((response) => {
        if (!response.ok) throw new Error("Could not save settings");
        return response.json();
      }),
      { resetDelay: 1500 },
    );

    console.log(result);
  } catch (error) {
    console.error(error);
  }
});
```

The original error is rethrown, so it can still be handled with `try/catch`.

| `runAsync()` option | Default | Description |
| --- | --- | --- |
| `resetDelay` | `1200` on success, `1800` on fault | Feedback duration before returning to `idle`, in milliseconds |
| `allowInteraction` | `false` | Keeps the button enabled while loading when set to `true` |

A handle accepts only one async operation at a time. Starting another operation before the first one settles rejects with an error to prevent race conditions.

## Toggle switch

A toggle switch expects a wrapper containing a native `<input type="checkbox">`.

```html
<label id="remote-control">
  <input type="checkbox" name="remote" />
  <span>Remote control</span>
</label>
```

```ts
const remote = panelToggle(document.querySelector("#remote-control"), {
  tone: "blue",
  size: "medium",
  onLabel: "REM",
  offLabel: "LOC",
  disabled: false,
});

remote.setChecked(true);
remote.setDisabled(false);
```

Listen to the native input when application code needs the new value:

```ts
document
  .querySelector<HTMLInputElement>("#remote-control input")
  ?.addEventListener("change", (event) => {
    const checked = (event.currentTarget as HTMLInputElement).checked;
    console.log({ checked });
  });
```

## Toggle push button and option button

`panelToggleButton()` turns a native checkbox or radio input into a latching push button. Use a checkbox for an independent control and radio inputs for a mutually exclusive selection group.

### Checkbox toggle button

```html
<label id="heater-enable">
  <input type="checkbox" name="heater" />
  <span>Heater</span>
</label>
```

```ts
const heater = panelToggleButton(document.querySelector("#heater-enable"), {
  tone: "amber",
  size: "medium",
  shape: "square",
});

heater.setChecked(true);
heater.isChecked(); // true
heater.setDisabled(false);
```

### Radio or option group

Use the same `name` attribute on every radio input in the group. The browser continues to manage mutual exclusion, keyboard navigation, validation, and form submission.

```html
<fieldset>
  <legend>Operating mode</legend>

  <label class="mode-option">
    <input type="radio" name="mode" value="auto" checked />
    <span>Auto</span>
  </label>

  <label class="mode-option">
    <input type="radio" name="mode" value="manual" />
    <span>Manual</span>
  </label>

  <label class="mode-option">
    <input type="radio" name="mode" value="service" />
    <span>Service</span>
  </label>
</fieldset>
```

```ts
document.querySelectorAll<HTMLElement>(".mode-option").forEach((element) => {
  panelOptionButton(element, {
    tone: "blue",
    size: "small",
  });
});
```

`panelOptionButton` is a semantic alias of `panelToggleButton`. Both return the same handle and provide the same behavior.

| Option | Values | Default |
| --- | --- | --- |
| `shape` | `"square" \| "round"` | `"square"` |
| `tone` | any Panel UI tone | `"green"` |

Do not remove the input or hide it with `display: none`. The Panel UI stylesheet visually hides it while retaining keyboard focus and accessible form behavior.

## Pilot lamp

A pilot lamp can be attached to an empty inline element such as `<i>` or `<span>`.

```ts
const tripLamp = panelPilotLamp(document.querySelector("#trip-lamp"), {
  tone: "red",
  status: "off",
  size: "medium",
  label: "Motor trip",
});

tripLamp.setStatus("on");
tripLamp.setStatus("blink");
tripLamp.setStatus("fault");
tripLamp.setStatus("off");
```

| Status | Appearance |
| --- | --- |
| `off` | Dark lens |
| `on` | Continuously illuminated lens |
| `blink` | Only the lens blinks; the metal frame remains stationary |
| `fault` | Red lens blinking at a faster rate |

The element automatically receives `role="status"`, `aria-live="polite"`, and an accessible label derived from its `label` and current status.

## Tag label

```html
<span id="level-switch">LSH-204</span>
```

```ts
panelTag(document.querySelector("#level-switch"), {
  kind: "signal",
  description: "High level switch",
  size: "medium",
});
```

| Kind | Intended use |
| --- | --- |
| `device` | Motors, pumps, valves, fans, and other equipment |
| `signal` | Sensors, switches, transmitters, and I/O points |
| `alarm` | Alarms and abnormal conditions |

## Input field

`panelInput()` gives a native input the recessed appearance of a calculator or numeric controller display. It uses regular monospace text, not a seven-segment font.

```html
<label for="speed-setpoint">Speed setpoint</label>
<input
  id="speed-setpoint"
  type="number"
  name="speed"
  value="1450"
  min="0"
  max="3000"
  step="10"
/>
```

```ts
const inputElement = document.querySelector<HTMLInputElement>("#speed-setpoint");

const speed = panelInput(inputElement, {
  tone: "green",
  size: "medium",
  width: 220,
  align: "right",
  invalid: false,
});

speed.setValue(1500);
speed.getValue(); // "1500"
speed.setDisabled(false);
speed.setInvalid(false);
speed.focus();
```

Text inputs are supported as well:

```html
<input id="batch-code" type="text" placeholder="BATCH-001" />
```

```ts
panelInput(document.querySelector("#batch-code"), {
  tone: "blue",
  align: "left",
  width: "280px",
});
```

| Input option | Values | Default |
| --- | --- | --- |
| `align` | `"left" \| "center" \| "right"` | `"right"` for number inputs, `"left"` otherwise |
| `width` | a number or pixel string | `220px`, scaled by `size` |
| `invalid` | `boolean` | `false` |

Connect native constraint validation to the visual state through the `input` event:

```ts
inputElement?.addEventListener("input", () => {
  speed.setInvalid(!inputElement.checkValidity());
});
```

The invalid state changes the outline and caret to red and applies `aria-invalid="true"`. Native number spinners are visually hidden, while `min`, `max`, `step`, keyboard entry, and browser validation remain active.

## Rotary selector

`panelSelector()` turns a native select into a maintained rotary switch. The hidden select remains the source of truth for forms and accessibility.

```html
<label id="mode-selector">
  <select name="mode" aria-label="Operating mode">
    <option value="off">OFF</option>
    <option value="auto" selected>AUTO</option>
    <option value="hand">HAND</option>
  </select>
  <span data-position-label></span>
</label>
```

```ts
const mode = panelSelector(document.querySelector("#mode-selector"), {
  tone: "white",
  size: "medium",
  startAngle: -55,
  endAngle: 55,
});

mode.setValue("hand");
mode.setIndex(1);
mode.setDisabled(false);
```

The optional `[data-position-label]` node is kept synchronized with the selected option text.

## Safety controls

### Emergency stop

```ts
const emergency = panelEmergencyStop(document.querySelector("#emergency"), {
  size: "large",
  engaged: false,
  latching: true,
  label: "Emergency stop",
});

emergency.engage();
emergency.release();
emergency.setEngaged(true);
emergency.isEngaged();
```

Use a native button. A latching emergency stop toggles on click and exposes its state through `aria-pressed`. This visual control does not replace certified safety hardware or a safety PLC.

### Guarded push button

```html
<div id="guarded-trip"><button type="button">TRIP</button></div>
```

```ts
const trip = panelGuardedButton(document.querySelector("#guarded-trip"), {
  tone: "red",
  open: false,
  disabled: false,
});

trip.openGuard();
trip.closeGuard();
trip.isGuardOpen();
```

The first pointer activation opens the cover; a subsequent activation reaches the button. Escape closes the cover. The returned handle also includes every push-button method, including `runAsync()`.

## Gauge and bar graph

All meters clamp values to `min` and `max`, expose `role="meter"` with the matching ARIA range, and return a handle with `setValue()`, `getValue()`, and `destroy()`.

```html
<div id="level"></div>
<div id="load"></div>
```

```ts
const level = panelGauge(document.querySelector("#level"), {
  min: 0, max: 100, value: 72, unit: "%", tone: "blue",
});

const load = panelBarGraph(document.querySelector("#load"), {
  min: 0, max: 100, value: 68, unit: "%",
  orientation: "horizontal",
  segments: 12,
  textPosition: "bottom",
});

level.setValue(75);
load.setValue(70);
```

| Component | Distinct options |
| --- | --- |
| `panelGauge` | circular fill gauge |
| `panelBarGraph` | `orientation`, `segments`, `textPosition` |

Shared meter options are `min`, `max`, `value`, `unit`, `decimals`, `tone`, `size`, and `label`.

Bar-graph text can be positioned independently of its orientation:

| `textPosition` | Result |
| --- | --- |
| `"inside"` | Centered over the bar; default |
| `"top"` | Above the bar |
| `"right"` | To the right of the bar |
| `"bottom"` | Below the bar |
| `"left"` | To the left of the bar |
| `"hidden"` | Value text is not rendered visually; meter ARIA values remain available |

## Alarm annunciator

```ts
const motorTrip = panelAnnunciator(document.querySelector("#motor-trip"), {
  state: "active",
  tone: "red",
  label: "Motor trip",
});

panelAcknowledgeButton(document.querySelector("#acknowledge"), {
  size: "small",
});

document.querySelector("#acknowledge")?.addEventListener("click", () => {
  motorTrip.acknowledge();
});

motorTrip.setState("shelved");
motorTrip.clear();
```

Alarm states are `normal`, `active`, `acknowledged`, and `shelved`. Active alarms flash; acknowledged alarms remain steady. The acknowledgement control is a specialized amber push button, so application code decides which alarms it acknowledges.

## Data-entry controls

### Numeric stepper

```html
<div id="setpoint-stepper">
  <button type="button" data-step="down" aria-label="Decrease">-</button>
  <input type="number" value="50" min="0" max="100" step="5" />
  <button type="button" data-step="up" aria-label="Increase">+</button>
</div>
```

```ts
const stepper = panelNumericStepper(document.querySelector("#setpoint-stepper"), {
  step: 5,
  tone: "green",
});
stepper.stepUp();
stepper.stepDown();
stepper.setValue(75);
```

It dispatches a bubbling native `input` event after each step.

### Keypad

```ts
const keypad = panelKeypad(document.querySelector("#keypad"), {
  target: document.querySelector<HTMLInputElement>("#keypad-value")!,
  allowDecimal: true,
  tone: "blue",
  // keys: ["1", "2", "3", "C"] // optional custom layout
});

keypad.clear();
keypad.setDisabled(true);
```

The default keypad provides digits, clear, and either decimal or backspace. A custom `"↵"` key dispatches `change`. Every edit dispatches a bubbling `input` event.

### Select and unit suffix

```ts
const range = panelSelect(document.querySelector("#range"), {
  tone: "amber",
  width: 180,
});
range.setValue("0-25");

const pressure = panelUnitField(document.querySelector("#pressure-field"), {
  unit: "bar",
  tone: "green",
  width: 160,
});
pressure.setUnit("kPa");
```

`panelSelect()` accepts a native `<select>`. `panelUnitField()` expects a wrapper containing an `<input>` and optionally a `[data-unit]` element; it creates the suffix node when absent.

## Layout primitives

The layout helpers add consistent control-panel surfaces without taking ownership of child controls.

```html
<section id="panel">
  <div id="bezel">
    <fieldset id="pump-fieldset">
      <legend>FEED PUMP</legend>
      <div id="pump-controls">...</div>
    </fieldset>
  </div>
</section>
```

```ts
panelSurface(document.querySelector("#panel"), { variant: "raised" });
panelBezel(document.querySelector("#bezel"), { variant: "recessed" });
panelFieldset(document.querySelector("#pump-fieldset"), { variant: "flat" });
panelControlGroup(document.querySelector("#pump-controls"), {
  columns: 3,
  gap: 20,
});
```

Every layout accepts `variant: "flat" | "raised" | "recessed"` and an optional accessible `label`. A control group additionally accepts `columns` and a pixel `gap`.

## Framework integrations

Framework adapters are separate entry points. React and Vue are optional peer dependencies; importing the core does not install or load either framework.

### React

```tsx
import { PanelPilotLamp, PanelPushButton, usePanelControl } from "panel-ui/react";
import "panel-ui/style.css";

<PanelPushButton options={{ tone: "green", size: "big" }}>START</PanelPushButton>
<PanelPilotLamp options={{ tone: "green", status: "on", label: "Running" }} />
```

The package also exports `PanelInput`, `PanelToggle`, and `PanelOptionButton`. Each component accepts an `options` prop plus the corresponding native HTML attributes. Its ref exposes `{ element, handle }`. Use `usePanelControl(attach, options)` for any core function not represented by a component.

### Vue

```vue
<script setup lang="ts">
import { PanelPilotLamp, PanelPushButton } from "panel-ui/vue";
import "panel-ui/style.css";
</script>

<template>
  <PanelPushButton :options="{ tone: 'green' }">START</PanelPushButton>
  <PanelPilotLamp :options="{ status: 'on', label: 'Running' }" />
</template>
```

Vue exports `PanelPushButton`, `PanelPilotLamp`, `PanelInput`, `PanelOptionButton`, and the generic `usePanelControl()` composable. Component refs expose the underlying element and handle.

### Svelte

```svelte
<script lang="ts">
  import { pushButton, pilotLamp, selector } from "panel-ui/svelte";
  import "panel-ui/style.css";
</script>

<button use:pushButton={{ tone: "green" }}>START</button>
<i use:pilotLamp={{ tone: "green", status: "on", label: "Running" }}></i>
```

Svelte actions are exported for every core control using camel-case names such as `emergencyStop`, `gauge`, `barGraph`, `numericStepper`, `unitField`, and `controlGroup`. Updating action options safely destroys and reapplies the control.

### Web Components

```ts
import { definePanelElements } from "panel-ui/web-components";
import "panel-ui/style.css";

definePanelElements();
```

```html
<panel-push-button tone="green" size="big">START</panel-push-button>
<panel-pilot-lamp tone="red" status="blink" label="Motor trip"></panel-pilot-lamp>
<panel-option-button name="mode" value="auto" checked>AUTO</panel-option-button>
<panel-input value="1450" width="180"></panel-input>
<panel-annunciator state="active">MOTOR TRIP</panel-annunciator>
```

`definePanelElements(prefix?)` is idempotent and returns the registered tag names. Pass a lowercase prefix such as `"plant"` to register `plant-push-button` and the related elements. Registration must run in a browser environment.

## Shared options

The controls accept some or all of the following shared options:

| Option | Values | Default |
| --- | --- | --- |
| `size` | a named size, number, or pixel string | `"medium"` |
| `tone` | `"green" \| "red" \| "amber" \| "blue" \| "white"` | `"green"` |
| `disabled` | `boolean` | current element state |
| `label` | `string` | current accessible name |

### Component sizes

Five named sizes are available:

| Size | Scale | Typical use |
| --- | ---: | --- |
| `xsmall` | 64% | Very compact indicators or toolbars |
| `small` | 78% | High-density panels |
| `medium` | 100% | Default control size |
| `big` | 125% | Primary controls |
| `large` | 155% | Emergency controls or operator stations |

```ts
panelPushButton(button, { size: "xsmall" });
panelPushButton(button, { size: "small" });
panelPushButton(button, { size: "medium" });
panelPushButton(button, { size: "big" });
panelPushButton(button, { size: "large" });
```

For precise sizing, pass a number or a string ending in `px`. Numbers are always interpreted as pixels:

```ts
panelPushButton(button, { size: 96 });        // 96px main diameter
panelPushButton(button, { size: "96px" });   // equivalent
panelPilotLamp(lamp, { size: "28px" });      // 28px main diameter
panelToggle(toggle, { size: "80px" });       // 80px switch body width
panelTag(tag, { size: "100px" });             // 100px minimum tag width
panelToggleButton(option, { size: "64px" }); // 64px option-button height
panelInput(input, { size: "52px" });          // 52px input height
```

Pixel sizes refer to the primary dimension of each component: diameter for push buttons and pilot lamps, switch-body width for toggles, height for toggle push buttons and inputs, and minimum width for tags. Text, borders, spacing, and shadows scale proportionally. Keep button labels short enough to fit the selected size.

The legacy aliases `sm`, `md`, and `lg` remain available for compatibility with early versions. New code should use the full size names.

## Handles and cleanup

Every component function returns a handle. Call `destroy()` when removing a component from the page or when a framework unmounts it.

```ts
const lamp = panelPilotLamp(document.querySelector("#lamp"), {
  status: "on",
});

lamp.destroy();
```

| Handle | Methods |
| --- | --- |
| Push button | `setState`, `getState`, `setDisabled`, `runAsync`, `press`, `release`, `destroy` |
| Toggle switch | `setChecked`, `setDisabled`, `destroy` |
| Toggle push/option button | `setChecked`, `isChecked`, `setDisabled`, `destroy` |
| Pilot lamp | `setStatus`, `destroy` |
| Tag | `destroy` |
| Input | `setValue`, `getValue`, `setDisabled`, `setInvalid`, `focus`, `destroy` |
| Selector | `setIndex`, `getIndex`, `setValue`, `getValue`, `setDisabled`, `destroy` |
| Emergency stop | `setEngaged`, `isEngaged`, `engage`, `release`, `destroy` |
| Guarded button | push-button methods plus `openGuard`, `closeGuard`, `isGuardOpen` |
| Any meter | `setValue`, `getValue`, `destroy` |
| Annunciator | `setState`, `getState`, `acknowledge`, `clear`, `destroy` |
| Numeric stepper | `stepUp`, `stepDown`, `setValue`, `getValue`, `setDisabled`, `destroy` |
| Keypad | `setDisabled`, `clear`, `destroy` |
| Select | `setValue`, `getValue`, `setDisabled`, `destroy` |
| Unit field | input methods plus `setUnit` |

## Theme and CSS variables

Override the theme once on `:root` or on a specific panel container:

```css
.my-control-panel {
  --pnl-panel: #272c2e;
  --pnl-panel-hi: #454c4f;
  --pnl-panel-lo: #141718;
  --pnl-metal: #92999b;
  --pnl-ink: #eef2ec;
  --pnl-muted: #9ba5a2;
  --pnl-green: #68ff80;
  --pnl-red: #ff4f48;
  --pnl-amber: #ffc239;
  --pnl-blue: #4eb7ff;
  --pnl-white: #f4f5e9;
  --pnl-font: "IBM Plex Mono", monospace;
}
```

Panel UI does not load an external font. If IBM Plex Mono is unavailable, it falls back to the system monospace stack.

## Accessibility

- Push buttons remain native `<button>` elements.
- Toggle switches remain native checkboxes.
- Toggle push buttons retain their checkbox or radio input.
- Radio inputs with the same name keep mutual exclusion and arrow-key navigation.
- Inputs retain their labels, constraint validation, and native form values.
- Focus rings follow each component's semantic tone.
- Buttons receive `aria-busy="true"` while loading.
- Pilot lamps announce status changes through a polite live region.
- Selectors and selects retain native selection, form, and keyboard semantics.
- Meters expose their minimum, maximum, and current values through ARIA.
- Annunciators use an assertive status region for alarm-state changes.
- Emergency-stop state is represented by `aria-pressed`.
- Animations stop when the user enables `prefers-reduced-motion`.
- Do not communicate state through color alone. Pair lamps with labels such as `RUN`, `TRIP`, and `FAULT`.

## TypeScript

All options and handles are exported as types:

```ts
import type {
  AsyncButtonOptions,
  ButtonState,
  InputAlignment,
  InputFieldOptions,
  InputHandle,
  AlarmState,
  AnnunciatorHandle,
  MeterHandle,
  SelectorHandle,
  LampStatus,
  PanelNamedSize,
  PanelPixelSize,
  PanelSize,
  PanelTone,
  PilotLampHandle,
  PushButtonHandle,
  ToggleButtonHandle,
  ToggleHandle,
} from "panel-ui";
```

## Current coverage and roadmap

The component set covers binary and multi-position controls, status and alarm indication, process meters, data entry, and nested panel layouts. Form resets and direct native property assignments are synchronized where native controls are used. The test suite covers core behavior, browser interaction, serious/critical axe violations, and full-page visual regression. CI and tagged npm release workflows are included.

Potential future additions include buzzer and horn indicators, trend charts, valve and motor symbols, and cross-browser visual baselines beyond Chromium.

## Development

```bash
npm install
npx playwright install chromium
npm run dev       # open the interactive component catalog
npm run check     # type-check and run unit tests
npm run build     # build the package into dist
npm run test:browser         # interaction, accessibility, and visual tests
npm run test:browser:update  # intentionally update visual baselines
npm pack --dry-run
```

```text
src/             TypeScript source
demo/            interactive component catalog
style.css        industrial component theme
dist/            ESM build and declaration files
```

## Release process

The CI workflow runs type checking, unit tests, the production build, browser interactions, axe accessibility checks, and visual regression tests on every pull request and push to `main`.

Before a release, confirm that the package name is available and that the repository `NPM_TOKEN` secret has publish access.

To release a version, update `CHANGELOG.md`, create a matching npm version tag, and push it:

```bash
npm version patch   # or minor / major
git push --follow-tags
```

The `Release` workflow verifies that the `vX.Y.Z` tag matches `package.json`, runs the complete test suite, publishes the package with npm provenance, and creates a GitHub release with generated notes.

## Browser support

The primary target is modern browsers with support for CSS custom properties, `color-mix()`, and the `:has()` selector. JavaScript is compiled to ES2020.

## License

MIT.
