import { useState } from 'react';

function validateForm(fields, validations, values) {
  const errors = {};

  for (const field of fields) {
    const value = values[field.name];

    if (!value.trim()) {
      if (!field.optional) errors[field.name] = 'שדה חובה';
      continue;
    }

    const rule = validations.find((v) => v.name === field.name);
    if (rule && !rule.test(value, values)) {
      errors[field.name] = rule.message;
    }
  }

  return errors;
}

// initialValues - ערכים התחלתיים לטופס עריכה (בטופס הוספה - ריק)
export default function useValidatedForm(fields, validations, initialValues = {}) {
  const startValues = () =>
    Object.fromEntries(fields.map((f) => [f.name, String(initialValues[f.name] ?? '')]));

  const [values, setValues] = useState(startValues);
  const [touched, setTouched] = useState({});

  function handleChange(e) {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
    setTouched({ ...touched, [name]: true });
  }

  // הבדיקה רצה בכל רינדור, כלומר בכל הקלדה
  const errors = validateForm(fields, validations, values);
  const isValid = Object.keys(errors).length === 0;

  // בלחיצה על שליחה - מסמנים את כל השדות כדי שכל השגיאות יוצגו
  function touchAll() {
    setTouched(Object.fromEntries(fields.map((f) => [f.name, true])));
  }

  // חזרה לערכים ההתחלתיים - אחרי שליחה מוצלחת
  function reset() {
    setValues(startValues());
    setTouched({});
  }

  return { values, errors, touched, handleChange, isValid, touchAll, reset };
}
