// Turns the two anonymous price lists into plan cards (docs/features/public-site/design.md#live-pricing).
// Returns null whenever the data can't be trusted, so the page shows the fallback sentence
// instead of "0 ₫", an empty cell or NaN.

// Numbers follow the page language: 161.388 ₫/hour in English, 161,388 ₫/giờ in Vietnamese. Keep every decimal
// the API sends: rounding here would print a price the meter never charges.
const FORMATS = {
  en: {
    vnd: new Intl.NumberFormat('en-US', { maximumFractionDigits: 10 }),
    wholeVnd: new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }),
    hour: 'hour',
    month: 'month',
  },
  vi: {
    vnd: new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 10 }),
    wholeVnd: new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }),
    hour: 'giờ',
    month: 'tháng',
  },
};

function formatOf(lang) {
  if (lang === 'vi') return FORMATS.vi;
  return FORMATS.en;
}

const HOURS_PER_MONTH = 730;
const FEATURED_TIER = 'm';

function isPositiveNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function formatVnd(amount, format) {
  return `${format.vnd.format(amount)} ₫`;
}

// The hourly price is what the invoice charges; the monthly figure is only an estimate for
// a machine running all month. toFixed drops the float error first: 634.05 * 730 is
// 462856.49999999994 in binary, 462856.5 in decimal. Prices are positive, so Math.round is half-up.
function monthlyEstimate(pricePerHour, unit, format) {
  const month = Math.round(Number((pricePerHour * HOURS_PER_MONTH).toFixed(6)));
  if (month === 0) return null;
  return `≈ ${format.wholeVnd.format(month)} ₫/${unit}`;
}

function isTrustedVm(offering) {
  return offering !== null
    && typeof offering === 'object'
    && typeof offering.id === 'string' && offering.id !== ''
    && typeof offering.name === 'string'
    && Number.isInteger(offering.vcpu) && offering.vcpu > 0
    && Number.isInteger(offering.memoryMb) && offering.memoryMb > 0
    && isPositiveNumber(offering.pricePerHour);
}

export function vmRows(offerings, lang) {
  if (!Array.isArray(offerings) || offerings.length === 0) return null;
  const format = formatOf(lang);
  const rows = [];
  for (const offering of offerings) {
    if (!isTrustedVm(offering)) return null;
    rows.push({
      id: offering.id,
      name: offering.name,
      vcpu: String(offering.vcpu),
      memory: `${format.vnd.format(offering.memoryMb / 1024)} GB`,
      price: `${formatVnd(offering.pricePerHour, format)}/${format.hour}`,
      monthly: monthlyEstimate(offering.pricePerHour, format.month, format),
      featured: offering.id === FEATURED_TIER,
    });
  }
  return rows;
}

// "From X an hour" in the hero: the cheapest tier, or null under the same trust rule as the cards.
export function startingPrice(offerings, lang) {
  if (vmRows(offerings, lang) === null) return null;
  let cheapest = offerings[0].pricePerHour;
  for (const offering of offerings) {
    if (offering.pricePerHour < cheapest) cheapest = offering.pricePerHour;
  }
  return formatVnd(cheapest, formatOf(lang));
}

export function volumeRows(offerings, lang) {
  if (!Array.isArray(offerings) || offerings.length === 0) return null;
  const format = formatOf(lang);
  const rows = [];
  for (const offering of offerings) {
    const valid = offering !== null
      && typeof offering === 'object'
      && typeof offering.name === 'string'
      && isPositiveNumber(offering.pricePerGbPerHour);
    if (!valid) return null;
    rows.push({
      name: offering.name,
      price: `${formatVnd(offering.pricePerGbPerHour, format)}/GB/${format.hour}`,
      monthly: monthlyEstimate(offering.pricePerGbPerHour, `GB/${format.month}`, format),
    });
  }
  return rows;
}
