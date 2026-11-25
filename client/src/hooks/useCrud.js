import { useState, useEffect } from 'react';
import { apiGet, apiPost, apiPatch, apiDelete } from '../api';

export default function useCrud(resource, params = {}, enabled = true) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState('');

  const paramsKey = JSON.stringify(params);

  useEffect(() => {
    if (!enabled) return;
    let ignore = false;
    setLoading(true);
    setError('');

    // apiGet מחזיר תשובה שמורה אם כבר ביקשנו את אותה כתובת
    apiGet(resource, JSON.parse(paramsKey))
      .then((data) => !ignore && setItems(data))
      .catch((err) => !ignore && setError(err.message))
      .finally(() => !ignore && setLoading(false));

    return () => {
      ignore = true;
    };
  }, [resource, paramsKey, enabled]);

  // בכל הפעולות: קודם השרת, ורק אם הצליח - עדכון המסך
  async function add(newItem) {
    const created = await apiPost(resource, newItem);
    setItems((prev) => [...prev, created]);
    return created;
  }

  async function update(id, changes) {
    const updated = await apiPatch(`${resource}/${id}`, changes);
    setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
    return updated;
  }

  async function remove(id) {
    await apiDelete(`${resource}/${id}`);
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  return { items, loading, error, add, update, remove };
}
