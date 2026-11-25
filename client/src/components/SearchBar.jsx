import { Search } from 'lucide-react';

// search = { by: 'title' | 'id', text: '...' }
export default function SearchBar({ search, onChange, placeholder = 'חיפוש...' }) {
  return (
    <div className="search-bar">
      <Search size={18} className="search-icon" />
      <input
        type="search"
        placeholder={placeholder}
        value={search.text}
        onChange={(e) => onChange({ ...search, text: e.target.value })}
      />
      <select value={search.by} onChange={(e) => onChange({ ...search, by: e.target.value })}
        aria-label="חיפוש לפי">
        <option value="title">לפי כותרת</option>
        <option value="id">לפי מזהה</option>
      </select>
    </div>
  );
}
