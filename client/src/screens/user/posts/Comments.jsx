import { MessageCircle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import useCrud from '../../../hooks/useCrud';
import Form from '../../../components/Form';
import EmptyState from '../../../components/EmptyState';
import { commentFields, commentValidations } from './postForms';
import CommentItem from './CommentItem';

// התגובות נטענות רק כשלוחצים על "הצגת תגובות"
export default function Comments({ postId }) {
  const { currentUser } = useAuth();
  const comments = useCrud('comments', { postId, _sort: 'createdAt' });

  // זיהוי המגיבה: userId לבדיקת הרשאות, name להצגה.
  // שומרים על התגובה רק את מה שמוצג - בלי פרטים אישיים נוספים
  function handleAdd(values) {
    return comments.add({
      postId,
      userId: currentUser.id,
      name: currentUser.name,
      body: values.body.trim(),
      createdAt: new Date().toISOString(),
    });
  }

  // בזמן הטעינה לא מציגים כלום - התוכן פשוט מופיע כשהוא מגיע
  if (comments.loading) return null;
  if (comments.error) return <p className="error-box">{comments.error}</p>;

  return (
    <section className="comments">
      <h3>תגובות ({comments.items.length})</h3>
      {comments.items.length === 0 ? (
        <EmptyState icon={MessageCircle} title="עדיין אין תגובות" text="היו הראשונות להגיב" />
      ) : (
        <ul>
          {comments.items.map((comment) => (
            <CommentItem key={comment.id} comment={comment}
              onUpdate={comments.update} onRemove={comments.remove} />
          ))}
        </ul>
      )}
      <div className="add-comment">
        <Form fields={commentFields} validations={commentValidations} onSubmit={handleAdd}
          submitText="הוספת תגובה" successMessage="התגובה נוספה" />
      </div>
    </section>
  );
}