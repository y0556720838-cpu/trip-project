import { Navigate, NavLink, Link, Outlet, useParams, useNavigate, useLocation } from 'react-router-dom';
import { UserRound, ListChecks, MessageCircle, Images, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.png';
import '../../css/layout.css';

// כפתורי הניווט - Info, Todos, Posts, Albums
const NAV = [
  { to: 'info', label: 'מידע אישי', icon: UserRound },
  { to: 'lists', label: 'רשימות', icon: ListChecks },
  { to: 'posts', label: 'פוסטים', icon: MessageCircle },
  { to: 'albums', label: 'אלבומים', icon: Images },
];

export default function UserScreen() {
  const { username } = useParams();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // חסימת גישה לעמוד של משתמש אחר
  if (username !== currentUser.username) {
    return <Navigate to={`/${currentUser.username}`} replace />;
  }

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="user-screen">
      <header className="top-bar">
        {/* לחיצה על הלוגו מחזירה למסך הפתיחה */}
        <Link to={`/${currentUser.username}`} className="logo-link">
          <img src={logo} alt="NMD - למסך הבית" className="logo" />
        </Link>
        <div className="user-greeting">
          <h1>שלום, {currentUser.name}!</h1>
          <button className="btn soft" onClick={handleLogout}>
            <LogOut size={18} /> התנתקות
          </button>
        </div>
      </header>

      <nav className="main-nav">
        {NAV.map(({ to, label, icon: Icon }) => (
          // all-posts שייך גם הוא ללשונית הפוסטים
          <NavLink key={to} to={to}
            className={({ isActive }) =>
              isActive || (to === 'posts' && pathname.includes('/all-posts')) ? 'nav-pill active' : 'nav-pill'}>
            <Icon size={20} /> {label}
          </NavLink>
        ))}
      </nav>

      <main className="panel">
        <Outlet />
      </main>
    </div>
  );
}