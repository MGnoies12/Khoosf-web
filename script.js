const nav = document.querySelector("nav");
const menu = document.querySelector("#menu");
const links = document.querySelector(".nav-links");
function setMenu(open) {
  links.classList.toggle("open", open);
  menu.setAttribute("aria-expanded", String(open));
}
menu.addEventListener("click", () =>
  setMenu(menu.getAttribute("aria-expanded") !== "true"),
);
nav.addEventListener("click", (event) => {
  if (event.target.closest("a")) setMenu(false);
});
document.addEventListener("click", (e) => {
  if (!nav.contains(e.target)) setMenu(false);
});
nav.addEventListener("focusout", (e) => {
  if (!nav.contains(e.relatedTarget)) setMenu(false);
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && links.classList.contains("open")) {
    setMenu(false);
    menu.focus();
  }
});
matchMedia("(max-width:760px)").addEventListener("change", () =>
  setMenu(false),
);
const destinations = [...links.querySelectorAll("a")].map((link) => ({
  link,
  section: document.querySelector(link.hash),
}));
let queued = false;
function updateLocation() {
  queued = false;

  const atEnd =
    Math.ceil(scrollY + innerHeight) >= document.documentElement.scrollHeight;
  const current = atEnd
    ? destinations.at(-1)
    : destinations
        .filter(
          ({ section }) =>
            section.getBoundingClientRect().top <= nav.offsetHeight + 28,
        )
        .at(-1) || destinations[0];
  for (const link of nav.querySelectorAll(".shortcuts a")) {
    if (link.hash === current.link.hash)
      link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  }
  for (const entry of destinations) {
    if (entry === current) entry.link.setAttribute("aria-current", "location");
    else entry.link.removeAttribute("aria-current");
  }
}
function scheduleUpdate() {
  if (!queued) {
    queued = true;
    requestAnimationFrame(updateLocation);
  }
}
window.addEventListener("scroll", scheduleUpdate, { passive: true });
window.addEventListener("resize", scheduleUpdate);
window.addEventListener("pageshow", scheduleUpdate);
updateLocation();
const triggers = document.querySelectorAll(".card-trigger");
function expand(trigger, open) {
  trigger.setAttribute("aria-expanded", String(open));
  document.getElementById(trigger.getAttribute("aria-controls")).hidden = !open;
  trigger.closest(".item-card").classList.toggle("active", open);
}
triggers.forEach((trigger) =>
  trigger.addEventListener("click", () => {
    const open = trigger.getAttribute("aria-expanded") !== "true";
    triggers.forEach((other) => expand(other, open && trigger === other));
  }),
);
if (
  "IntersectionObserver" in window &&
  !matchMedia("(prefers-reduced-motion: reduce)").matches
) {
  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("reveal");
          observer.unobserve(entry.target);
        }
      }),
    { threshold: 0.1 },
  );
  document
    .querySelectorAll(".section-header,.item-card,.intro-copy,figure")
    .forEach((el) => observer.observe(el));
}
