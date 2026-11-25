import { useState } from 'react';
import { Plus } from 'lucide-react';
import Form from '../../../components/Form';
import Modal from '../../../components/Modal';
import { listTemplates } from './listTemplates';
import { listTitleFields, listTitleValidations } from './todoForms';

export default function NewListMenu({ onCreate }) {
  const [open, setOpen] = useState(false);
  // התבנית שנבחרה. כשיש תבנית - מוצג טופס לשם הרשימה
  const [template, setTemplate] = useState(null);

  function close() {
    setOpen(false);
    setTemplate(null);
  }

  async function handleCreate(values) {
    await onCreate(template, values.title.trim());
    close();
  }

  return (
    <>
      <button className="btn primary small" onClick={() => setOpen(true)}>
        <Plus size={16} /> רשימה חדשה
      </button>

      {open && (
        <Modal title="רשימה חדשה" onClose={close}>
          <div className="templates">
            {listTemplates.map((t) => (
              <button key={t.type} type="button"
                className={template?.type === t.type ? 'template active' : 'template'}
                onClick={() => setTemplate(t)}>
                <strong>{t.label}</strong>
                <span>{t.items.length ? `${t.items.length} פריטים מוכנים` : 'מתחילים מאפס'}</span>
              </button>
            ))}
          </div>

          {template && (
            <Form key={template.type} fields={listTitleFields} validations={listTitleValidations}
              initialValues={{ title: template.title }} onSubmit={handleCreate}
              submitText="יצירת רשימה" successMessage="הרשימה נוצרה" onCancel={close} />
          )}
        </Modal>
      )}
    </>
  );
}
