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
links.addEventListener("click", (event) => {
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
  nav.classList.toggle("scrolled", scrollY > 16);
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
const pictures = [...document.querySelectorAll(".photos img")];
const frames = [...document.querySelectorAll(".frame")];
const counter = document.querySelector("#count span");
const number = new Intl.NumberFormat("fa-IR", { minimumIntegerDigits: 2 });
let slide = 0;
function selectSlide(index) {
  slide = (index + pictures.length) % pictures.length;
  pictures.forEach((image, i) => {
    image.classList.toggle("show", i === slide);
    image.setAttribute("aria-hidden", String(i !== slide));
    frames[i].setAttribute("aria-pressed", String(i === slide));
  });
  counter.textContent = number.format(slide + 1);
}
frames.forEach((frame, i) =>
  frame.addEventListener("click", () => selectSlide(i)),
);
document
  .querySelector(".next")
  .addEventListener("click", () => selectSlide(slide + 1));
document
  .querySelector(".prev")
  .addEventListener("click", () => selectSlide(slide - 1));
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
