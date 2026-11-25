// פונקציות עזר קטנות לתצוגה

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatDateTime(iso) {
  return new Date(iso).toLocaleString('he-IL', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export function readingTime(text) {
  return Math.max(1, Math.round(text.split(/\s+/).length / 120));
}

export function timeSince(iso) {
  const months = Math.floor((Date.now() - new Date(iso)) / (1000 * 60 * 60 * 24 * 30.44));
  if (months < 1) return 'פחות מחודש';
  if (months < 12) return months === 1 ? 'חודש' : `${months} חודשים`;
  const years = Math.floor(months / 12);
  return years === 1 ? 'שנה' : years === 2 ? 'שנתיים' : `${years} שנים`;
}

export function sizedImage(url, height) {
  if (!url.includes('images.pexels.com')) return url;
  return `${url.split('?')[0]}?auto=compress&cs=tinysrgb&h=${height}`;
}
