import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export default function Modal({ title, onClose, children, className = '' }) {
  const backdrop = useRef(null);

  useEffect(() => {
    function handleKey(e) {
      const all = document.querySelectorAll('.modal-backdrop');
      if (e.key === 'Escape' && all[all.length - 1] === backdrop.current) onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return createPortal(
    <div className="modal-backdrop" onClick={onClose} ref={backdrop}>
      <div className={`modal ${className}`} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <header className="modal-header">
          {title && <h2>{title}</h2>}
          <button className="icon-btn" onClick={onClose} aria-label="סגירה"><X size={20} /></button>
        </header>
        {children}
      </div>
    </div>,
    document.body
  );
}
