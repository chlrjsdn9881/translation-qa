import { db } from './firebaseConfig';
import { ref, push, remove, onChildAdded, serverTimestamp, query, limitToLast } from 'firebase/database';

const MAX_LENGTH = 300;
const NAME_MAX_LENGTH = 30;

// 수업 코드 — 수업마다 질문을 rooms/{코드}/questions 아래에 따로 저장.
// 헷갈리기 쉬운 글자(0/O, 1/I/L)는 빼고 대문자·숫자 6자리로 만든다.
const ROOM_CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const ROOM_CODE_LENGTH = 6;
const ROOM_CODE_PATTERN = /^[A-Z0-9]{4,12}$/;

export function createRoomCode() {
  let code = '';
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    code += ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)];
  }
  return code;
}

// 주소에서 읽은 값을 정리 — 형식이 맞지 않으면 null (Firebase 경로에 쓸 수 없는 문자 차단)
export function normalizeRoomCode(value) {
  const code = (value || '').trim().toUpperCase();
  return ROOM_CODE_PATTERN.test(code) ? code : null;
}

function questionsPath(room) {
  return `rooms/${room}/questions`;
}

function getSessionId() {
  let id = localStorage.getItem('sessionId');
  if (!id) {
    id = Math.random().toString(36).slice(2, 8);
    localStorage.setItem('sessionId', id);
  }
  return id;
}

// 학생 화면에서 호출 — 질문 전송
export async function sendQuestion(room, text, name) {
  const trimmed = text.trim().slice(0, MAX_LENGTH);
  if (!trimmed) return;
  await push(ref(db, questionsPath(room)), {
    text: trimmed,
    name: (name || '').trim().slice(0, NAME_MAX_LENGTH) || '익명',
    timestamp: serverTimestamp(),
    sessionId: getSessionId(),
  });
}

// 강의자 화면에서 호출 — 이 수업에 새 질문이 생길 때마다 callback(question) 실행
export function subscribeToQuestions(room, callback) {
  const recentQuery = query(ref(db, questionsPath(room)), limitToLast(50));
  const unsubscribe = onChildAdded(recentQuery, (snapshot) => {
    callback({ id: snapshot.key, ...snapshot.val() });
  });
  return unsubscribe; // 화면이 사라질 때 unsubscribe() 호출해서 구독 해제
}

// 강의자 화면에서 호출 — 질문 하나 삭제
export async function deleteQuestion(room, id) {
  await remove(ref(db, `${questionsPath(room)}/${id}`));
}

// 강의자 화면에서 호출 — 이 수업의 질문 전체 삭제
export async function clearAllQuestions(room) {
  await remove(ref(db, questionsPath(room)));
}

export const QUESTION_MAX_LENGTH = MAX_LENGTH;
export const NAME_INPUT_MAX_LENGTH = NAME_MAX_LENGTH;
