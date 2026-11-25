import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import useAction from '../../../hooks/useAction';
import Form from '../../../components/Form';
import { formatDateTime } from '../../../utils/format';
import { commentFields, commentValidations } from './postForms';

export default function CommentItem({ comment, onUpdate, onRemove }) {
  const { currentUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const run = useAction();

  // עריכה ומחיקה - רק לתגובה של המשתמשת המחוברת
  const isMine = comment.userId === currentUser.id;

  async function handleEdit(values) {
    await onUpdate(comment.id, { body: values.body.trim() });
    setEditing(false);
  }

  return (
    <li className={isMine ? 'comment mine' : 'comment'}>
      <header>
        <strong>{comment.name}</strong>
        <span className="muted">{formatDateTime(comment.createdAt)}</span>
        {isMine && !editing && (
          <div className="row-actions">
            <button className="icon-btn" onClick={() => setEditing(true)} aria-label="עריכה"><Pencil size={14} /></button>
            <button className="icon-btn danger" onClick={() => run(() => onRemove(comment.id), 'התגובה נמחקה')}
              aria-label="מחיקה"><Trash2 size={14} /></button>
          </div>
        )}
      </header>
      {editing ? (
        <Form fields={commentFields} validations={commentValidations} initialValues={comment}
          onSubmit={handleEdit} submitText="שמירה" onCancel={() => setEditing(false)} />
      ) : (
        <p>{comment.body}</p>
      )}
    </li>
  );
}
