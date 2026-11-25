import { useId } from 'react';

export default function FormField({
  label, name, type = 'text', value, onChange, error, touched, optional, options, placeholder,
}) {
  // מזהה ייחודי - כדי שכמה טפסים באותו עמוד לא יתנגשו
  const id = useId();
  
  let status = '';
  if (touched) {
    if (!value.trim()) status = optional ? '' : 'empty';
    else status = error ? 'invalid' : 'valid';
  }

  const inputProps = { id, name, value, onChange, className: status, placeholder };

  let input;
  if (type === 'textarea') input = <textarea rows={6} {...inputProps} />;
  else if (type === 'select') {
    input = (
      <select {...inputProps}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    );
  } else input = <input type={type} {...inputProps} />;

  return (
    <div className="form-field">
      {label && <label htmlFor={id}>{label}{optional && <span className="optional"> (לא חובה)</span>}</label>}
      {input}
      {touched && error && <span className="field-error">{error}</span>}
    </div>
  );
}
