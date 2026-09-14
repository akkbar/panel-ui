# Panel UI

Industrial control-panel components for the web. Panel UI decorates real HTML controls instead of replacing them, so keyboard input, forms, events, and screen readers continue to work as expected.

Available components:

- panel push buttons with async states;
- native checkbox-based toggle switches;
- toggle push buttons for checkboxes, radio buttons, and option groups;
- pilot lamps with steady, fault, and blinking states;
- device, signal, and alarm tag labels;
- calculator-style input fields using regular monospace text.

The core library has no runtime dependencies. All visuals are provided by a single stylesheet.

## Installation

```bash
npm install panel-ui
```

Import the functions you need and the shared stylesheet:

```ts
import {
  panelInput,
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

The existing component set covers the basic binary controls, status indication, identification, and data-entry needs of a small control panel. Form resets and direct native property assignments are synchronized automatically. The test suite covers unit behavior, browser interaction, serious/critical axe violations, and full-page visual regression. CI and tagged npm release workflows are included.

The following areas are not implemented yet:

- rotary selector switches and maintained multi-position switches;
- emergency-stop and guarded push-button variants;
- analog meters, digital readouts, gauges, and bar graphs;
- alarm annunciators, acknowledgement controls, and buzzer indicators;
- keypad, numeric stepper, select, and input-unit add-ons;
- panel, bezel, fieldset, and control-group layout primitives;
- React, Vue, Svelte, and Web Component wrappers;
- cross-browser coverage beyond the current Chromium regression suite;
- final repository URL and author identity in the npm metadata.

Before a public release, add the repository URL and author identity, then configure the `NPM_TOKEN` GitHub Actions secret. Rotary selectors, emergency-stop controls, and meter components are the most useful next additions for broader industrial-panel coverage.

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

Before the first release:

1. initialize the project as a Git repository and push it to its final remote;
2. add `author`, `repository`, `homepage`, and `bugs` fields to `package.json` using the real project identity;
3. add an `NPM_TOKEN` repository secret with publish access;
4. confirm the desired package name is still available immediately before publishing.

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
