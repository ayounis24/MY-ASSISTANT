const LOCALE = 'ar-EG';

export function startOfDay(d: Date | number): number {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

export function isToday(ts: number): boolean {
  return startOfDay(ts) === startOfDay(Date.now());
}

export function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(LOCALE, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

export function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString(LOCALE, { hour: 'numeric', minute: '2-digit' });
}

/** Human-friendly due label: "اليوم ٥:٠٠ م", "بكرة ...", or a date. */
export function formatDue(ts: number): string {
  const today = startOfDay(Date.now());
  const day = startOfDay(ts);
  const oneDay = 24 * 60 * 60 * 1000;
  let label: string;
  if (day === today) label = 'اليوم';
  else if (day === today + oneDay) label = 'بكرة';
  else if (day === today - oneDay) label = 'امبارح';
  else label = formatDate(ts);
  return `${label} · ${formatTime(ts)}`;
}

export function formatLongDate(ts: number): string {
  return new Date(ts).toLocaleDateString(LOCALE, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
