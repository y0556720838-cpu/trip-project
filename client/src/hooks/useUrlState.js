import { useSearchParams } from "react-router-dom";

export default function useUrlState(defaults) {
  const [searchParams, setSearchParams] = useSearchParams();

  const values = {};
  for (const key in defaults) {
    values[key] = searchParams.get(key) ?? defaults[key];
  }

  function setValues(changes) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        for (const [key, value] of Object.entries(changes)) {
          if (value === defaults[key] || value === "") next.delete(key);
          else next.set(key, value);
        }
        return next;
      },
      // replace - כדי שכל הקלדה לא תיצור צעד חדש בכפתור "אחורה"
      { replace: true },
    );
  }

  return [values, setValues];
}
