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
    assert.equal(await page.locator("header img").count(), 1);
    await page.locator(".cta").click();
    assert.equal(new URL(page.url()).hash, "#intro");
    await page.evaluate(() =>
      Promise.all(
        [...document.images].map((img) => {
          img.loading = "eager";
          return img.decode();
        }),
      ),
    );
    console.log(
      "Passed layout, navigation, disclosures, images and hero navigation at " +
        width +
        "px",
    );
  }
  assert.equal(
    await page
      .locator(".dunes")
      .evaluate((el) => getComputedStyle(el).animationName),
    "none",
  );

  // Leave the hero image pending: the loader must not trap navigation or wait forever.
  await page.emulateMedia({ reducedMotion: "no-preference" });
  let releaseImage;
  const imageGate = new Promise((resolve) => {
    releaseImage = resolve;
  });
  await page.route("**/img/quiet-dunes.jpg", async (route) => {
    await imageGate;
    await route.continue();
  });
  await page.goto(process.env.SITE_URL || "http://localhost:8000/", {
    waitUntil: "domcontentloaded",
  });
  await page.locator("#page-loader").waitFor({ state: "visible" });
  assert.equal(
    await page
      .locator(".dunes")
      .evaluate((el) => getComputedStyle(el).animationName),
    "dunes-settle",
  );
  await page.locator("#menu").click();
  assert.equal(
    await page.locator("#menu").getAttribute("aria-expanded"),
    "true",
  );
  await page.keyboard.press("Escape");
  await page
    .locator("#page-loader")
    .waitFor({ state: "detached", timeout: 5000 });
  releaseImage();
  await page.locator("#history .item-card").first().scrollIntoViewIfNeeded();
  await page.waitForSelector("#history .item-card.reveal");
  console.log(
    "Passed motion preferences, scroll reveals and loader slow-image fallback",
  );
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
}
