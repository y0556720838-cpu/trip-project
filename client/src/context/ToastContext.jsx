import { createContext, useContext, useState, useCallback } from 'react';
import { CircleCheck, CircleAlert } from 'lucide-react';

const ToastContext = createContext(null);

// הודעות קצרות שמופיעות בפינת המסך ונעלמות לבד
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  // type: 'success' | 'error'
  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3200);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className="toasts" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>
            {t.type === 'success' ? <CircleCheck size={18} /> : <CircleAlert size={18} />}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
