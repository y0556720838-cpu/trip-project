import { Link } from 'react-router-dom';
import { ListChecks, MessageCircle, Images } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const LINKS = [
  { to: 'albums', icon: Images, title: 'האלבומים שלי', text: 'כל התמונות מהטיולים, מסודרות לפי מקומות' },
  { to: 'all-posts', icon: MessageCircle, title: 'מה חדש בקהילה', text: 'חוויות והמלצות של מטיילים אחרים' },
  { to: 'lists', icon: ListChecks, title: 'הרשימות שלי', text: 'ציוד, מקומות לבקר והכנות לטיול הבא' },
];

//  המסך שמוצג לפני שבוחרים לשונית 
export default function Welcome() {
  const { currentUser } = useAuth();

  return (
    <section className="welcome">
      <h2>לאן יוצאים היום, {currentUser.name.split(' ')[0]}?</h2>
      <p>בחרו אחת מהאפשרויות כדי להתחיל</p>
      <div className="welcome-links">
        {LINKS.map(({ to, icon: Icon, title, text }) => (
          <Link key={to} to={to} className="welcome-card">
            <Icon size={28} strokeWidth={1.6} />
            <strong>{title}</strong>
            <span>{text}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
