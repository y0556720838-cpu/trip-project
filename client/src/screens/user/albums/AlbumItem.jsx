import { Link } from 'react-router-dom';
import { Images, Pencil, Trash2, MapPin } from 'lucide-react';
import useAction from '../../../hooks/useAction';
import { sizedImage } from '../../../utils/format';

// כרטיס אלבום: כריכה, מספר תמונות, מזהה וכותרת. לחיצה פותחת את התמונות של האלבום
export default function AlbumItem({ album, onEdit, onRemove }) {
  const run = useAction();

  return (
    <li className="album-card">
      <Link to={`${album.id}/photos`} className="album-link">
        <div className="album-cover">
          {album.coverUrl ? (
            <img src={sizedImage(album.coverUrl, 400)} alt="" loading="lazy" />
          ) : (
            <div className="cover-placeholder"><Images size={40} strokeWidth={1.3} /></div>
          )}
          <span className="badge"><Images size={14} /> {album.photosCount} תמונות</span>
          <span className="badge id">#{album.id}</span>
        </div>
        <div className="album-body">
          <h3>{album.title}</h3>
          {album.region && <p className="album-region"><MapPin size={14} /> {album.region}</p>}
          {album.description && <p className="album-desc">{album.description}</p>}
        </div>
      </Link>
      <div className="card-actions">
        <button className="icon-btn" onClick={() => onEdit(album)} aria-label="עריכה"><Pencil size={17} /></button>
        {/* השרת מוחק גם את כל התמונות של האלבום */}
        <button className="icon-btn danger" onClick={() => run(() => onRemove(album.id), 'האלבום נמחק')}
          aria-label="מחיקה"><Trash2 size={17} /></button>
      </div>
    </li>
  );
}
