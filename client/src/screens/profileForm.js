// טופס הפרטים האישיים - משותף להשלמת הפרטים בהרשמה (CompleteProfile) ולעריכה (Info)

export const profileFields = [
  { name: 'name', label: 'שם מלא' },
  { name: 'email', label: 'אימייל', type: 'email' },
  { name: 'phone', label: 'טלפון', type: 'tel' },
  { name: 'city', label: 'עיר' },
  { name: 'travelStyle', label: 'סגנון טיול', optional: true, placeholder: 'למשל: טיולי מורשת והיסטוריה' },
  { name: 'preferences', label: 'העדפות טיול', optional: true, placeholder: 'מופרד בפסיקים: טיולים משפחתיים, מסלולי הליכה' },
  { name: 'interests', label: 'תחומי עניין', optional: true, placeholder: 'מופרד בפסיקים' },
];

export const profileValidations = [
  { name: 'name', test: (v) => /^[a-zA-Zא-ת\s]{2,30}$/.test(v), message: '2–30 אותיות' },
  { name: 'email', test: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), message: 'כתובת מייל לא תקינה' },
  { name: 'phone', test: (v) => /^0\d{1,2}-?\d{7}$/.test(v), message: 'מספר טלפון לא תקין' },
  { name: 'city', test: (v) => /^[a-zA-Zא-ת\s-]{2,30}$/.test(v), message: 'שם עיר לא תקין' },
  { name: 'travelStyle', test: (v) => v.trim().length <= 40, message: 'עד 40 תווים' },
];

const toList = (text) => text.split(',').map((s) => s.trim()).filter(Boolean);

// המשתמש → ערכי הטופס (רשימות הופכות לטקסט מופרד בפסיקים)
export function profileToForm(user) {
  return {
    ...user,
    city: user.address?.city ?? '',
    preferences: (user.preferences ?? []).join(', '),
    interests: (user.interests ?? []).join(', '),
  };
}

// ערכי הטופס → השינויים לשמירה בשרת
export function profileFromForm(values, user) {
  return {
    name: values.name.trim(),
    email: values.email.trim(),
    phone: values.phone.trim(),
    address: { ...user.address, city: values.city.trim() },
    travelStyle: values.travelStyle.trim(),
    preferences: toList(values.preferences),
    interests: toList(values.interests),
  };
}