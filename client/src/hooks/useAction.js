import { useToast } from '../context/ToastContext';

// הרצת פעולה מכפתור (מחיקה, סימון, דירוג) עם הודעה על הצלחה או כישלון
export default function useAction() {
  const showToast = useToast();

  async function run(action, successMessage) {
    try {
      await action();
      if (successMessage) showToast(successMessage);
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  return run;
}
