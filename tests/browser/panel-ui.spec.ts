import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/demo/index.html");
  await page.evaluate(() => document.fonts.ready);
});

test("component catalog has no serious accessibility violations", async ({ page }) => {
  const results = await new AxeBuilder({ page }).analyze();
  const violations = results.violations.filter((violation) =>
    violation.impact === "critical" || violation.impact === "serious",
  );
  expect(violations).toEqual([]);
});

test("component catalog matches its visual baseline", async ({ page }) => {
  await expect(page).toHaveScreenshot("component-catalog.png", {
    fullPage: true,
  });
});

test("native radio option buttons remain mutually exclusive", async ({ page }) => {
  const auto = page.locator('.mode-option input[value="auto"]');
  const manual = page.locator('.mode-option input[value="manual"]');
  await expect(auto).toBeChecked();
  await page.locator(".mode-option").nth(1).click();
  await expect(manual).toBeChecked();
  await expect(auto).not.toBeChecked();
  await expect(page.locator(".mode-option").nth(1)).toHaveAttribute("data-checked", "true");
});

test("form reset and direct property assignments synchronize visual state", async ({ page }) => {
  await page.evaluate(async () => {
    const { panelInput, panelToggle, panelToggleButton } = await import("/src/index.ts");
    const host = document.createElement("div");
    host.innerHTML = `
      <form id="test-form">
        <label id="switch"><input type="checkbox"><span>Enable</span></label>
        <label id="option"><input type="checkbox"><span>Latch</span></label>
        <input id="field" type="text" value="default">
      </form>`;
    document.body.append(host);
    panelToggle(document.querySelector("#switch"));
    panelToggleButton(document.querySelector("#option"));
    panelInput(document.querySelector("#field"));
  });

  const toggleInput = page.locator("#switch input");
  const optionInput = page.locator("#option input");
  const field = page.locator("#field");

  await toggleInput.evaluate((input: HTMLInputElement) => { input.checked = true; });
  await optionInput.evaluate((input: HTMLInputElement) => { input.checked = true; });
  await field.evaluate((input: HTMLInputElement) => { input.value = "external"; input.disabled = true; });
  await expect(page.locator("#switch")).toHaveAttribute("data-checked", "true");
  await expect(page.locator("#option")).toHaveAttribute("data-checked", "true");
  await expect(field).toHaveAttribute("data-disabled", "true");
  await expect(field).toHaveAttribute("data-empty", "false");

  await page.locator("#test-form").evaluate((form: HTMLFormElement) => form.reset());
  await expect(page.locator("#switch")).toHaveAttribute("data-checked", "false");
  await expect(page.locator("#option")).toHaveAttribute("data-checked", "false");
  await expect(field).toHaveValue("default");
});
