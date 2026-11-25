// האם פריט מתאים לחיפוש: לפי מזהה - התאמה מדויקת, לפי כותרת - מכיל את הטקסט
// משמש כשכל הפריטים כבר בדפדפן (אלבומים, משימות של רשימה)
export function matchesSearch(item, { by, text }) {
  const query = text.trim().toLowerCase();
  if (!query) return true;
  if (by === 'id') return String(item.id) === query;
  return item.title.toLowerCase().includes(query);
}

// אותו חיפוש, אבל כפרמטרים לשרת - כשהרשימה נטענת בעמודים (פוסטים, תמונות)
export function searchToParams({ by, text }) {
  const query = text.trim();
  if (!query) return {};
  if (by === 'id') return { id: query };
  return { title_like: query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') };
}
