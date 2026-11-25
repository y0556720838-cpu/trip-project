import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, MapPin, CalendarDays, Mail, Phone, Compass } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import useCrud from '../../hooks/useCrud';
import { apiCount, apiPatch } from '../../api';
import Modal from '../../components/Modal';
import Form from '../../components/Form';
import { timeSince, formatDate } from '../../utils/format';
import { profileFields, profileValidations, profileFromForm, profileToForm } from '../profileForm';
import '../../css/info.css';

// המידע האישי - חלון שמופיע מעל העמוד
export default function Info() {
  const { currentUser, updateUser } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);

  //   אלבומים ורשימות - אותן שאילתות כמו במסכים עצמם, ולכן לרוב מגיעות מ-הקאש 
  // מהן מחושבים מספר התמונות ואחוז המשימות שהושלמו, בלי להביא תמונות ומשימות
  const albums = useCrud('albums', { userId: currentUser.id });
  const lists = useCrud('lists', { userId: currentUser.id });

  // פוסטים ותגובות - רק ספירה (X-Total-Count), בלי להביא את התוכן
  const [counts, setCounts] = useState(null);
  useEffect(() => {
    Promise.all([
      apiCount('posts', { userId: currentUser.id }),
      apiCount('comments', { userId: currentUser.id }),
    ])
      .then(([posts, comments]) => setCounts({ posts, comments }))
      .catch(() => setCounts({ posts: '–', comments: '–' }));
  }, [currentUser.id]);

  const close = () => navigate('..');

  async function handleSave(values) {
    const updated = await apiPatch(`users/${currentUser.id}`, profileFromForm(values, currentUser));
    updateUser(updated);
    setEditing(false);
  }

  const ready = counts && !albums.loading && !lists.loading;
  const totalTodos = lists.items.reduce((sum, l) => sum + l.todosCount, 0);
  const doneTodos = lists.items.reduce((sum, l) => sum + l.doneCount, 0);
  const stats = [
    { label: 'פוסטים', value: counts?.posts },
    { label: 'אלבומים', value: albums.items.length },
    { label: 'תמונות', value: albums.items.reduce((sum, a) => sum + a.photosCount, 0) },
    { label: 'רשימות', value: lists.items.length },
    { label: 'משימות שהושלמו', value: totalTodos ? `${Math.round((doneTodos / totalTodos) * 100)}%` : '–' },
    { label: 'תגובות שכתבתי', value: counts?.comments },
  ];

  return (
    <Modal title={editing ? 'עריכת פרטים' : null} onClose={close} className="info-modal">
      {editing ? (
        <Form fields={profileFields} validations={profileValidations} initialValues={profileToForm(currentUser)}
          onSubmit={handleSave} submitText="שמירה" successMessage="הפרטים עודכנו"
          onCancel={() => setEditing(false)} />
      ) : (
        <div className="profile">
          <header className="profile-header">
            <div>
              <h2>{currentUser.name}</h2>
              <p className="muted">@{currentUser.username}</p>
            </div>
            <button className="btn soft small" onClick={() => setEditing(true)}><Pencil size={15} /> עריכה</button>
          </header>

          <ul className="profile-details">
            {currentUser.address?.city && <li><MapPin size={16} /> {currentUser.address.city}</li>}
            <li><Mail size={16} /> {currentUser.email}</li>
            <li><Phone size={16} /> {currentUser.phone}</li>
            {currentUser.joinedAt && (
              <li title={formatDate(currentUser.joinedAt)}>
                <CalendarDays size={16} /> ב-NMD כבר {timeSince(currentUser.joinedAt)}
              </li>
            )}
          </ul>

          {currentUser.travelStyle && (
            <p className="travel-style"><Compass size={18} /> {currentUser.travelStyle}</p>
          )}

          {currentUser.preferences?.length > 0 && (
            <section>
              <h3>העדפות טיול</h3>
              <div className="tags">{currentUser.preferences.map((p) => <span key={p} className="tag">{p}</span>)}</div>
            </section>
          )}
          {currentUser.interests?.length > 0 && (
            <section>
              <h3>תחומי עניין</h3>
              <div className="tags">{currentUser.interests.map((i) => <span key={i} className="tag light">{i}</span>)}</div>
            </section>
          )}

          <section>
            <h3>הפעילות שלי</h3>
            <div className="stats">
              {stats.map((s) => (
                <div key={s.label} className="stat">
                  <strong>{ready ? s.value : '…'}</strong>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </Modal>
  );
}