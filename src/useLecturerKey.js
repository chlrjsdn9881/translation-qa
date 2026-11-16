import { useEffect, useState } from 'react';
import { LECTURER_KEY_HASH } from './config/lecturerKey';

async function sha256Hex(text) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

// 강의자 주소의 ?key= 값이 맞는지 확인. 학생은 /lecturer만 쳐서는 강의자 화면을 볼 수 없음.
// 결과: { checking: true } → 확인 중, { key: '...' } → 강의자, { key: null } → 키 없음/틀림
export function useLecturerKey() {
  const [state, setState] = useState({ checking: true, key: null });

  useEffect(() => {
    const key = new URLSearchParams(window.location.search).get('key') || '';
    let cancelled = false;
    sha256Hex(key).then((hash) => {
      if (!cancelled) setState({ checking: false, key: key && hash === LECTURER_KEY_HASH ? key : null });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
