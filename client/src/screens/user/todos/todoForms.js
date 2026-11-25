// שדות וּולידציות של הטפסים באזור הרשימות

export const listTitleFields = [{ name: 'title', label: 'שם הרשימה' }];
export const listTitleValidations = [
  { name: 'title', test: (v) => v.trim().length >= 2 && v.trim().length <= 40, message: '2–40 תווים' },
];

// בלי label - הטופס מוצג בתוך השורה
export const todoFields = [{ name: 'title', placeholder: 'משימה חדשה...' }];
export const todoValidations = [
  { name: 'title', test: (v) => v.trim().length <= 60, message: 'עד 60 תווים' },
];
