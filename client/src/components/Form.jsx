import { useState } from 'react';
import useValidatedForm from '../hooks/useValidatedForm';
import { useToast } from '../context/ToastContext';
import FormField from './FormField';

export default function Form({
  fields, validations, onSubmit, submitText, initialValues, onCancel, successMessage, inline,
}) {
  const { values, errors, touched, handleChange, isValid, touchAll, reset } =
    useValidatedForm(fields, validations, initialValues);
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const showToast = useToast();

  async function handleSubmit(e) {
    e.preventDefault();
    touchAll();
    if (!isValid) return;

    setServerError('');
    setLoading(true);
    try {
      await onSubmit(values);
      reset();
      if (successMessage) showToast(successMessage);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape' && onCancel) onCancel();
  }

  return (
    <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} noValidate className={inline ? 'form inline' : 'form'}>
      <div className="form-fields">
        {fields.map((f) => (
          <FormField key={f.name} {...f} value={values[f.name]} onChange={handleChange}
            error={errors[f.name]} touched={touched[f.name]} />
        ))}
      </div>
      <div className="form-actions">
        <button type="submit" className="btn primary" disabled={loading}>{submitText}</button>
        {onCancel && <button type="button" className="btn ghost" onClick={onCancel}>ביטול</button>}
      </div>
      {serverError && <p className="form-error">{serverError}</p>}
    </form>
  );
}
