export function initScrollTop() {
  const btn = document.getElementById("scrollTopBtn");
  if (!btn) return;

  const toggle = () => {
    btn.classList.toggle("visible", window.scrollY > 400);
  };

  window.addEventListener("scroll", toggle, { passive: true });
  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  toggle();
}
