// Configure the business WhatsApp number here when available.
// Use international format without +, spaces or punctuation, e.g. 5512999999999.
const WHATSAPP_NUMBER = "5512982854348";
const WHATSAPP_MESSAGE = "Olá! Vim pelo site do Milho do Vale e gostaria de reservar milho da primeira colheita, em fevereiro de 2027.";

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

// One shared PNG follows the reader from the hero to the story and origin.
const clamp = (value, minimum = 0, maximum = 1) => Math.min(maximum, Math.max(minimum, value));
const lerp = (start, end, progress) => start + (end - start) * progress;
const smoothstep = (progress) => {
  const value = clamp(progress);
  return value * value * (3 - 2 * value);
};

const corn360Section = document.querySelector(".corn360-sticky");
const transitionSection = document.querySelector(".transition-section");
const scrollCorn = document.querySelector("#scroll-corn");
const heroCornSlot = document.querySelector('[data-corn-slot="hero"]');
const storyCornSlot = document.querySelector('[data-corn-slot="story"]');
const transitionCornSlot = document.querySelector('[data-corn-slot="transition"]');
const cornMessages = document.querySelectorAll(".corn360-message");
const cornHint = document.querySelector(".corn360-hint");

function updateCornMessage(progress) {
  const quadrant = Math.min(3, Math.floor(clamp(progress) * 4));
  cornMessages.forEach((message) => {
    const isActive = progress > 0.08 && progress < 0.97 && Number(message.dataset.quadrant) === quadrant;
    message.classList.toggle("is-active", isActive);
  });
  cornHint?.classList.toggle("is-hidden", progress > 0.08);
}

if (scrollCorn && heroCornSlot && storyCornSlot && transitionCornSlot && corn360Section && transitionSection) {
  const BASE_WIDTH = 512;
  let currentState;
  let targetState;
  let animationFrame;

  function stateFromSlot(slot) {
    const rect = slot.getBoundingClientRect();
    return { x: rect.left, y: rect.top, width: rect.width, opacity: 1, rotation: 0 };
  }

  function stateFromTransitionSlot() {
    const rect = transitionCornSlot.getBoundingClientRect();
    const stickyRect = transitionCornSlot.closest(".transition-sticky").getBoundingClientRect();
    const headerClearance = (header?.getBoundingClientRect().bottom ?? 0) + 8;
    return {
      x: rect.left,
      y: Math.max(rect.top - stickyRect.top, headerClearance),
      width: rect.width,
      opacity: 0.94,
      rotation: 0,
    };
  }

  function mixStates(from, to, progress) {
    const eased = smoothstep(progress);
    return {
      x: lerp(from.x, to.x, eased),
      y: lerp(from.y, to.y, eased),
      width: lerp(from.width, to.width, eased),
      opacity: lerp(from.opacity, to.opacity, eased),
      rotation: lerp(from.rotation, to.rotation, eased),
    };
  }

  function applyCornState(state) {
    const scale = state.width / BASE_WIDTH;
    scrollCorn.style.opacity = String(clamp(state.opacity));
    scrollCorn.style.transform = `translate3d(${state.x}px, ${state.y}px, 0) rotate(${state.rotation}deg) scale(${scale})`;
  }

  function animateCorn() {
    animationFrame = undefined;
    const easing = prefersReducedMotion ? 1 : 0.14;
    currentState = {
      x: lerp(currentState.x, targetState.x, easing),
      y: lerp(currentState.y, targetState.y, easing),
      width: lerp(currentState.width, targetState.width, easing),
      opacity: lerp(currentState.opacity, targetState.opacity, easing),
      rotation: lerp(currentState.rotation, targetState.rotation, easing),
    };
    applyCornState(currentState);

    const remaining = Math.abs(currentState.x - targetState.x)
      + Math.abs(currentState.y - targetState.y)
      + Math.abs(currentState.width - targetState.width)
      + Math.abs(currentState.opacity - targetState.opacity) * 100
      + Math.abs(currentState.rotation - targetState.rotation);
    if (remaining > 0.12) animationFrame = requestAnimationFrame(animateCorn);
  }

  function calculateCornTarget() {
    const viewportHeight = window.innerHeight;
    const storyRect = corn360Section.getBoundingClientRect();
    const transitionRect = transitionSection.getBoundingClientRect();
    const storyTotal = Math.max(1, corn360Section.offsetHeight - viewportHeight);
    const storyProgress = clamp(-storyRect.top / storyTotal);
    const storyArrival = smoothstep((viewportHeight * 0.88 - storyRect.top) / (viewportHeight * 0.88));
    const storyDeparture = smoothstep((storyProgress - 0.8) / 0.17);
    const viewportTransitionArrival = smoothstep((viewportHeight - transitionRect.top) / viewportHeight);
    const transitionArrival = Math.max(storyDeparture, viewportTransitionArrival);
    const transitionTotal = Math.max(1, transitionSection.offsetHeight - viewportHeight);
    const transitionProgress = clamp(-transitionRect.top / transitionTotal);
    const fieldProgress = clamp((transitionProgress - 0.34) / 0.19);

    const heroState = stateFromSlot(heroCornSlot);
    const storyState = stateFromSlot(storyCornSlot);
    storyState.rotation = prefersReducedMotion ? 0 : Math.sin(storyProgress * Math.PI * 2) * 2.2;
    let nextState = mixStates(heroState, storyState, storyArrival);

    if (transitionArrival > 0) {
      const transitionState = stateFromTransitionSlot();
      transitionState.opacity = 0.94 * (1 - fieldProgress);
      transitionState.rotation = prefersReducedMotion ? 0 : Math.sin(transitionProgress * Math.PI) * -1.6;
      nextState = mixStates(nextState, transitionState, transitionArrival);
    }

    if (transitionRect.bottom < 0) nextState.opacity = 0;
    updateCornMessage(storyProgress);
    return nextState;
  }

  function updateCornPosition() {
    targetState = calculateCornTarget();
    if (!currentState) {
      currentState = { ...targetState };
      applyCornState(currentState);
      scrollCorn.classList.add("is-ready");
    }
    if (!animationFrame) animationFrame = requestAnimationFrame(animateCorn);
  }

  document.body.append(scrollCorn);
  window.addEventListener("scroll", updateCornPosition, { passive: true });
  window.addEventListener("resize", updateCornPosition);
  updateCornPosition();
}

// Transition section — fade in copy lines and hand the scene over to the field.
if (transitionSection) {
  const lines = transitionSection.querySelectorAll(".transition-line");
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
        if (fieldImg) {
          fieldImg.style.opacity = String(fieldProgress);
          fieldImg.style.transform = `scale(${1.05 - fieldProgress * 0.05})`;
        }
        transitionSection.querySelector(".transition-sticky")?.classList.toggle("has-field", fieldProgress > 0.05);
        const originLineOpacity = smoothstep((progress - 0.5) / 0.1)
          * (1 - smoothstep((progress - 0.67) / 0.09));
        const originCopyOpacity = smoothstep((progress - 0.8) / 0.11);
        if (originLine) {
          originLine.style.opacity = String(originLineOpacity);
          originLine.style.transform = `translate(-50%, calc(-50% + ${(1 - originLineOpacity) * 18}px))`;
        }
        if (originCopy) {
          originCopy.style.opacity = String(originCopyOpacity);
          originCopy.style.transform = `translate(-50%, calc(-50% + ${(1 - originCopyOpacity) * 26}px))`;
        }
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
