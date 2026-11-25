import { NavLink, useLocation } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { formatDate, readingTime, sizedImage } from '../../../utils/format';

// פוסט ברשימת הסקירה. לחיצה פותחת אותו, והפוסט הנבחר מקבל class="active" (מודגש)
export default function PostItem({ post }) {
  const { search } = useLocation();

  return (
    <li>
      <NavLink to={`${post.id}${search}`} className="post-item">
        {post.images?.[0] && <img src={sizedImage(post.images[0], 200)} alt="" loading="lazy" />}
        <div className="post-item-body">
          <span className="muted">#{post.id}</span>
          <h3>{post.title}</h3>
          <p className="post-meta">
            {post.authorName} · {formatDate(post.createdAt)} · <Clock size={13} /> {readingTime(post.body)} דק׳
          </p>
        </div>
      </NavLink>
    </li>
  );
}