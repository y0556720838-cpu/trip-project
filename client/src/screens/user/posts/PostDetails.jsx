import { useState } from 'react';
import { useParams, useOutletContext, useNavigate, useLocation } from 'react-router-dom';
import { Pencil, Trash2, Clock, MessageCircle, MapPin, FileX } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import useCrud from '../../../hooks/useCrud';
import useAction from '../../../hooks/useAction';
import Form from '../../../components/Form';
import Modal from '../../../components/Modal';
import EmptyState from '../../../components/EmptyState';
import { formatDate, readingTime, sizedImage } from '../../../utils/format';
import { postFields, postValidations, postToForm, postFromForm } from './postForms';
import Comments from './Comments';

export default function PostDetails() {
  const { postId } = useParams();
  const { currentUser } = useAuth();
  const { posts, mine } = useOutletContext();
  const found = posts.items.find((p) => String(p.id) === postId);

  // נכנסו ישר לכתובת והפוסט עוד לא בעמודים שנטענו - מביאים רק אותו.
  // ב"הפוסטים שלי" - רק אם הוא באמת שלי
  const single = useCrud('posts', { id: postId, ...(mine && { userId: currentUser.id }) }, !found);
  const post = found ?? single.items[0];

  if (!post) {
    return single.loading ? null
      : <EmptyState icon={FileX} title="הפוסט לא נמצא" text="ייתכן שהוא נמחק" />;
  }

  // key - מעבר לפוסט אחר יוצר רכיב חדש, וכך מתאפס ה-state (עריכה, תגובות פתוחות)
  return <PostView key={post.id} post={post} actions={found ? posts : single} />;
}

function PostView({ post, actions }) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { search } = useLocation();
  const [editing, setEditing] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const run = useAction();

  const isMine = post.userId === currentUser.id;

  async function handleEdit(values) {
    await actions.update(post.id, postFromForm(values, post));
    setEditing(false);
  }

  function handleDelete() {
    run(async () => {
      await actions.remove(post.id); // השרת מוחק גם את התגובות של הפוסט
      navigate(`..${search}`);
    }, 'הפוסט נמחק');
  }

  const [mainImage, ...moreImages] = post.images ?? [];

  return (
    <article className="post-details">
      {mainImage && <img className="post-hero" src={sizedImage(mainImage, 700)} alt="" />}

      <header>
        <p className="muted">פוסט #{post.id}</p>
        <h2>{post.title}</h2>
        <p className="post-meta">
          <strong>{post.authorName}</strong>
          {post.authorCity && <> · <MapPin size={13} /> {post.authorCity}</>}
          {' · '}{formatDate(post.createdAt)} · <Clock size={13} /> {readingTime(post.body)} דק׳ קריאה
        </p>
        {isMine && (
          <div className="post-actions">
            <button className="btn soft small" onClick={() => setEditing(true)}><Pencil size={15} /> עריכה</button>
            <button className="btn danger small" onClick={handleDelete}><Trash2 size={15} /> מחיקה</button>
          </div>
        )}
      </header>

      <div className="post-body">
        {post.body.split(/\n\s*\n/).map((paragraph, i) => <p key={i}>{paragraph}</p>)}
      </div>

      {moreImages.length > 0 && (
        <div className="post-gallery">
          {moreImages.map((src) => <img key={src} src={sizedImage(src, 400)} alt="" loading="lazy" />)}
        </div>
      )}

      <button className="btn soft comments-toggle" onClick={() => setShowComments(!showComments)}>
        <MessageCircle size={17} /> {showComments ? 'הסתרת תגובות' : 'הצגת תגובות'}
      </button>
      {showComments && <Comments postId={post.id} />}

      {editing && (
        <Modal title="עריכת פוסט" onClose={() => setEditing(false)} className="wide">
          <Form fields={postFields} validations={postValidations} initialValues={postToForm(post)}
            onSubmit={handleEdit} submitText="שמירה" successMessage="הפוסט עודכן"
            onCancel={() => setEditing(false)} />
        </Modal>
      )}
    </article>
  );
}