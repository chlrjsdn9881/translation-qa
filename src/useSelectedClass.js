import { useState } from 'react';
import { findClass } from './config/classes';

// 처음 값: 주소의 ?class= → 이 브라우저에서 마지막으로 고른 수업 → 선택 안 함
function initialClass(storageKey) {
  const fromUrl = new URLSearchParams(window.location.search).get('class');
  if (findClass(fromUrl)) return fromUrl;
  const saved = localStorage.getItem(storageKey);
  return findClass(saved) ? saved : '';
}

// 선택한 수업을 브라우저에 기억하고 주소(?class=)에도 반영해서, 새로고침하거나 링크를 공유해도 같은 수업이 열리게 함
export function useSelectedClass(storageKey) {
  const [classId, setClassId] = useState(() => initialClass(storageKey));

  function select(id) {
    setClassId(id);
    localStorage.setItem(storageKey, id);
    const url = new URL(window.location.href);
    if (id) url.searchParams.set('class', id);
    else url.searchParams.delete('class');
    window.history.replaceState(null, '', url);
  }

  return [classId, select];
}
