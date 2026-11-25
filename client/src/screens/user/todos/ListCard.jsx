import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import useAction from '../../../hooks/useAction';
import Form from '../../../components/Form';
import ProgressBar from './ProgressBar';
import { listTitleFields, listTitleValidations } from './todoForms';

// כרטיס רשימה בעמודת הרשימות: שם, מזהה והתקדמות. לחיצה פותחת את המשימות שלה
export default function ListCard({ list, onUpdate, onRemove }) {
  const [editing, setEditing] = useState(false);
  const run = useAction();
  const { search } = useLocation();

  async function handleRename(values) {
    await onUpdate(list.id, { title: values.title.trim() });
    setEditing(false);
  }

  if (editing) {
    return (
      <li className="list-card editing">
        <Form fields={listTitleFields} validations={listTitleValidations} initialValues={list}
          onSubmit={handleRename} submitText="שמירה" onCancel={() => setEditing(false)} inline />
      </li>
    );
  }

  return (
    <li className="list-card">
      {/* search - כדי שסינון הרשימות יישמר במעבר בין רשימות */}
      <NavLink to={`${list.id}${search}`} className="list-link">
        <span className="list-title"><span className="muted">#{list.id}</span> {list.title}</span>
        <ProgressBar done={list.doneCount} total={list.todosCount} />
      </NavLink>
      <div className="card-actions">
        <button className="icon-btn" onClick={() => setEditing(true)} aria-label="שינוי שם"><Pencil size={15} /></button>
        <button className="icon-btn danger" onClick={() => run(() => onRemove(list.id), 'הרשימה נמחקה')}
          aria-label="מחיקה"><Trash2 size={15} /></button>
      </div>
    </li>
  );
}
