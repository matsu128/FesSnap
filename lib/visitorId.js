import { v4 as uuidv4 } from 'uuid';

export function getVisitorId() {
  const key = 'fesnap-visitorId';
  if (typeof window === 'undefined') return null;
  let visitorId = null;
  try {
    visitorId = localStorage.getItem(key);
    if (!visitorId) {
      visitorId = uuidv4();
      localStorage.setItem(key, visitorId);
    }
  } catch (e) {
    // localStorageが使えない場合はnullを返す
    visitorId = null;
  }
  return visitorId;
} 