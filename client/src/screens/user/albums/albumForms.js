// שדות וּולידציות של הטפסים באזור האלבומים - משותפים להוספה ולעריכה,
// וגם ההמרה מערכי הטופס לאובייקט שנשמר בשרת

export const albumFields = [
  { name: 'title', label: 'שם האלבום' },
  { name: 'region', label: 'אזור', optional: true, placeholder: 'למשל: הגליל, ים המלח' },
  { name: 'description', label: 'תיאור קצר', type: 'textarea', optional: true },
];

export const albumValidations = [
  { name: 'title', test: (v) => v.trim().length >= 2 && v.trim().length <= 50, message: '2–50 תווים' },
  { name: 'region', test: (v) => v.trim().length <= 30, message: 'עד 30 תווים' },
  { name: 'description', test: (v) => v.trim().length <= 200, message: 'עד 200 תווים' },
];

// ערכי הטופס → אובייקט לשמירה בשרת
export function albumFromForm(values) {
  return {
    title: values.title.trim(),
    region: values.region.trim(),
    description: values.description.trim(),
  };
}

const RATING_OPTIONS = [0, 1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: n ? '★'.repeat(n) : 'ללא דירוג' }));

export const photoFields = [
  { name: 'title', label: 'כותרת' },
  { name: 'url', label: 'קישור לתמונה', type: 'url' },
  { name: 'takenAt', label: 'תאריך צילום', type: 'date' },
  { name: 'rating', label: 'דירוג', type: 'select', options: RATING_OPTIONS },
];

export const photoValidations = [
  { name: 'title', test: (v) => v.trim().length >= 2 && v.trim().length <= 60, message: '2–60 תווים' },
  { name: 'url', test: (v) => /^https?:\/\/\S+$/.test(v.trim()), message: 'קישור לא תקין' },
  { name: 'takenAt', test: (v) => new Date(v) <= new Date(), message: 'התאריך עוד לא הגיע' },
];

// ערכי הטופס → אובייקט לשמירה בשרת
export function photoFromForm(values) {
  return {
    title: values.title.trim(),
    url: values.url.trim(),
    takenAt: values.takenAt,
    rating: Number(values.rating),
  };
}