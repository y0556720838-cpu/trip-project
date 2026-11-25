import { useState, useEffect, useCallback, useRef } from 'react';
import { apiGetPage, apiPost, apiPatch, apiDelete } from '../api';

// רשימה ארוכה שנטענת בעמודים (Infinite Scroll).
// params - סינון ומיון שנשלחים לשרת. שינוי שלהם מתחיל את הטעינה מעמוד 1
export default function usePaged(resource, params, pageSize, enabled = true) {
  const paramsKey = JSON.stringify(params);
  const [list, setList] = useState({ key: paramsKey, page: 1, items: [], total: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // הסינון השתנה - מאפסים כבר בזמן הרינדור, כדי שלא תוצג לרגע הרשימה הישנה
  if (list.key !== paramsKey) {
    setList({ key: paramsKey, page: 1, items: [], total: null });
  }

  const { page } = list;

  useEffect(() => {
    if (!enabled) return;
    let ignore = false;
    setLoading(true);
    setError('');

    apiGetPage(resource, JSON.parse(paramsKey), page, pageSize)
      .then(({ data, total }) => {
        if (ignore) return;
        setList((prev) => ({
          ...prev,
          // עמוד ראשון מחליף, כל עמוד אחר מצטרף לסוף (בלי כפילויות)
          items: page === 1 ? data : [...prev.items, ...data.filter((d) => !prev.items.some((i) => i.id === d.id))],
          total,
        }));
      })
      .catch((err) => !ignore && setError(err.message))
      .finally(() => !ignore && setLoading(false));

    return () => {
      ignore = true;
    };
  }, [resource, paramsKey, page, pageSize, enabled]);

  const hasMore = list.total === null || list.items.length < list.total;

  // אלמנט "חיישן" בסוף הרשימה: כשהוא נכנס למסך - מבקשים את העמוד הבא.
  // הפונקציה נוצרת מחדש כשמצב הטעינה משתנה, וכך החיישן נבדק שוב אחרי כל עמוד
  const observer = useRef(null);
  const sentinelRef = useCallback(
    (node) => {
      observer.current?.disconnect();
      if (!node || loading || !hasMore || error) return;
      observer.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setList((prev) => ({ ...prev, page: prev.page + 1 }));
        },
        { rootMargin: '300px' }
      );
      observer.current.observe(node);
    },
    [loading, hasMore, error]
  );

  // בקשת העמוד הבא ידנית ( Lightbox)
  function loadMore() {
    if (!loading && hasMore) setList((prev) => ({ ...prev, page: prev.page + 1 }));
  }

  // פעולות: קודם השרת, ואז עדכון הרשימה שכבר נטענה
  async function add(newItem) {
    const created = await apiPost(resource, newItem);
    setList((prev) => ({ ...prev, items: [created, ...prev.items], total: prev.total + 1 }));
    return created;
  }

  async function update(id, changes) {
    const updated = await apiPatch(`${resource}/${id}`, changes);
    setList((prev) => ({ ...prev, items: prev.items.map((i) => (i.id === id ? updated : i)) }));
    return updated;
  }

  async function remove(id) {
    await apiDelete(`${resource}/${id}`);
    setList((prev) => ({ ...prev, items: prev.items.filter((i) => i.id !== id), total: prev.total - 1 }));
  }

  return { items: list.items, total: list.total, loading, error, hasMore, sentinelRef, loadMore, add, update, remove };
}
