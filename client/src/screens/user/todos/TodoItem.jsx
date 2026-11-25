import { useState } from 'react';
import { Check, Pencil, Trash2 } from 'lucide-react';
import useAction from '../../../hooks/useAction';
import Form from '../../../components/Form';
import { todoFields, todoValidations } from './todoForms';

export default function TodoItem({ todo, onUpdate, onRemove }) {
  const [editing, setEditing] = useState(false);
  const run = useAction();

  async function handleEdit(values) {
    await onUpdate(todo.id, { title: values.title.trim() });
    setEditing(false);
  }

  return (
    <li className={todo.completed ? 'todo-item done' : 'todo-item'}>
      <label className="check">
        <input type="checkbox" checked={todo.completed}
          onChange={() => run(() => onUpdate(todo.id, { completed: !todo.completed }))} />
        <span className="check-box"><Check size={14} strokeWidth={3} /></span>
      </label>
      <span className="todo-id">#{todo.id}</span>

      {editing ? (
        <Form fields={todoFields} validations={todoValidations} initialValues={todo}
          onSubmit={handleEdit} submitText="שמירה" onCancel={() => setEditing(false)} inline />
      ) : (
        <>
          <span className="todo-title" onDoubleClick={() => setEditing(true)}>{todo.title}</span>
          <div className="row-actions">
            <button className="icon-btn" onClick={() => setEditing(true)} aria-label="עריכה"><Pencil size={15} /></button>
            <button className="icon-btn danger" onClick={() => run(() => onRemove(todo.id), 'המשימה נמחקה')}
              aria-label="מחיקה"><Trash2 size={15} /></button>
          </div>
        </>
      )}
    </li>
  );
}
