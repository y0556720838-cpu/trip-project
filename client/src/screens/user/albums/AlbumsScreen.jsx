import { useState } from 'react';
import { Plus, Images } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import useCrud from '../../../hooks/useCrud';
import useUrlState from '../../../hooks/useUrlState';
import Form from '../../../components/Form';
import Modal from '../../../components/Modal';
import SearchBar from '../../../components/SearchBar';
import EmptyState from '../../../components/EmptyState';
import { matchesSearch } from '../../../utils/searchUtils';
import { albumFields, albumValidations, albumFromForm } from './albumForms';
import AlbumItem from './AlbumItem';
import '../../../css/albums.css';

export default function AlbumsScreen() {
  const { currentUser } = useAuth();
  // רק פרטי האלבומים עצמם (כולל כריכה ומספר תמונות). התמונות נטענות רק בכניסה לאלבום
  const albums = useCrud('albums', { userId: currentUser.id });
  const [url, setUrl] = useUrlState({ by: 'title', q: '' });
  const [editing, setEditing] = useState(null);

  async function handleSave(values) {
    const data = albumFromForm(values);
    if (editing === 'new') {
      await albums.add({ userId: currentUser.id, ...data, coverUrl: '', photosCount: 0 });
    } else {
      await albums.update(editing.id, data);
    }
    setEditing(null);
  }

  const search = { by: url.by, text: url.q };
  const visibleAlbums = albums.items.filter((album) => matchesSearch(album, search));

  return (
    <div className="albums-screen">
      <div className="toolbar">
        <SearchBar search={search} onChange={(s) => setUrl({ by: s.by, q: s.text })}
          placeholder="חיפוש באלבומים..." />
        <button className="btn primary" onClick={() => setEditing('new')}>
          <Plus size={18} /> אלבום חדש
        </button>
      </div>

      {albums.loading ? null : albums.error ? (
        <p className="error-box">{albums.error}</p>
      ) : visibleAlbums.length === 0 ? (
        <EmptyState icon={Images}
          title={albums.items.length ? 'לא נמצאו אלבומים' : 'עדיין אין אלבומים'}
          text={albums.items.length ? 'נסו לחפש משהו אחר' : 'צרו אלבום ראשון לתמונות מהטיול הבא'} />
      ) : (
        <ul className="albums-grid">
          {visibleAlbums.map((album) => (
            <AlbumItem key={album.id} album={album} onEdit={setEditing} onRemove={albums.remove} />
          ))}
        </ul>
      )}

      {editing && (
        <Modal title={editing === 'new' ? 'אלבום חדש' : 'עריכת אלבום'} onClose={() => setEditing(null)}>
          <Form fields={albumFields} validations={albumValidations}
            initialValues={editing === 'new' ? {} : editing}
            onSubmit={handleSave} submitText={editing === 'new' ? 'יצירת אלבום' : 'שמירה'}
            successMessage={editing === 'new' ? 'האלבום נוצר' : 'האלבום עודכן'}
            onCancel={() => setEditing(null)} />
        </Modal>
      )}
    </div>
  );
}