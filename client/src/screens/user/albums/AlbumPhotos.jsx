import { useState, useEffect } from 'react';
import { useParams, Link, Outlet, useLocation } from 'react-router-dom';
import { ArrowRight, Plus, Images, MapPin, ZoomIn, ZoomOut, SearchX } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import useCrud from '../../../hooks/useCrud';
import usePaged from '../../../hooks/usePaged';
import useUrlState from '../../../hooks/useUrlState';
import useDebounce from '../../../hooks/useDebounce';
import useAction from '../../../hooks/useAction';
import Form from '../../../components/Form';
import Modal from '../../../components/Modal';
import EmptyState from '../../../components/EmptyState';
import { searchToParams } from '../../../utils/searchUtils';
import { sizedImage } from '../../../utils/format';
import { photoFields, photoValidations, photoFromForm } from './albumForms';
import PhotoItem from './PhotoItem';
import PhotoFilters, { SORTS, DEFAULT_FILTERS } from './PhotoFilters';
import '../../../css/albums.css';

const PAGE_SIZE = 8;

export default function AlbumPhotos() {
  const { albumId } = useParams();
  const { currentUser } = useAuth();
  const { search } = useLocation();
  const run = useAction();

  const albums = useCrud('albums', { userId: currentUser.id });
  const album = albums.items.find((a) => String(a.id) === albumId);

  const [filters, setFilters] = useUrlState(DEFAULT_FILTERS);
  const query = useDebounce(filters.q);
  const filtersActive = query !== '' || filters.minRating !== '0';
  const sort = SORTS[filters.sort];

  // כל הסינון והמיון נעשים בשרת, כי התמונות נטענות בעמודים
  const photos = usePaged('photos', {
    albumId,
    ...searchToParams({ by: 'title', text: query }),
    ...(filters.minRating !== '0' && { rating_gte: filters.minRating }),
    _sort: sort.sort,
    _order: sort.order,
  }, PAGE_SIZE, Boolean(album));

  const [editing, setEditing] = useState(null);

  // מזהי התמונות שהקובץ שלהן כבר הגיע לדפדפן (או נכשל)
  const [ready, setReady] = useState(() => new Set());
  function markReady(id) {
    setReady((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
  }

  // המונה של האלבום מתקן את עצמו: בלי סינון, השרת יודע כמה תמונות יש באמת
  useEffect(() => {
    if (album && !filtersActive && photos.total !== null && photos.total !== album.photosCount) {
      albums.update(album.id, { photosCount: photos.total }).catch(() => {});
    }
  }, [photos.total]);

  if (albums.loading) return null;
  if (albums.error) return <p className="error-box">{albums.error}</p>;
  if (!album) {
    return (
      <EmptyState icon={Images} title="האלבום לא נמצא" text="ייתכן שהוא נמחק או שאינו שייך לך">
        <Link to={`/${currentUser.username}/albums`} className="btn soft">חזרה לאלבומים</Link>
      </EmptyState>
    );
  }

  async function handleSave(values) {
    const data = photoFromForm(values);
    if (editing === 'new') {
      const created = await photos.add({ albumId: album.id, ...data, thumbnailUrl: sizedImage(data.url, 300) });
      markReady(created.id);
      // תמונה ראשונה באלבום הופכת לכריכה
      await albums.update(album.id, {
        photosCount: album.photosCount + 1,
        ...(!album.coverUrl && { coverUrl: data.url }),
      });
    } else {
      await photos.update(editing.id, data);
      if (album.coverUrl === editing.url && data.url !== editing.url) {
        await albums.update(album.id, { coverUrl: data.url });
      }
    }
    setEditing(null);
  }

  // פעולות על תמונה - משותפות לגריד ולתצוגה המלאה
  const actions = {
    edit: (photo) => setEditing(photo),
    rate: (photo, rating) => run(() => photos.update(photo.id, { rating })),
    setCover: (photo) => run(() => albums.update(album.id, { coverUrl: photo.url }), 'הכריכה עודכנה'),
    remove: (photo) =>
      run(async () => {
        await photos.remove(photo.id);
        // אם נמחקה הכריכה - התמונה הבאה ברשימה תהיה הכריכה
        const nextCover = photos.items.find((p) => p.id !== photo.id)?.url ?? '';
        await albums.update(album.id, {
          photosCount: Math.max(0, album.photosCount - 1),
          ...(album.coverUrl === photo.url && { coverUrl: nextCover }),
        });
      }, 'התמונה נמחקה'),
  };

  const rowHeight = Number(filters.size);

  // תמונה מוצגת רק כשהיא וכל מה שלפניה כבר נטענו - כך התמונות מתווספות לסוף לפי הסדר, בלי חורים וקפיצות
  const firstPending = photos.items.findIndex((p) => !ready.has(p.id));
  const shownCount = firstPending === -1 ? photos.items.length : firstPending;
  // מחכים לשרת או לקבצי תמונות - בינתיים לא מבקשים עמוד נוסף
  const waiting = photos.loading || shownCount < photos.items.length;

  return (
    <div className="album-photos">
      <header className="album-header">
        <Link to={`/${currentUser.username}/albums`} className="back-link">
          <ArrowRight size={18} /> כל האלבומים
        </Link>
        <div className="album-title-row">
          <div>
            <h2>{album.title}</h2>
            <p className="album-meta">
              {album.region && <><MapPin size={14} /> {album.region} · </>}
              {album.photosCount} תמונות · אלבום #{album.id}
            </p>
            {album.description && <p className="album-desc">{album.description}</p>}
          </div>
          <button className="btn primary" onClick={() => setEditing('new')}>
            <Plus size={18} /> תמונה חדשה
          </button>
        </div>
      </header>

      <div className="photos-toolbar">
        <PhotoFilters filters={filters} onChange={setFilters} />
        <label className="zoom" title="גודל התמונות">
          <ZoomOut size={18} />
          <input type="range" min="200" max="400" step="20" value={rowHeight}
            onChange={(e) => setFilters({ size: e.target.value })} aria-label="גודל התמונות" />
          <ZoomIn size={18} />
        </label>
      </div>

      {photos.error && <p className="error-box">{photos.error}</p>}

      {photos.items.length === 0 && !photos.loading && !photos.error ? (
        filtersActive ? (
          <EmptyState icon={SearchX} title="לא נמצאו תמונות" text="אין תמונות שמתאימות לחיפוש ולסינון">
            <button className="btn soft" onClick={() => setFilters({ q: '', minRating: '0' })}>ניקוי סינון</button>
          </EmptyState>
        ) : (
          <EmptyState icon={Images} title="האלבום עדיין ריק" text="הוסיפו את התמונה הראשונה מהטיול">
            <button className="btn primary" onClick={() => setEditing('new')}><Plus size={18} /> תמונה חדשה</button>
          </EmptyState>
        )
      ) : (
        <>
          <ul className="photo-grid" style={{ '--row-h': `${rowHeight}px` }}>
            {photos.items.map((photo, i) => (
              <PhotoItem key={photo.id} photo={photo} search={search}
                shown={i < shownCount} onReady={() => markReady(photo.id)}
                isCover={photo.url === album.coverUrl} actions={actions} />
            ))}
          </ul>
          {/* החיישן מחובר רק כשכל התמונות כבר מוצגות: כשמגיעים אליו נטען העמוד הבא */}
          <div ref={waiting ? null : photos.sentinelRef} className="list-end">
            {!waiting && !photos.hasMore && `זה הכול – ${photos.total} תמונות`}
          </div>
        </>
      )}

      {/* תצוגה מלאה של תמונה (Lightbox) - נתיב בן */}
      <Outlet context={{ photos, album, actions, search }} />

      {/* אחרי ה-Lightbox - כדי שחלון העריכה יופיע מעליו */}
      {editing && (
        <Modal title={editing === 'new' ? 'תמונה חדשה' : 'עריכת תמונה'} onClose={() => setEditing(null)}>
          <Form fields={photoFields} validations={photoValidations}
            initialValues={editing === 'new' ? { rating: 0, takenAt: new Date().toISOString().slice(0, 10) } : editing}
            onSubmit={handleSave} submitText={editing === 'new' ? 'הוספה' : 'שמירה'}
            successMessage={editing === 'new' ? 'התמונה נוספה' : 'התמונה עודכנה'}
            onCancel={() => setEditing(null)} />
        </Modal>
      )}

    </div>
  );
}
