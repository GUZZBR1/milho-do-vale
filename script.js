// Configure the business WhatsApp number here when available.
// Use international format without +, spaces or punctuation, e.g. 5512999999999.
const WHATSAPP_NUMBER = "5512982854348";
const WHATSAPP_MESSAGE = "Olá! Vim pelo site do Milho do Vale e gostaria de saber sobre disponibilidade e valores.";

// Set the Instagram handle (without @) when available, e.g. "milhodovale".
const INSTAGRAM_HANDLE = "milhodovale.sjc";

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");
const toast = document.querySelector("#toast");

menuToggle?.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

function closeMenu({ restoreFocus = false } = {}) {
  mainNav?.classList.remove("open");
  menuToggle?.setAttribute("aria-expanded", "false");
  if (restoreFocus) menuToggle?.focus();
}

document.querySelectorAll(".main-nav a").forEach((link) => {
  link.addEventListener("click", () => {
    closeMenu();
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && mainNav?.classList.contains("open")) {
    closeMenu({ restoreFocus: true });
  }
});

document.addEventListener("click", (event) => {
  if (!mainNav?.classList.contains("open") || event.target.closest(".site-header")) return;
  closeMenu();
});

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  window.setTimeout(() => toast.classList.remove("visible"), 3500);
}

document.querySelectorAll(".whatsapp-trigger").forEach((link) => {
  if (WHATSAPP_NUMBER && link.tagName === "A") {
    link.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
    link.target = "_blank";
    link.rel = "noopener";
  }

  link.addEventListener("click", (event) => {
    if (!WHATSAPP_NUMBER) {
      event.preventDefault();
      showToast("Configure o número do WhatsApp no arquivo script.js.");
      return;
    }
    if (link.tagName !== "A") {
      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
      window.open(url, "_blank", "noopener");
    }
  });
});

const instagramLink = document.querySelector("#instagram-link");
if (instagramLink) {
  if (INSTAGRAM_HANDLE) {
    instagramLink.href = `https://instagram.com/${INSTAGRAM_HANDLE}`;
  } else {
    instagramLink.remove();
  }
}

const header = document.querySelector("#site-header");
window.addEventListener("scroll", () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 8);
}, { passive: true });

const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window && !prefersReducedMotion) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}

// Corn 360 — scroll-driven frame sequence
const FRAME_COUNT = 24;
const corn360Section = document.querySelector(".corn360-sticky");
const canvas = document.querySelector("#corn360-canvas");

if (corn360Section && canvas && !prefersReducedMotion) {
  const ctx = canvas.getContext("2d");
  const frames = Array(FRAME_COUNT);
  const loadingFrames = new Map();
  let currentFrame = 0;

  function loadFrame(index) {
    if (frames[index]?.complete && frames[index].naturalWidth) return Promise.resolve(frames[index]);
    if (loadingFrames.has(index)) return loadingFrames.get(index);

    const img = new Image();
    img.decoding = "async";
    img.src = `assets/corn-360/frame-${String(index).padStart(2, "0")}.webp`;
    frames[index] = img;

    const promise = img.decode()
      .catch(() => new Promise((resolve, reject) => {
        img.addEventListener("load", resolve, { once: true });
        img.addEventListener("error", reject, { once: true });
      }))
      .then(() => img)
      .finally(() => loadingFrames.delete(index));

    loadingFrames.set(index, promise);
    return promise;
  }

  function drawFrame(index) {
    const img = frames[index];
    if (!img || !img.naturalWidth) return;
    // The Drive sources are already large enough for a sharp high-DPI canvas.
    // Keep the backing store at the source resolution to avoid needless memory use.
    const targetWidth = img.naturalWidth;
    const targetHeight = img.naturalHeight;
    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    currentFrame = index;
  }

  function drawWhenReady(index) {
    if (frames[index]?.naturalWidth) {
      drawFrame(index);
      return;
    }

    loadFrame(index).then(() => drawFrame(index)).catch(() => {
      canvas.hidden = true;
      document.querySelector("#corn360-fallback")?.removeAttribute("hidden");
    });
  }

  const keyFrames = [0, 6, 12, 18, 23];
  loadFrame(0).then(() => {
    drawFrame(0);
    return Promise.all(keyFrames.slice(1).map(loadFrame));
  }).then(() => {
    const loadRemaining = () => {
      for (let index = 0; index < FRAME_COUNT; index += 1) loadFrame(index).catch(() => {});
    };
    if ("requestIdleCallback" in window) window.requestIdleCallback(loadRemaining, { timeout: 1800 });
    else window.setTimeout(loadRemaining, 300);
  }).catch(() => {
    canvas.hidden = true;
    document.querySelector("#corn360-fallback")?.removeAttribute("hidden");
  });

  const messages = document.querySelectorAll(".corn360-message");

  function updateQuadrant(progress) {
    const quadrant = Math.min(3, Math.floor(progress * 4));
    messages.forEach((message) => {
      const isActive = progress < 0.97 && Number(message.dataset.quadrant) === quadrant;
      message.classList.toggle("is-active", isActive);
    });
  }

  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const rect = corn360Section.getBoundingClientRect();
      const total = corn360Section.offsetHeight - window.innerHeight;
      const scrolled = -rect.top;
      const progress = Math.min(1, Math.max(0, scrolled / total));

      // At 100%, step 24 wraps to frame 0 and completes exactly one turn.
      const frameIndex = Math.round(progress * FRAME_COUNT) % FRAME_COUNT;
      if (frameIndex !== currentFrame) drawWhenReady(frameIndex);
      updateQuadrant(progress);
      ticking = false;
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => drawFrame(currentFrame));
  onScroll();
} else if (canvas) {
  canvas.hidden = true;
  document.querySelector("#corn360-fallback")?.removeAttribute("hidden");
}

// Transition section — fade in copy lines and grow the corn as it enters view
const transitionSection = document.querySelector(".transition-section");
if (transitionSection) {
  const lines = transitionSection.querySelectorAll(".transition-line");
  const cornImg = transitionSection.querySelector(".transition-corn");
  const fieldImg = transitionSection.querySelector(".transition-field");
  const originLine = transitionSection.querySelector(".transition-origin-line");
  const originCopy = transitionSection.querySelector(".transition-origin-copy");

  if (prefersReducedMotion) {
    lines.forEach((line) => line.classList.add("is-visible"));
    originLine?.classList.add("is-visible");
    originCopy?.classList.add("is-visible");
  } else {
    let ticking = false;
    const onTransitionScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const rect = transitionSection.getBoundingClientRect();
        const total = transitionSection.offsetHeight - window.innerHeight;
        const progress = Math.min(1, Math.max(0, -rect.top / total));

        lines[0]?.classList.toggle("is-visible", progress > 0.09);
        lines[1]?.classList.toggle("is-visible", progress > 0.28);
        const fieldProgress = Math.min(1, Math.max(0, (progress - 0.34) / 0.19));
        if (cornImg) {
          cornImg.style.transform = `scale(${1 + progress * 0.88})`;
          cornImg.style.opacity = String(0.9 * (1 - fieldProgress));
        }
        if (fieldImg) {
          fieldImg.style.opacity = String(fieldProgress);
          fieldImg.style.transform = `scale(${1.05 - fieldProgress * 0.05})`;
        }
        transitionSection.querySelector(".transition-sticky")?.classList.toggle("has-field", fieldProgress > 0.05);
        originLine?.classList.toggle("is-visible", progress > 0.51 && progress < 0.76);
        originCopy?.classList.toggle("is-visible", progress > 0.76);
        transitionSection.querySelector(".transition-copy")?.style.setProperty("opacity", String(1 - Math.min(1, Math.max(0, (progress - 0.39) / 0.11))));
        ticking = false;
      });
    };
    window.addEventListener("scroll", onTransitionScroll, { passive: true });
    onTransitionScroll();
  }
}

// Journey timeline — fill the vertical progress line and highlight active steps
const timeline = document.querySelector(".timeline");
const timelineProgress = document.querySelector("#timeline-progress");

if (timeline && timelineProgress && !prefersReducedMotion) {
  let ticking = false;
  const onTimelineScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const rect = timeline.getBoundingClientRect();
      const viewportCenter = window.innerHeight * 0.6;
      const progress = Math.min(1, Math.max(0, (viewportCenter - rect.top) / rect.height));
      timelineProgress.style.height = `${progress * 100}%`;
      ticking = false;
    });
  };
  window.addEventListener("scroll", onTimelineScroll, { passive: true });
  onTimelineScroll();
}

const timelineItems = document.querySelectorAll(".timeline-item");
if ("IntersectionObserver" in window && !prefersReducedMotion) {
  const timelineItemObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle("is-active", entry.isIntersecting);
    });
  }, { threshold: 0.45 });
  timelineItems.forEach((item) => timelineItemObserver.observe(item));
} else {
  timelineItems.forEach((item) => item.classList.add("is-active"));
}

// Floating WhatsApp button — expand near the order section, step aside over the footer contacts
const floatButton = document.querySelector("#whatsapp-float");
const orderSection = document.querySelector("#pedido");
const footerContacts = document.querySelector(".footer-meta");

if (floatButton && "IntersectionObserver" in window) {
  if (orderSection) {
    const expandObserver = new IntersectionObserver(([entry]) => {
      floatButton.classList.toggle("is-expanded", entry.isIntersecting);
    }, { threshold: 0.2 });
    expandObserver.observe(orderSection);
  }

  // Only the bottom strip of the viewport matters: that is where the button sits.
  if (footerContacts) {
    const footerObserver = new IntersectionObserver(([entry]) => {
      floatButton.classList.toggle("is-hidden", entry.isIntersecting);
    }, { rootMargin: "-85% 0px 0px 0px" });
    footerObserver.observe(footerContacts);
  }
}
