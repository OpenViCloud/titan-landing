// Which language a visitor reads (docs/features/public-site/design.md#site-language): English at /, Vietnamese
// under /vi/, same slugs. A choice made with a language switch is saved per browser and wins; with no choice
// saved, a first visit from Vietnam goes to the Vietnamese page. The pure functions are tested in node; boot()
// is the browser part.

const STORAGE_KEY = 'ovc-lang';
const TRACE_TIMEOUT_MS = 1500;

export function langOfPath(path) {
  if (path === '/vi' || path.startsWith('/vi/')) return 'vi';
  return 'en';
}

// Only the landing and the docs exist in both languages; every other path has no counterpart.
export function counterpartPath(path, targetLang) {
  if (langOfPath(path) === 'vi') {
    const rest = path === '/vi' ? '/' : path.slice('/vi'.length);
    if (targetLang !== 'en') return null;
    if (rest === '/' || rest.startsWith('/docs/')) return rest;
    return null;
  }
  if (targetLang !== 'vi') return null;
  if (path === '/') return '/vi/';
  if (path.startsWith('/docs/')) return `/vi${path}`;
  return null;
}

// Safari private mode and blocked site data throw on every access.
export function readSavedLang(storage) {
  if (storage === null) return null;
  let value = null;
  try {
    value = storage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
  if (value === 'en' || value === 'vi') return value;
  return null;
}

export function saveLang(storage, lang) {
  if (storage === null) return;
  try {
    storage.setItem(STORAGE_KEY, lang);
  } catch {
    // Blocked storage: the switch still navigates, the choice is just not remembered.
  }
}

export function countryFromTrace(text) {
  if (typeof text !== 'string') return null;
  for (const line of text.split('\n')) {
    if (line.startsWith('loc=')) {
      const country = line.slice('loc='.length).trim();
      if (/^[A-Z]{2}$/.test(country)) return country;
      return null;
    }
  }
  return null;
}

// Returns the language to move to, or null to stay. A saved choice beats the country; the country only moves an
// English page, so a Vietnamese link someone shares is never turned into English.
export function decideTarget({ saved, pageLang, country }) {
  if (saved !== null) {
    if (saved === pageLang) return null;
    return saved;
  }
  if (pageLang === 'en' && country === 'VN') return 'vi';
  return null;
}

function browserStorage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

// Cloudflare answers /cdn-cgi/trace on every proxied host; without Cloudflare (dev) it is a 404 and we stay English.
async function fetchCountry() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TRACE_TIMEOUT_MS);
  try {
    const response = await fetch('/cdn-cgi/trace', { signal: controller.signal });
    if (response.status !== 200) return null;
    return countryFromTrace(await response.text());
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function goTo(targetLang) {
  const target = counterpartPath(window.location.pathname, targetLang);
  if (target !== null) window.location.replace(target + window.location.search + window.location.hash);
}

// A switch is a link marked data-lang-switch="en|vi" (landing) or Starlight's language select (docs).
function rememberSwitches(storage) {
  document.addEventListener('click', (event) => {
    const link = event.target instanceof Element ? event.target.closest('[data-lang-switch]') : null;
    if (link !== null) saveLang(storage, link.getAttribute('data-lang-switch'));
  });
  document.addEventListener('change', (event) => {
    const select = event.target;
    if (select instanceof HTMLSelectElement && select.closest('starlight-lang-select') !== null) {
      saveLang(storage, langOfPath(new URL(select.value, window.location.href).pathname));
    }
  }, true);
}

export async function boot() {
  const storage = browserStorage();
  rememberSwitches(storage);
  const pageLang = langOfPath(window.location.pathname);
  const saved = readSavedLang(storage);
  let country = null;
  if (saved === null && pageLang === 'en') country = await fetchCountry();
  const target = decideTarget({ saved, pageLang, country });
  if (target !== null) goTo(target);
}
