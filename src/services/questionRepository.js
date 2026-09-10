import { db } from './firebaseConfig';
import { ref, push, onChildAdded, serverTimestamp, query, limitToLast } from 'firebase/database';

const QUESTIONS_PATH = 'questions';
const MAX_LENGTH = 300;
const NAME_MAX_LENGTH = 30;
const NAME_KEY = 'studentName';

function getSessionId() {
  let id = localStorage.getItem('sessionId');
  if (!id) {
    id = Math.random().toString(36).slice(2, 8);
    localStorage.setItem('sessionId', id);
  }
  return id;
}

// 학생 화면에서 호출 — 마지막으로 입력했던 이름 불러오기/저장 (매번 다시 입력 안 해도 되게)
export function getStoredName() {
  return localStorage.getItem(NAME_KEY) || '';
}

export function setStoredName(name) {
  localStorage.setItem(NAME_KEY, name.trim().slice(0, NAME_MAX_LENGTH));
}

// 학생 화면에서 호출 — 질문 전송
export async function sendQuestion(text, name) {
  const trimmed = text.trim().slice(0, MAX_LENGTH);
  if (!trimmed) return;
  await push(ref(db, QUESTIONS_PATH), {
    text: trimmed,
    name: (name || '').trim().slice(0, NAME_MAX_LENGTH) || '익명',
    timestamp: serverTimestamp(),
    sessionId: getSessionId(),
  });
}

// 강의자 화면에서 호출 — 새 질문이 생길 때마다 callback(question) 실행
export function subscribeToQuestions(callback) {
  const recentQuery = query(ref(db, QUESTIONS_PATH), limitToLast(50));
  const unsubscribe = onChildAdded(recentQuery, (snapshot) => {
    callback({ id: snapshot.key, ...snapshot.val() });
  });
  return unsubscribe; // 화면이 사라질 때 unsubscribe() 호출해서 구독 해제
}

export const QUESTION_MAX_LENGTH = MAX_LENGTH;
export const NAME_INPUT_MAX_LENGTH = NAME_MAX_LENGTH;
