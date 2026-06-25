const API_KEY = "mABh53dNd5AlUTxKtHvnFAxMeC8XhPO6";
const BASE_URL = "https://app.ticketmaster.com/discovery/v2";

export async function fetchEvents({
  keyword = "",
  countryCode = "",
  page = 0,
  size = 12,
} = {}) {
  const params = new URLSearchParams({
    apikey: API_KEY,
    size,
    page,
    sort: "date,asc",
  });

  if (keyword) params.append("keyword", keyword);
  if (countryCode) params.append("countryCode", countryCode);

  const res = await fetch(`${BASE_URL}/events.json?${params}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);

  const data = await res.json();

  return {
    events: data._embedded?.events ?? [],
    totalPages: data.page?.totalPages ?? 0,
    page: data.page?.number ?? 0,
  };
}

export async function fetchEventById(id) {
  const params = new URLSearchParams({ apikey: API_KEY });
  const res = await fetch(`${BASE_URL}/events/${id}.json?${params}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function fetchEventsByAttraction(attractionId) {
  const params = new URLSearchParams({
    apikey: API_KEY,
    attractionId,
    size: 6,
    sort: "date,asc",
  });
  const res = await fetch(`${BASE_URL}/events.json?${params}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data._embedded?.events ?? [];
}

export function getBestImage(images = []) {
  const ratio169 = images.filter((img) => img.ratio === "16_9");
  const pool = ratio169.length ? ratio169 : images;
  return (
    pool.reduce(
      (best, img) => (img.width > (best?.width ?? 0) ? img : best),
      null,
    )?.url ?? ""
  );
}

export function formatDate(dateStr, timeStr = "") {
  if (!dateStr) return "Date TBA";
  const date = new Date(`${dateStr}T${timeStr || "00:00:00"}`);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
