import { useNavigate, Navigate } from 'react-router-dom';
import { registerUser, hasPendingRegistration } from './authApi';
import { useAuth } from '../../context/AuthContext';
import Form from '../../components/Form';
import { profileFields, profileValidations, profileFromForm } from '../profileForm';
import logo from '../../assets/logo.png';
import '../../css/auth.css';

export default function CompleteProfile() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // הגעה ישירה לכתובת (או רענון) בלי לעבור בשלב הראשון של ההרשמה
  if (!hasPendingRegistration()) return <Navigate to="/register" replace />;

  async function handleComplete(values) {
    const user = await registerUser(profileFromForm(values, {}));
    login(user);
    navigate(`/${user.username}`);
  }

  return (
    <div className="auth-card">
      <img src={logo} alt="NMD" className="auth-logo" />
      <h1>השלמת פרטים</h1>
      <Form fields={profileFields} validations={profileValidations} onSubmit={handleComplete} submitText="סיום הרשמה" />
    </div>
  );
}