import { useEffect, useState } from 'react';
import { useParams, useOutletContext, useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Pencil, Trash2, ImageUp, CalendarDays, ExternalLink } from 'lucide-react';
import useCrud from '../../../hooks/useCrud';
import Modal from '../../../components/Modal';
import StarRating from '../../../components/StarRating';
import { formatDate, sizedImage } from '../../../utils/format';
import { thumbSrc } from './PhotoItem';

// גובה הקובץ בתצוגה המלאה
const FULL_HEIGHT = 1200;

// תצוגה מלאה של תמונה: /albums/5/photos/123
export default function Lightbox() {
  const { photoId } = useParams();
  const { photos, album, actions, search } = useOutletContext();
  const navigate = useNavigate();

  const index = photos.items.findIndex((p) => String(p.id) === photoId);
  // מביאים רק אותה, ורק אם היא שייכת לאלבום הזה
  const single = useCrud('photos', { id: photoId, albumId: album.id }, index === -1);
  const photo = index === -1 ? single.items[0] : photos.items[index];

  const prev = index > 0 ? photos.items[index - 1] : null;
  const next = index !== -1 ? photos.items[index + 1] : null;

  // איזה קובץ גדול כבר הגיע. עד שהוא מגיע רואים מתחתיו את התמונה הקטנה מהגריד (כבר ב-Cache)
  const [loadedSrc, setLoadedSrc] = useState(null);

  const goTo = (p) => navigate(`../${p.id}${search}`, { replace: true });
  const close = () => navigate(`..${search}`);

  // מתקרבים לסוף מה שנטען - מבקשים כבר את העמוד הבא
  useEffect(() => {
    if (index !== -1 && index >= photos.items.length - 3 && photos.hasMore) photos.loadMore();
  }, [index, photos.items.length]);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'ArrowLeft' && next) goTo(next);
      if (e.key === 'ArrowRight' && prev) goTo(prev);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  });

  if (!photo) {
    if (single.loading) return null;
    return (
      <Modal title="התמונה לא נמצאה" onClose={close}>
        <p>ייתכן שהיא נמחקה או שאינה שייכת לאלבום הזה.</p>
      </Modal>
    );
  }

  const fullSrc = sizedImage(photo.url, FULL_HEIGHT);

  function handleRemove() {
    // אחרי מחיקה עוברים לתמונה הבאה, ואם אין - סוגרים
    actions.remove(photo);
    if (next) goTo(next);
    else if (prev) goTo(prev);
    else close();
  }

  return (
    <Modal onClose={close} className="lightbox">
      <div className="lightbox-body">
        <div className="lightbox-stage">
          {prev && (
            <button className="nav-arrow right" onClick={() => goTo(prev)} aria-label="התמונה הקודמת">
              <ChevronRight size={28} />
            </button>
          )}
          {/* שתי שכבות: מתחת - הקטנה מהגריד, שמופיעה מיד. מעל - הגדולה, שנחשפת כשהיא מגיעה */}
          <img key={`thumb-${photo.id}`} src={thumbSrc(photo.url)} alt="" />
          <img key={photo.id} src={fullSrc} alt={photo.title} onLoad={() => setLoadedSrc(fullSrc)}
            className={loadedSrc === fullSrc ? 'full loaded' : 'full'} />
          {next && (
            <button className="nav-arrow left" onClick={() => goTo(next)} aria-label="התמונה הבאה">
              <ChevronLeft size={28} />
            </button>
          )}
        </div>

        <aside className="lightbox-panel">
          <p className="muted">#{photo.id} · {album.title}</p>
          <h2>{photo.title}</h2>
          {index !== -1 && <p className="muted">תמונה {index + 1} מתוך {photos.total}</p>}

          <dl className="details">
            <dt><CalendarDays size={16} /> תאריך צילום</dt>
            <dd>{formatDate(photo.takenAt)}</dd>
            <dt>דירוג</dt>
            <dd><StarRating value={photo.rating} onChange={(r) => actions.rate(photo, r)} size={22} /></dd>
          </dl>

          <div className="lightbox-actions">
            <button className="btn soft" onClick={() => actions.edit(photo)}><Pencil size={16} /> עריכה</button>
            {photo.url !== album.coverUrl && (
              <button className="btn soft" onClick={() => actions.setCover(photo)}><ImageUp size={16} /> קביעה ככריכה</button>
            )}
            <a className="btn soft" href={photo.url} target="_blank" rel="noreferrer"><ExternalLink size={16} /> מקור</a>
            <button className="btn danger" onClick={handleRemove}><Trash2 size={16} /> מחיקה</button>
          </div>
        </aside>
      </div>
    </Modal>
  );
}
