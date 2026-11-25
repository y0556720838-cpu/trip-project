// שדות וּולידציות של טופס פוסט (הוספה ועריכה) ושל טופס תגובה,
// וגם ההמרות בין פוסט לערכי הטופס

export const postFields = [
  { name: 'title', label: 'כותרת' },
  { name: 'image', label: 'קישור לתמונה', type: 'url', optional: true },
  { name: 'body', label: 'תוכן', type: 'textarea', placeholder: 'אפשר לחלק לפסקאות עם שורה ריקה ביניהן' },
];

export const postValidations = [
  { name: 'title', test: (v) => v.trim().length >= 2 && v.trim().length <= 80, message: '2–80 תווים' },
  { name: 'image', test: (v) => /^https?:\/\/\S+$/.test(v.trim()), message: 'קישור לא תקין' },
  { name: 'body', test: (v) => v.trim().length >= 20, message: 'לפחות 20 תווים' },
];

// פוסט → ערכי הטופס. בטופס יש שדה אחד לתמונה - הראשונה ברשימה
export function postToForm(post) {
  return { ...post, image: post.images?.[0] ?? '' };
}

// ערכי הטופס → השינויים לשמירה בשרת.
// post - הפוסט הקיים בעריכה: התמונה הראשונה מוחלפת, השאר נשארות.
// בפוסט חדש אין פוסט קיים, ולכן התמונות הן רק מה שהוזן בטופס
export function postFromForm(values, post = {}) {
  const image = values.image.trim();
  const otherImages = (post.images ?? []).slice(1);
  return {
    title: values.title.trim(),
    body: values.body.trim(),
    images: image ? [image, ...otherImages] : otherImages,
  };
}

export const commentFields = [{ name: 'body', type: 'textarea', placeholder: 'מה דעתך?' }];
export const commentValidations = [
  { name: 'body', test: (v) => v.trim().length <= 400, message: 'עד 400 תווים' },
];