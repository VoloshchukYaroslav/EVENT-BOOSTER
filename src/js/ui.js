import { getBestImage, formatDate } from "./api.js";

export function renderCards(events, container, onCardClick, append = false) {
  if (!append) container.innerHTML = "";

  events.forEach((event, i) => {
    const card = document.createElement("div");
    card.className = "event-card";

    const img = getBestImage(event.images);
    const date = formatDate(
      event.dates?.start?.localDate,
      event.dates?.start?.localTime,
    );
    const venue = event._embedded?.venues?.[0];

    card.innerHTML = `
      ${
        img
          ? `<img class="event-card__img" src="${img}" alt="${esc(event.name)}" loading="lazy" />`
          : '<div class="event-card__img"></div>'
      }
      <div class="event-card__body">
        <p class="event-card__name">${esc(event.name)}</p>
        <p class="event-card__date">${date}</p>
        ${venue ? `<p class="event-card__venue">${esc(venue.name)}${venue.city?.name ? ", " + esc(venue.city.name) : ""}</p>` : ""}
      </div>
    `;

    card.addEventListener("click", () => onCardClick(event));
    container.appendChild(card);
  });
}

export function renderModal(event, moreEvents, contentEl, moreEl) {
  const img = getBestImage(event.images);
  const date = formatDate(
    event.dates?.start?.localDate,
    event.dates?.start?.localTime,
  );
  const venue = event._embedded?.venues?.[0];
  const attractions = event._embedded?.attractions ?? [];

  const avatarEl = document.getElementById("modalAvatar");
  if (avatarEl) {
    if (img) {
      avatarEl.src = img;
      avatarEl.classList.add("visible");
    } else {
      avatarEl.classList.remove("visible");
    }
  }

  contentEl.innerHTML = `
    ${img ? `<img class="modal__img" src="${img}" alt="${esc(event.name)}" />` : ""}
    <div class="modal__info">
      <h2 class="modal__title">${esc(event.name)}</h2>

      ${
        event.info
          ? `
        <p class="modal__section-label">Info</p>
        <p class="modal__section-value">${esc(event.info)}</p>
      `
          : ""
      }

      <p class="modal__section-label">When</p>
      <p class="modal__section-value">${date}</p>

      ${
        venue
          ? `
        <p class="modal__section-label">Where</p>
        <p class="modal__section-value">${esc(venue.name)}${venue.city?.name ? ", " + esc(venue.city.name) : ""}</p>
      `
          : ""
      }

      ${
        attractions[0]?.name
          ? `
        <p class="modal__section-label">Who</p>
        <p class="modal__section-value">${esc(attractions[0].name)}</p>
      `
          : ""
      }

      ${
        event.priceRanges?.[0]
          ? `
        <p class="modal__section-label">Prices</p>
        <p class="modal__section-value">${event.priceRanges[0].min}–${event.priceRanges[0].max} ${event.priceRanges[0].currency ?? ""}</p>
      `
          : ""
      }

      ${event.url ? `<a class="modal__buy-btn" href="${event.url}" target="_blank" rel="noopener">Buy Tickets</a>` : ""}
    </div>
  `;

  const others = moreEvents.filter((e) => e.id !== event.id).slice(0, 3);

  if (others.length) {
    moreEl.innerHTML = `
      <p class="modal__more-title">More from ${attractions[0]?.name ?? "this artist"}</p>
      <div class="modal__more-grid">
        ${others
          .map(
            (e) => `
          <div class="more-card" data-id="${e.id}">
            ${
              getBestImage(e.images)
                ? `<img class="more-card__img" src="${getBestImage(e.images)}" alt="${esc(e.name)}" loading="lazy" />`
                : '<div class="more-card__img"></div>'
            }
            <p class="more-card__name">${esc(e.name)}</p>
          </div>
        `,
          )
          .join("")}
      </div>
    `;
  } else {
    moreEl.innerHTML = "";
  }

  return others;
}

export function renderPagination(
  currentPage,
  totalPages,
  container,
  onPageClick,
) {
  container.innerHTML = "";
  if (totalPages <= 1) return;

  const prev = btn("←", currentPage === 0);
  prev.addEventListener("click", () => onPageClick(currentPage - 1));
  container.appendChild(prev);

  const maxVisible = 5;
  let start = Math.max(0, currentPage - 2);
  let end = Math.min(totalPages - 1, start + maxVisible - 1);
  if (end - start < maxVisible - 1) start = Math.max(0, end - maxVisible + 1);

  for (let i = start; i <= end; i++) {
    const b = btn(i + 1, false);
    if (i === currentPage) b.classList.add("active");
    const page = i;
    b.addEventListener("click", () => onPageClick(page));
    container.appendChild(b);
  }

  const next = btn("→", currentPage >= totalPages - 1);
  next.addEventListener("click", () => onPageClick(currentPage + 1));
  container.appendChild(next);
}

function btn(label, disabled) {
  const b = document.createElement("button");
  b.className = "pagination__btn";
  b.textContent = label;
  b.disabled = disabled;
  return b;
}

export function setSkeleton(show) {
  document.getElementById("skeletonGrid")?.classList.toggle("hidden", !show);
}

export function setEmptyState(show) {
  document.getElementById("emptyState")?.classList.toggle("hidden", !show);
}

function esc(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
