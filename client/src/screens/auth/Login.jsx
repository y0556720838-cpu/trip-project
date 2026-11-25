import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from './authApi';
import { useAuth } from '../../context/AuthContext';
import Form from '../../components/Form';
import logo from '../../assets/logo.png';
import '../../css/auth.css';

const fields = [
  { name: 'username', label: 'שם משתמש', type: 'text' },
  { name: 'password', label: 'סיסמה', type: 'password' },
];

// בכניסה אין חוקים מעבר לשדה חובה
const validations = [];

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  async function handleLogin(values) {
    const user = await loginUser(values.username, values.password);
    login(user);
    navigate(`/${user.username}`);
  }

  return (
    <div className="auth-card">
      <img src={logo} alt="NMD" className="auth-logo" />
      <h1>כניסה</h1>
      <Form fields={fields} validations={validations} onSubmit={handleLogin} submitText="כניסה" />
      <Link to="/register">משתמש חדש? להרשמה</Link>
    </div>
  );
}