// Enable enhancement-only CSS when JavaScript is available.
document.documentElement.classList.add("js");

const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".primary-nav");
const navLinks = [...document.querySelectorAll(".primary-nav a")];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function closeMenu() {
  if (!menuButton || !navigation) return;
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Open navigation menu");
  navigation.classList.remove("is-open");
}

if (menuButton && navigation) {
  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";

    menuButton.setAttribute("aria-expanded", String(!isOpen));
    menuButton.setAttribute(
      "aria-label",
      isOpen ? "Open navigation menu" : "Close navigation menu"
    );
    navigation.classList.toggle("is-open", !isOpen);
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) {
      closeMenu();
    }
  });
}

// ---------------------------------------------------------------------------
// Project images: missing-image fallback + click-to-enlarge lightbox.
// ---------------------------------------------------------------------------

const lightbox = document.getElementById("image-lightbox");
const lightboxImage = lightbox?.querySelector(".lightbox-image");
const lightboxCaption = lightbox?.querySelector(".lightbox-caption");
const lightboxClose = lightbox?.querySelector(".lightbox-close");
let previouslyFocusedElement = null;

function openLightbox(image) {
  if (!lightbox || !lightboxImage || !lightboxCaption) return;

  const figure = image.closest(".portfolio-figure");
  if (!figure || figure.classList.contains("is-missing") || image.naturalWidth === 0) {
    return;
  }

  const caption = figure.querySelector("figcaption")?.textContent?.trim() || image.alt;

  previouslyFocusedElement = document.activeElement;
  lightboxImage.src = image.currentSrc || image.src;
  lightboxImage.alt = image.alt || caption;
  lightboxCaption.textContent = caption;

  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("lightbox-open");
  lightboxClose?.focus();
}

function closeLightbox() {
  if (!lightbox || !lightbox.classList.contains("is-open")) return;

  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("lightbox-open");

  // Clear the image after the fade finishes so no large image remains active.
  window.setTimeout(() => {
    if (!lightbox.classList.contains("is-open") && lightboxImage) {
      lightboxImage.src = "";
      lightboxImage.alt = "";
    }
  }, 180);

  if (previouslyFocusedElement instanceof HTMLElement) {
    previouslyFocusedElement.focus();
  }
}

document.querySelectorAll(".portfolio-image").forEach((image) => {
  const figure = image.closest(".portfolio-figure");

  const showFallback = () => {
    figure?.classList.add("is-missing");
    image.removeAttribute("tabindex");
    image.removeAttribute("role");
    image.removeAttribute("aria-label");
  };

  image.addEventListener("error", showFallback);

  if (image.complete && image.naturalWidth === 0) {
    showFallback();
    return;
  }

  image.setAttribute("tabindex", "0");
  image.setAttribute("role", "button");
  image.setAttribute("aria-label", `Enlarge image: ${image.alt}`);

  image.addEventListener("click", () => openLightbox(image));
  image.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openLightbox(image);
    }
  });
});

lightboxClose?.addEventListener("click", closeLightbox);

lightbox?.addEventListener("click", (event) => {
  // Any click outside the enlarged image closes the preview.
  if (
    !event.target.closest(".lightbox-image") &&
    !event.target.closest(".lightbox-close")
  ) {
    closeLightbox();
  }
});

// Escape closes whichever temporary UI is currently open.
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeLightbox();
    closeMenu();
  }

  // The lightbox has one intentional focus target. Keep keyboard focus inside it.
  if (
    event.key === "Tab" &&
    lightbox?.classList.contains("is-open") &&
    lightboxClose
  ) {
    event.preventDefault();
    lightboxClose.focus();
  }
});

// ---------------------------------------------------------------------------
// Subtle section reveal, disabled automatically for reduced-motion users.
// ---------------------------------------------------------------------------

const revealItems = document.querySelectorAll(".reveal");

if (!reduceMotion && "IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

// ---------------------------------------------------------------------------
// Highlight the navigation item for the section currently in view.
// ---------------------------------------------------------------------------

const sectionIds = navLinks
  .map((link) => link.getAttribute("href"))
  .filter((href) => href && href.startsWith("#"))
  .map((href) => href.slice(1));

const sections = sectionIds
  .map((id) => document.getElementById(id))
  .filter(Boolean);

if ("IntersectionObserver" in window) {
  const navObserver = new IntersectionObserver(
    (entries) => {
      const visibleEntry = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visibleEntry) return;

      navLinks.forEach((link) => {
        const isActive = link.getAttribute("href") === `#${visibleEntry.target.id}`;

        link.classList.toggle("is-active", isActive);

        if (isActive) {
          link.setAttribute("aria-current", "location");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    },
    {
      rootMargin: "-20% 0px -65% 0px",
      threshold: [0, 0.2, 0.5]
    }
  );

  sections.forEach((section) => navObserver.observe(section));
}

// ---------------------------------------------------------------------------
// Single Back to Top mechanism. Always targets the actual document top.
// ---------------------------------------------------------------------------

const backToTop = document.getElementById("back-to-top");

backToTop?.addEventListener("click", (event) => {
  event.preventDefault();
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "smooth"
  });
});

// Keep the footer year current.
const year = document.getElementById("year");
if (year) {
  year.textContent = new Date().getFullYear();
}
