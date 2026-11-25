import { useOutlet, useNavigate, useLocation } from 'react-router-dom';
import { ListChecks } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import useCrud from '../../../hooks/useCrud';
import useUrlState from '../../../hooks/useUrlState';
import { apiPost } from '../../../api';
import EmptyState from '../../../components/EmptyState';
import NewListMenu from './NewListMenu';
import ListCard from './ListCard';
import '../../../css/todos.css';

// סינון רשימות לפי מצב השלמה - לפי המונים שעל הרשימה, בלי לטעון משימות
const LIST_FILTERS = [
  { value: 'all', label: 'הכול', test: () => true },
  { value: 'done', label: 'הושלמו', test: (l) => l.todosCount > 0 && l.doneCount === l.todosCount },
  { value: 'partial', label: 'בתהליך', test: (l) => l.doneCount > 0 && l.doneCount < l.todosCount },
  { value: 'none', label: 'לא התחילו', test: (l) => l.doneCount === 0 },
];

export default function TodosScreen() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const lists = useCrud('lists', { userId: currentUser.id });
  const [url, setUrl] = useUrlState({ lists: 'all' });

  const outlet = useOutlet({ lists: lists.items, updateList: lists.update });

  async function createList(template, title) {
    const list = await lists.add({
      userId: currentUser.id, title, type: template.type,
      todosCount: template.items.length, doneCount: 0,
    });
    await Promise.all(
      template.items.map((itemTitle) =>
        apiPost('todos', { userId: currentUser.id, listId: list.id, title: itemTitle, completed: false })
      )
    );
    navigate(`/${currentUser.username}/lists/${list.id}`);
  }

  async function removeList(id) {
    await lists.remove(id); // השרת מוחק גם את כל המשימות של הרשימה
    if (pathname.endsWith(`/lists/${id}`)) navigate(`/${currentUser.username}/lists`);
  }

  const filterTest = LIST_FILTERS.find((f) => f.value === url.lists).test;
  const visibleLists = lists.items.filter(filterTest);

  return (
    <div className="todos-screen">
      <aside className="lists-panel">
        <div className="lists-header">
          <h2>הרשימות שלי</h2>
          <NewListMenu onCreate={createList} />
        </div>

        <div className="chips" role="group" aria-label="סינון רשימות">
          {LIST_FILTERS.map((f) => (
            <button key={f.value} className={url.lists === f.value ? 'chip active' : 'chip'}
              onClick={() => setUrl({ lists: f.value })}>
              {f.label}
            </button>
          ))}
        </div>

        {lists.loading ? null : lists.error ? (
          <p className="error-box">{lists.error}</p>
        ) : visibleLists.length === 0 ? (
          <EmptyState icon={ListChecks}
            title={lists.items.length ? 'אין רשימות במצב הזה' : 'עדיין אין רשימות'}
            text={lists.items.length ? '' : 'צרו רשימה חדשה מתבנית או רשימה ריקה'} />
        ) : (
          <ul className="lists">
            {visibleLists.map((list) => (
              <ListCard key={list.id} list={list} onUpdate={lists.update} onRemove={removeList} />
            ))}
          </ul>
        )}
      </aside>

      <section className="list-area">
        {outlet ?? (
          <EmptyState icon={ListChecks} title="בחרו רשימה"
            text="המשימות של הרשימה ייטענו רק אחרי שתבחרו אותה" />
        )}
      </section>
    </div>
  );
}
