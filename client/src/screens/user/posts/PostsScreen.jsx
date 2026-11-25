import { useState } from 'react';
import { NavLink, useOutlet, useNavigate } from 'react-router-dom';
import { Plus, MessageCircle, BookOpen } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import usePaged from '../../../hooks/usePaged';
import useUrlState from '../../../hooks/useUrlState';
import useDebounce from '../../../hooks/useDebounce';
import Form from '../../../components/Form';
import Modal from '../../../components/Modal';
import SearchBar from '../../../components/SearchBar';
import EmptyState from '../../../components/EmptyState';
import { searchToParams } from '../../../utils/searchUtils';
import { postFields, postValidations, postFromForm } from './postForms';
import PostItem from './PostItem';
import '../../../css/posts.css';

const PAGE_SIZE = 8;

// mine - רק הפוסטים של המשתמשת המחוברת. בלי mine - הפוסטים של כולם (AllPosts)
export default function PostsScreen({ mine }) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [url, setUrl] = useUrlState({ by: 'title', q: '' });
  const query = useDebounce(url.q);

  // הפוסטים נטענים בעמודים, מהחדש לישן. החיפוש נעשה בשרת
  const posts = usePaged('posts', {
    ...(mine && { userId: currentUser.id }),
    ...searchToParams({ by: url.by, text: query }),
    _sort: 'createdAt',
    _order: 'desc',
  }, PAGE_SIZE);

  const [adding, setAdding] = useState(false);

  // שם הכותבת והעיר נשמרים על הפוסט עצמו, כמו בתגובות.
  // כך לא צריך להביא את המשתמשים (והפרטים האישיים שלהם) כדי להציג מי כתבה
  async function handleAdd(values) {
    const post = await posts.add({
      userId: currentUser.id,
      authorName: currentUser.name,
      authorCity: currentUser.address?.city ?? '',
      ...postFromForm(values),
      createdAt: new Date().toISOString(),
    });
    setAdding(false);
    navigate(String(post.id));
  }

  // הפוסט שנבחר (נתיב בן). אם לא נבחר - useOutlet מחזיר null
  const outlet = useOutlet({ posts, mine });

  return (
    <div className="posts-screen">
      <div className="toolbar">
        <nav className="tabs">
          <NavLink to="../posts">הפוסטים שלי</NavLink>
          <NavLink to="../all-posts">כל הפוסטים</NavLink>
        </nav>
        <SearchBar search={{ by: url.by, text: url.q }} onChange={(s) => setUrl({ by: s.by, q: s.text })}
          placeholder="חיפוש פוסטים..." />
        <button className="btn primary" onClick={() => setAdding(true)}>
          <Plus size={18} /> פוסט חדש
        </button>
      </div>

      <div className="posts-layout">
        <div className="post-list-col">
          {posts.items.length === 0 && posts.loading ? null : posts.error ? (
            <p className="error-box">{posts.error}</p>
          ) : posts.items.length === 0 ? (
            <EmptyState icon={MessageCircle}
              title={query ? 'לא נמצאו פוסטים' : 'עדיין אין פוסטים'}
              text={query ? 'נסו לחפש משהו אחר' : 'שתפו את החוויה מהטיול האחרון'} />
          ) : (
            <>
              <ul className="post-list">
                {posts.items.map((post) => (
                  <PostItem key={post.id} post={post} />
                ))}
              </ul>
              {/* החיישן: כשמגיעים אליו נטען העמוד הבא */}
              <div ref={posts.sentinelRef} className="list-end">
                {!posts.loading && !posts.hasMore && 'אין עוד פוסטים'}
              </div>
            </>
          )}
        </div>

        <div className="reading-pane">
          {outlet ?? <EmptyState icon={BookOpen} title="בחרו פוסט לקריאה" text="הפוסט המלא והתגובות יוצגו כאן" />}
        </div>
      </div>

      {adding && (
        <Modal title="פוסט חדש" onClose={() => setAdding(false)} className="wide">
          <Form fields={postFields} validations={postValidations} onSubmit={handleAdd}
            submitText="פרסום" successMessage="הפוסט פורסם" onCancel={() => setAdding(false)} />
        </Modal>
      )}
    </div>
  );
}