// Build timeline with per-year colors + link to detail page
const events = [
  {
    year: "2019",
    icon: "fa-virus",
    summary: "Initial pneumonia cases reported in Wuhan; transmission suspected.",
    link: "pages/2019.html"
  },
  {
    year: "2020",
    icon: "fa-hospital",
    summary: "WHO declares pandemic; global lockdowns; first vaccines authorized.",
    link: "pages/2020.html"
  },
  {
    year: "2021",
    icon: "fa-syringe",
    summary: "Mass vaccination; variants of concern spread; Omicron emerges late year.",
    link: "pages/2021.html"
  },
  {
    year: "2022",
    icon: "fa-virus-covid",
    summary: "Omicron waves dominate; many regions shift to mitigation/endemic planning.",
    link: "pages/2022.html"
  },
  {
    year: "2023",
    icon: "fa-globe",
    summary: "WHO ends global health emergency; monitoring continues.",
    link: "pages/2023.html"
  },
  {
    year: "2024",
    icon: "fa-laptop-medical",
    summary: "Variant tracking continues; hybrid work & digital services normalize.",
    link: "pages/2024.html"
  },
  {
    year: "2025",
    icon: "fa-heartbeat",
    summary: "Long COVID and surveillance remain priorities worldwide.",
    link: "pages/2025.html"
  }
];

const timeline = document.getElementById("timeline");

events.forEach((e, idx) => {
  const item = document.createElement("div");
  item.className = `timeline-item ${idx % 2 === 0 ? "left" : "right"} y${e.year}`;
  item.id = e.year;

  item.innerHTML = `
    <span class="badge"><i class="fas ${e.icon}"></i>${e.year}</span>
    <div class="card">
      <h3 class="title">${e.year} — Key Snapshot</h3>
      <p class="desc">${e.summary}</p>
      <div class="actions">
        <a class="btn" href="${e.link}">
          <i class="fa-solid fa-up-right-from-square"></i> View details
        </a>
      </div>
    </div>
  `;

  // Clicking the whole item also opens the page
  item.addEventListener("click", (ev) => {
    // avoid double navigation when clicking the button
    if (!(ev.target.closest && ev.target.closest('a'))) {
      window.location.href = e.link;
    }
  });

  timeline.appendChild(item);
});

// Intersection reveal
const items = document.querySelectorAll(".timeline-item");
const observer = new IntersectionObserver((entries)=>{
  entries.forEach(en=>{ if(en.isIntersecting){ en.target.classList.add("show"); }});
}, {threshold:0.2});
items.forEach(i=>observer.observe(i));

// Smooth scroll to year with header offset
function scrollToYear(year){
  const element = document.getElementById(year);
  const headerHeight = document.querySelector("header").offsetHeight;
  const elementPosition = element.getBoundingClientRect().top + window.scrollY;
  const offsetPosition = elementPosition - (headerHeight + 20);
  window.scrollTo({ top: offsetPosition, behavior: "smooth" });
}

// Expose function to global scope
window.scrollToYear = scrollToYear;
