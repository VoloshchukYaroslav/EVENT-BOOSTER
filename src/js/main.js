import { fetchEvents, fetchEventById, fetchEventsByAttraction } from "./api.js";
import { renderCards, renderModal, setSkeleton, setEmptyState } from "./ui.js";

const state = {
  keyword: "",
  countryCode: "",
  page: 0,
  totalPages: 0,
  isLoading: false,
  hasMore: true,
};

const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const countrySelect = document.getElementById("countrySelect");
const eventsGrid = document.getElementById("eventsGrid");
const modalOverlay = document.getElementById("modalOverlay");
const modal = document.getElementById("modal");
const modalContent = document.getElementById("modalContent");
const modalMore = document.getElementById("modalMore");
const modalClose = document.getElementById("modalClose");

const sentinel = document.createElement("div");
sentinel.id = "sentinel";
document.body.appendChild(sentinel);

const observer = new IntersectionObserver(
  (entries) => {
    if (entries[0].isIntersecting && state.hasMore && !state.isLoading) {
      loadMore();
    }
  },
  { rootMargin: "300px" },
);

async function loadMore() {
  state.page += 1;
  await loadEvents(true);
}

async function loadEvents(append = false) {
  if (state.isLoading) return;

  observer.unobserve(sentinel);

  state.isLoading = true;
  setSkeleton(true);
  setEmptyState(false);

  if (!append) eventsGrid.innerHTML = "";

  try {
    const { events, totalPages, page } = await fetchEvents({
      keyword: state.keyword,
      countryCode: state.countryCode,
      page: state.page,
      size: 12,
    });

    state.totalPages = totalPages;
    state.page = page;
    state.hasMore = page < totalPages - 1;

    if (!events.length && !append) {
      setEmptyState(true);
      return;
    }

    renderCards(events, eventsGrid, openModal, append);

    if (state.hasMore) {
      observer.observe(sentinel);
    }
  } catch (err) {
    if (!append) setEmptyState(true);
    console.error(err);
  } finally {
    setSkeleton(false);
    state.isLoading = false;
  }
}

function handleSearch() {
  // 1. Обов'язково відключаємо обсервер перед скиданням сторінки
  observer.unobserve(sentinel);

  state.keyword = searchInput.value.trim();
  state.countryCode = countrySelect.value;
  state.page = 0;
  state.hasMore = true;
  loadEvents(false);
}

searchBtn.addEventListener("click", handleSearch);
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleSearch();
});

let debounceTimer;
searchInput.addEventListener("input", () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(handleSearch, 500);
});

countrySelect.addEventListener("change", () => {
  // 1. Обов'язково відключаємо обсервер тут також!
  observer.unobserve(sentinel);

  state.countryCode = countrySelect.value;
  state.page = 0;
  state.hasMore = true;
  loadEvents(false);
});

async function openModal(event) {
  modalContent.innerHTML =
    '<p style="padding:40px;text-align:center;color:#888">Loading...</p>';
  modalMore.innerHTML = "";
  showModal();

  try {
    const [fullEvent, moreEvents] = await Promise.all([
      fetchEventById(event.id),
      event._embedded?.attractions?.[0]?.id
        ? fetchEventsByAttraction(event._embedded.attractions[0].id)
        : Promise.resolve([]),
    ]);

    renderModal(fullEvent, moreEvents, modalContent, modalMore);

    modalMore.querySelectorAll(".more-card").forEach((card, i) => {
      card.addEventListener("click", () => openModal(moreEvents[i]));
    });
  } catch (err) {
    modalContent.innerHTML =
      '<p style="padding:40px;text-align:center;color:#888">Failed to load.</p>';
    console.error(err);
  }
}

function showModal() {
  modalOverlay.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modalOverlay.classList.add("hidden");
  document.body.style.overflow = "";
  modal.scrollTop = 0;
}

modalClose.addEventListener("click", closeModal);
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

loadEvents(false);
