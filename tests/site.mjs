// Run against a served copy (including a GitHub Pages project subdirectory).
import assert from "node:assert/strict";
import { chromium } from "playwright-core";
const browser = await chromium.launch({
  executablePath: process.env.CHROME_BIN || "/usr/bin/google-chrome",
  headless: true,
  args: ["--no-sandbox"],
});
try {
  const page = await browser.newPage({ reducedMotion: "reduce" });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("response", (r) => {
    if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
  });
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto(process.env.SITE_URL || "http://localhost:8000/");
    await page.evaluate(() => document.fonts.ready);
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth),
      width,
    );
    const menu = page.locator("#menu");
    if (await menu.isVisible()) {
      await menu.click();
      assert.equal(await menu.getAttribute("aria-expanded"), "true");
      await page.keyboard.press("Escape");
      assert.equal(await menu.getAttribute("aria-expanded"), "false");
      await menu.click();
      await page.locator('.nav-links [href="#history"]').click();
      assert.equal(await menu.getAttribute("aria-expanded"), "false");
    } else await page.locator('.nav-links [href="#history"]').click();
    await page.waitForSelector(
      '.nav-links [href="#history"][aria-current="location"]',
      { state: "attached" },
    );
    const buttons = page.locator(".card-trigger");
    assert.equal(await buttons.count(), 18);
    for (const btn of await buttons.all()) {
      await btn.focus();
      await btn.press("Space");
      assert.equal(
        await page.locator(".card-trigger[aria-expanded=true]").count(),
        1,
      );
      const detail = page.locator(
        "#" + (await btn.getAttribute("aria-controls")),
      );
      assert(await detail.isVisible());
      assert(
        await detail.evaluate((el) => {
          const box = el.closest(".item-card").getBoundingClientRect();
          return (
            el.getBoundingClientRect().bottom <= box.bottom + 1 &&
            el.previousElementSibling.getBoundingClientRect().top >= box.top - 1
          );
        }),
        "Clipped card at " + width,
      );
    }
    await page.locator(".to-top").click();
    await page.locator(".prev").click();
    assert.equal(await page.locator("#count span").textContent(), "۰۳");
    await page.locator(".next").click();
    assert.equal(await page.locator("#count span").textContent(), "۰۱");
    await page.locator(".frame").nth(1).click();
    assert.equal(
      await page.locator(".photos img.show").getAttribute("src"),
      "img/baft.jpg",
    );
    assert.equal(await page.locator('.frame[aria-pressed="true"]').count(), 1);
    await page.evaluate(() =>
      Promise.all(
        [...document.images].map((img) => {
          img.loading = "eager";
          return img.decode();
        }),
      ),
    );
    console.log(
      "Passed layout, navigation, disclosures, images and carousel at " +
        width +
        "px",
    );
  }
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
}
