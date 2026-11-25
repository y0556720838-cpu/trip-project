import { useState, useEffect } from 'react';

// מחזיר את הערך רק אחרי שהפסיקו לשנות אותו לזמן קצר.
// משמש בחיפוש מול השרת - כדי לא לשלוח בקשה על כל אות שמקלידים
export default function useDebounce(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
