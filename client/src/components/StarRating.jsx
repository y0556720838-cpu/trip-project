import { Star } from 'lucide-react';

export default function StarRating({ value, onChange, size = 16 }) {
  return (
    <div className="stars editable" aria-label={`דירוג ${value} מתוך 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n === value ? 0 : n)} aria-label={`${n} כוכבים`}>
          <Star size={size} className={n <= value ? 'on' : ''} />
        </button>
      ))}
    </div>
  );
}