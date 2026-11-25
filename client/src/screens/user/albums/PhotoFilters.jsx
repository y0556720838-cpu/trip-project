import { Search, Star } from 'lucide-react';

// אפשרויות המיון - מה שנשלח לשרת (_sort, _order)
export const SORTS = {
  new: { label: 'מהחדש לישן', sort: 'takenAt,id', order: 'desc,desc' },
  old: { label: 'מהישן לחדש', sort: 'takenAt,id', order: 'asc,asc' },
  rating: { label: 'הדירוג הגבוה', sort: 'rating,takenAt', order: 'desc,desc' },
};

// ערכי ברירת המחדל של הסינון (נשמרים בכתובת רק כשהם שונים מאלה)
export const DEFAULT_FILTERS = { q: '', sort: 'new', minRating: '0', size: '280' };

const RATINGS = [
  { value: '0', label: 'הכול' },
  { value: '3', label: 'מ-3' },
  { value: '4', label: 'מ-4' },
  { value: '5', label: '5 בלבד' },
];

export default function PhotoFilters({ filters, onChange }) {
  return (
    <div className="photo-filters">
      <div className="search-bar">
        <Search size={18} className="search-icon" />
        <input type="search" placeholder="חיפוש לפי כותרת..." value={filters.q}
          onChange={(e) => onChange({ q: e.target.value })} />
      </div>

      <select value={filters.sort} onChange={(e) => onChange({ sort: e.target.value })} aria-label="מיון">
        {Object.entries(SORTS).map(([key, s]) => <option key={key} value={key}>{s.label}</option>)}
      </select>

      <div className="chips" role="group" aria-label="סינון לפי דירוג">
        <Star size={16} className="chips-icon" />
        {RATINGS.map((r) => (
          <button key={r.value} type="button"
            className={filters.minRating === r.value ? 'chip active' : 'chip'}
            onClick={() => onChange({ minRating: r.value })}>
            {r.label}
          </button>
        ))}
      </div>
    </div>
  );
}
