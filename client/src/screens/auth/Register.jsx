import { useNavigate, Link } from 'react-router-dom';
import { startRegistration } from './authApi';
import Form from '../../components/Form';
import logo from '../../assets/logo.png';
import '../../css/auth.css';

const fields = [
  { name: 'username', label: 'שם משתמש', type: 'text' },
  { name: 'password', label: 'סיסמה', type: 'password' },
  { name: 'verify', label: 'אימות סיסמה', type: 'password' },
];

const validations = [
  {
    name: 'username',
    test: (value) => /^[a-zA-Z0-9]{3,15}$/.test(value),
    message: '3–15 אותיות באנגלית או ספרות',
  },
  {
    name: 'password',
    test: (value) => /^(?=.*[a-zA-Z])(?=.*\d).{6,20}$/.test(value),
    message: '6–20 תווים, לפחות אות אחת וספרה אחת',
  },
  {
    name: 'verify',
    test: (value, values) => value === values.password,
    message: 'הסיסמאות אינן תואמות',
  },
];

export default function Register() {
  const navigate = useNavigate();

  async function handleRegister(values) {
    await startRegistration(values.username, values.password);
    navigate('/register/details');
  }

  return (
    <div className="auth-card">
      <img src={logo} alt="NMD" className="auth-logo" />
      <h1>הרשמה</h1>
      <Form fields={fields} validations={validations} onSubmit={handleRegister} submitText="המשך" />
      <Link to="/login">כבר רשום? לכניסה</Link>
    </div>
  );
}