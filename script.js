// Configure the business WhatsApp number here when available.
// Use international format without +, spaces or punctuation, e.g. 5512999999999.
const WHATSAPP_NUMBER = "";
const WHATSAPP_MESSAGE = "Olá! Vim pelo site do Milho do Vale e gostaria de saber sobre disponibilidade e valores.";

// Set the Instagram handle (without @) when available, e.g. "milhodovale".
const INSTAGRAM_HANDLE = "";

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");
const toast = document.querySelector("#toast");

menuToggle?.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

document.querySelectorAll(".main-nav a:not(.button)").forEach((link) => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
  });
});

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  window.setTimeout(() => toast.classList.remove("visible"), 3500);
}

document.querySelectorAll(".whatsapp-trigger").forEach((link) => {
  link.addEventListener("click", (event) => {
    if (!WHATSAPP_NUMBER) {
      event.preventDefault();
      showToast("Configure o número do WhatsApp no arquivo script.js.");
      return;
    }
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
    if (link.tagName === "A") {
      link.href = url;
    } else {
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

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

// Corn 360 — scroll-driven frame sequence
const FRAME_COUNT = 24;
const corn360Section = document.querySelector(".corn360-sticky");
const canvas = document.querySelector("#corn360-canvas");

if (corn360Section && canvas && !prefersReducedMotion) {
  const ctx = canvas.getContext("2d");
  const frames = [];
  let framesReady = false;

  for (let i = 0; i < FRAME_COUNT; i += 1) {
    const img = new Image();
    img.src = `assets/corn-360/frame-${String(i).padStart(2, "0")}.webp`;
    frames.push(img);
  }

  Promise.all(frames.map((img) => img.decode().catch(() => {}))).then(() => {
    framesReady = true;
    drawFrame(0);
  });

  function drawFrame(index) {
    const img = frames[index];
    if (!img || !img.naturalWidth) return;
    if (canvas.width !== img.naturalWidth * 2) {
      canvas.width = img.naturalWidth * 2;
      canvas.height = img.naturalHeight * 2;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }

  const messages = document.querySelectorAll(".corn360-message");

  function updateQuadrant(progress) {
    const quadrant = Math.min(3, Math.floor(progress * 4));
    messages.forEach((message) => {
      const isActive = Number(message.dataset.quadrant) === quadrant;
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

      if (framesReady) {
        const frameIndex = Math.min(FRAME_COUNT - 1, Math.floor(progress * FRAME_COUNT));
        drawFrame(frameIndex);
      }
      updateQuadrant(progress);
      ticking = false;
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => drawFrame(0));
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

  if (prefersReducedMotion) {
    lines.forEach((line) => line.classList.add("is-visible"));
  } else {
    let ticking = false;
    const onTransitionScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const rect = transitionSection.getBoundingClientRect();
        const total = transitionSection.offsetHeight - window.innerHeight;
        const progress = Math.min(1, Math.max(0, -rect.top / total));

        lines[0]?.classList.toggle("is-visible", progress > 0.15);
        lines[1]?.classList.toggle("is-visible", progress > 0.45);
        if (cornImg) cornImg.style.transform = `scale(${1 + progress * 0.5})`;
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

const timelineItemObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    entry.target.classList.toggle("is-visible", entry.isIntersecting);
  });
}, { threshold: 0.5 });

document.querySelectorAll(".timeline-item").forEach((item) => timelineItemObserver.observe(item));

// Floating WhatsApp button — expand with a label near the conversion sections
const floatButton = document.querySelector("#whatsapp-float");
const expandTargets = document.querySelectorAll("#pedido, .site-footer");

if (floatButton && expandTargets.length) {
  const expandObserver = new IntersectionObserver((entries) => {
    const shouldExpand = entries.some((entry) => entry.isIntersecting);
    floatButton.classList.toggle("is-expanded", shouldExpand);
  }, { threshold: 0.2 });

  expandTargets.forEach((target) => expandObserver.observe(target));
}
