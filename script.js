// Configure the business WhatsApp number here when available.
// Use international format without +, spaces or punctuation, e.g. 5512999999999.
const WHATSAPP_NUMBER = "";

const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");
const whatsappLink = document.querySelector("#whatsapp-link");
const toast = document.querySelector("#toast");

menuToggle?.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

document.querySelectorAll(".main-nav a").forEach((link) => {
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

whatsappLink?.addEventListener("click", (event) => {
  if (!WHATSAPP_NUMBER) {
    event.preventDefault();
    showToast("Configure o número do WhatsApp no arquivo script.js.");
    return;
  }

  const message = encodeURIComponent("Olá! Quero fazer um pedido de milho fresco.");
  whatsappLink.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
