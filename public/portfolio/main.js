(() => {
  const $ = (s) => document.querySelector(s);
  const config = window.PORTFOLIO_CONFIG || {};
  const loader = $("#loader");
  window.addEventListener("load", () => setTimeout(() => loader.classList.add("hidden"), 450));
  setTimeout(() => loader.classList.add("hidden"), 1800);
  $("#year").textContent = new Date().getFullYear();

  const themeToggle = $("#themeToggle");
  const savedTheme = localStorage.getItem("amulya-theme");
  if (savedTheme === "dark") document.body.classList.add("dark");
  const setThemeIcon = () => themeToggle.textContent = document.body.classList.contains("dark") ? "☀" : "☾";
  setThemeIcon();
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("amulya-theme", document.body.classList.contains("dark") ? "dark" : "light");
    setThemeIcon();
  });

  const nav = $(".desktop-nav");
  const menuToggle = $("#menuToggle");
  menuToggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
  });
  nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
    nav.classList.remove("open"); menuToggle.setAttribute("aria-expanded", "false");
  }));

  const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add("visible"); revealObserver.unobserve(entry.target); }
  }), {threshold: 0.12});
  document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));

  const sections = [...document.querySelectorAll("main section[id]")];
  const navLinks = [...document.querySelectorAll(".nav-link")];
  const sectionObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) navLinks.forEach(link => link.classList.toggle("active", link.getAttribute("href") === "#" + entry.target.id));
  }), {rootMargin:"-35% 0px -55% 0px"});
  sections.forEach(section => sectionObserver.observe(section));

  const glow = $(".cursor-glow");
  window.addEventListener("pointermove", e => { glow.style.left = e.clientX + "px"; glow.style.top = e.clientY + "px"; });

  const form = $("#contactForm");
  form.addEventListener("submit", e => {
    e.preventDefault();
    const note = $("#formNote");
    if (!config.email) {
      note.textContent = "Add your email address in js/config.js to activate this contact form.";
      return;
    }
    const data = new FormData(form);
    const subject = encodeURIComponent("Portfolio enquiry from " + data.get("name"));
    const body = encodeURIComponent("Name: " + data.get("name") + "\nEmail: " + data.get("email") + "\n\n" + data.get("message"));
    window.location.href = `mailto:${config.email}?subject=${subject}&body=${body}`;
    note.textContent = "Your email app should open with the message prepared. Please review and send it there.";
  });

  // Optional links are inserted only after real URLs are added in js/config.js.
  const socials = [
    ["linkedin", "LinkedIn"], ["github", "GitHub"], ["instagram", "Instagram"], ["resume", "Resume"]
  ];
  const footer = $(".contact-bottom");
  socials.forEach(([key, label]) => {
    if (config[key]) {
      const a = document.createElement("a");
      a.href = config[key]; a.textContent = label; a.target = "_blank"; a.rel = "noopener noreferrer";
      footer.insertBefore(a, footer.lastElementChild);
    }
  });
})();