import { useEffect } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { ListChecks, SearchX } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import useCrud from '../../../hooks/useCrud';
import useUrlState from '../../../hooks/useUrlState';
import Form from '../../../components/Form';
import SearchBar from '../../../components/SearchBar';
import EmptyState from '../../../components/EmptyState';
import { matchesSearch } from '../../../utils/searchUtils';
import ProgressBar from './ProgressBar';
import TodoItem from './TodoItem';
import { todoFields, todoValidations } from './todoForms';

// סינון לפי מצב ביצוע
const STATUS_FILTERS = [
  { value: 'all', label: 'הכול', test: () => true },
  { value: 'open', label: 'פתוחות', test: (todo) => !todo.completed },
  { value: 'done', label: 'הושלמו', test: (todo) => todo.completed },
];

// פונקציות השוואה למיון
const SORTS = {
  id: (a, b) => Number(a.id) - Number(b.id),
  title: (a, b) => a.title.localeCompare(b.title, 'he'),
  completed: (a, b) => Number(a.completed) - Number(b.completed),
};

// key לפי הרשימה - מעבר לרשימה אחרת מתחיל רכיב חדש, בלי משימות של הרשימה הקודמת
export default function ListView() {
  const { listId } = useParams();
  return <ListContent key={listId} listId={listId} />;
}

function ListContent({ listId }) {
  const { currentUser } = useAuth();
  const { lists, updateList } = useOutletContext();
  // הרשימה נלקחת מהרשימות של המשתמשת - רשימה של מישהי אחרת לא תימצא
  const list = lists.find((l) => String(l.id) === listId);

  // רק המשימות של הרשימה הזו, ורק אחרי שהרשימה נמצאה
  const todos = useCrud('todos', { userId: currentUser.id, listId }, Boolean(list));
  const [url, setUrl] = useUrlState({ by: 'title', q: '', status: 'all', sort: 'id' });

  // המונים על הרשימה מתעדכנים לפי המשימות עצמן - אחרי כל הוספה, מחיקה או סימון.
  // כך הם תמיד נכונים, גם אם משהו התפספס קודם
  useEffect(() => {
    if (!list || todos.loading || todos.error) return;
    const total = todos.items.length;
    const done = todos.items.filter((t) => t.completed).length;
    if (total !== list.todosCount || done !== list.doneCount) {
      updateList(list.id, { todosCount: total, doneCount: done }).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todos.items, todos.loading]);

  if (!list) {
    return <EmptyState icon={ListChecks} title="הרשימה לא נמצאה" text="ייתכן שהיא נמחקה" />;
  }

  function handleAdd(values) {
    return todos.add({ userId: currentUser.id, listId: list.id, title: values.title.trim(), completed: false });
  }

  // המשימות שמוצגות בפועל - אחרי חיפוש, סינון ומיון
  const search = { by: url.by, text: url.q };
  const statusTest = STATUS_FILTERS.find((f) => f.value === url.status).test;
  const visibleTodos = todos.items
    .filter((todo) => matchesSearch(todo, search) && statusTest(todo))
    .sort(SORTS[url.sort]);

  return (
    <div className="list-view">
      <header className="list-view-header">
        <h2><span className="muted">#{list.id}</span> {list.title}</h2>
        <ProgressBar done={list.doneCount} total={list.todosCount} large />
      </header>

      <div className="toolbar">
        <SearchBar search={search} onChange={(s) => setUrl({ by: s.by, q: s.text })} placeholder="חיפוש משימה..." />
        <div className="chips" role="group" aria-label="סינון לפי ביצוע">
          {STATUS_FILTERS.map((f) => (
            <button key={f.value} className={url.status === f.value ? 'chip active' : 'chip'}
              onClick={() => setUrl({ status: f.value })}>
              {f.label}
            </button>
          ))}
        </div>
        <label className="sort">
          מיון
          <select value={url.sort} onChange={(e) => setUrl({ sort: e.target.value })}>
            <option value="id">מזהה</option>
            <option value="title">א״ב</option>
            <option value="completed">מצב ביצוע</option>
          </select>
        </label>
      </div>

      <div className="add-todo">
        <Form fields={todoFields} validations={todoValidations} onSubmit={handleAdd} submitText="הוספה" inline />
      </div>

      {todos.loading ? null : todos.error ? (
        <p className="error-box">{todos.error}</p>
      ) : visibleTodos.length === 0 ? (
        <EmptyState icon={todos.items.length ? SearchX : ListChecks}
          title={todos.items.length ? 'אין משימות שמתאימות' : 'הרשימה ריקה'}
          text={todos.items.length ? 'נסו לשנות את החיפוש או הסינון' : 'הוסיפו משימה ראשונה בשדה למעלה'} />
      ) : (
        <ul className="todo-list">
          {visibleTodos.map((todo) => (
            <TodoItem key={todo.id} todo={todo} onUpdate={todos.update} onRemove={todos.remove} />
          ))}
        </ul>
      )}
    </div>
  );
}
