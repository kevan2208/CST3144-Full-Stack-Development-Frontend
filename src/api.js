/**
 * All backend calls use fetch() returning Promises (no axios).
 * In dev, Vite proxy forwards /lessons, /orders, /search, /images to Express.
 */
const BASE = import.meta.env.VITE_API_BASE || '';

function handleJson(res) {
  if (!res.ok) {
    return res.text().then((text) => {
      let parsed = null;
      try {
        parsed = JSON.parse(text);
      } catch {
        throw new Error(text || res.statusText);
      }
      throw new Error((parsed && parsed.error) || text || res.statusText);
    });
  }
  return res.json();
}

export function fetchLessons() {
  return fetch(`${BASE}/lessons`).then(handleJson);
}

export function fetchSearch(q) {
  const params = new URLSearchParams();
  params.set('q', q == null ? '' : String(q));
  return fetch(`${BASE}/search?${params.toString()}`).then(handleJson);
}

/**
 * PUT /lessons/:id — update one or more lesson fields (subject, location, price, space, image).
 */
export function putLesson(lessonId, partial) {
  return fetch(`${BASE}/lessons/${lessonId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(partial)
  }).then(handleJson);
}

export function updateLessonSpace(lessonId, space) {
  return putLesson(lessonId, { space });
}

export function postOrder({ name, phone, lessonIds }) {
  return fetch(`${BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, phone, lessonIds })
  }).then(handleJson);
}
