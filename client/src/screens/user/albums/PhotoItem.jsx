import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Trash2, ImageUp, ImageOff } from 'lucide-react';
import StarRating from '../../../components/StarRating';
import { sizedImage } from '../../../utils/format';

// הקובץ שמוצג בגריד - גובה אחד שמספיק לכל גדלי התצוגה, כדי שהדפדפן ישמור אותו ב-Cache פעם אחת
export const thumbSrc = (url) => sizedImage(url, 500);

export default function PhotoItem({ photo, search, isCover, actions, shown, onReady }) {
  const src = thumbSrc(photo.url);
  // שומרים איזה קישור נכשל - אם הקישור יוחלף בעריכה, התמונה תנסה להיטען שוב
  const [brokenSrc, setBrokenSrc] = useState(null);
  const broken = brokenSrc === src;

  return (
    <li className={`photo-tile${shown ? '' : ' pending'}${broken ? ' broken' : ''}`}>
      <Link to={`${photo.id}${search}`} className="photo-link">
        {broken ? (
          <ImageOff size={34} strokeWidth={1.4} aria-label="התמונה לא נטענה" />
        ) : (
          <img src={src} alt={photo.title} onLoad={onReady}
            onError={() => { setBrokenSrc(src); onReady(); }} />
        )}
      </Link>
      {/* מחוץ לקישור - כדי שלחיצה על כוכב תשנה דירוג ולא תפתח את התמונה */}
      <div className="photo-caption">
        <span>{photo.title}</span>
        <StarRating value={photo.rating || 0} onChange={(r) => actions.rate(photo, r)} size={14} />
      </div>
      <div className="photo-actions">
        <button className="icon-btn" onClick={() => actions.edit(photo)} aria-label="עריכה" title="עריכה">
          <Pencil size={15} />
        </button>
        {!isCover && (
          <button className="icon-btn" onClick={() => actions.setCover(photo)} aria-label="קביעה ככריכה" title="קביעה ככריכה">
            <ImageUp size={15} />
          </button>
        )}
        <button className="icon-btn danger" onClick={() => actions.remove(photo)} aria-label="מחיקה" title="מחיקה">
          <Trash2 size={15} />
        </button>
      </div>
      {isCover && <span className="cover-tag">כריכה</span>}
    </li>
  );
}
