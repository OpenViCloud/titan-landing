// Answers per visitor address per UTC day, counted in memory only: the address is never stored
// (titan-ops features/public-site/design.md#chat-assistant). A restart forgets the counts.

function utcDay(date) {
  return date.toISOString().slice(0, 10);
}

export function createDailyLimit({ perDay, now = () => new Date() }) {
  let day = utcDay(now());
  let counts = new Map();

  function rollOver() {
    const today = utcDay(now());
    if (today !== day) {
      day = today;
      counts = new Map();
    }
  }

  return {
    // true when the address may ask once more today, and counts that question.
    take(address) {
      rollOver();
      const used = counts.get(address) ?? 0;
      if (used >= perDay) return false;
      counts.set(address, used + 1);
      return true;
    },
    size() {
      return counts.size;
    },
  };
}
