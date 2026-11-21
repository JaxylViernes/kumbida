import { invitation } from '../config/invitation';

const utcStamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1');

export function googleCalendarUrl() {
  const c = invitation.calendar;
  const p = new URLSearchParams({
    action: 'TEMPLATE',
    text: c.eventTitle,
    dates: `${utcStamp(invitation.wedding.iso)}/${utcStamp(c.endIso)}`,
    details: c.description,
    location: c.location,
  });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

/** Downloads an .ics file — opens in Apple Calendar, Outlook, and most phone calendars. */
export function downloadIcs() {
  const c = invitation.calendar;
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Digital Invitation//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${utcStamp(invitation.wedding.iso)}-wedding@invitation`,
    `DTSTAMP:${utcStamp(new Date().toISOString())}`,
    `DTSTART:${utcStamp(invitation.wedding.iso)}`,
    `DTEND:${utcStamp(c.endIso)}`,
    `SUMMARY:${esc(c.eventTitle)}`,
    `DESCRIPTION:${esc(c.description)}`,
    `LOCATION:${esc(c.location)}`,
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    `DESCRIPTION:${esc(c.eventTitle)} is tomorrow`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'save-the-date.ics';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

/** Month grid for the wedding month (weeks start on Sunday). */
export function monthGrid() {
  const [y, m, d] = invitation.wedding.iso.slice(0, 10).split('-').map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const cells: (number | null)[] = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);
  return { cells, day: d, monthName: new Date(Date.UTC(y, m - 1, 1)).toLocaleString('en', { month: 'long', timeZone: 'UTC' }), year: y };
}
