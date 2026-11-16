import { useState } from 'react';
import { findClass } from './config/classes';

// 처음 값: 주소의 ?class= → (storageKey가 있으면) 이 브라우저에서 마지막으로 고른 수업 → 선택 안 함
function initialClass(storageKey) {
  const fromUrl = new URLSearchParams(window.location.search).get('class');
  if (findClass(fromUrl)) return fromUrl;
  if (!storageKey) return '';
  const saved = localStorage.getItem(storageKey);
  return findClass(saved) ? saved : '';
}

// 선택한 수업을 주소(?class=)에 반영해서 새로고침해도 같은 수업이 열리게 함.
// storageKey를 주면 브라우저에도 기억해서, 다음에 주소만 열어도 마지막 수업이 선택됨 (강의자 화면용).
// 학생 화면은 여러 수업을 듣는 학생이 지난 수업을 그대로 고르는 실수를 막으려고 기억하지 않음.
export function useSelectedClass(storageKey) {
  const [classId, setClassId] = useState(() => initialClass(storageKey));

  function select(id) {
    setClassId(id);
    if (storageKey) localStorage.setItem(storageKey, id);
    const url = new URL(window.location.href);
    if (id) url.searchParams.set('class', id);
    else url.searchParams.delete('class');
    window.history.replaceState(null, '', url);
  }

  return [classId, select];
}
