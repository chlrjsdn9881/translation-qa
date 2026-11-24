import { db } from './firebaseConfig';
import { ref, push, remove, onChildAdded, serverTimestamp, query, limitToLast } from 'firebase/database';
import { findClass } from '../config/classes';

const MAX_LENGTH = 300;
const NAME_MAX_LENGTH = 30;

// 수업마다 질문을 classes/{수업 id}/questions 아래에 따로 저장
function questionsPath(classId) {
  if (!findClass(classId)) throw new Error(`알 수 없는 수업입니다: ${classId}`);
  return `classes/${classId}/questions`;
}

function getSessionId() {
  let id = localStorage.getItem('sessionId');
  if (!id) {
    id = Math.random().toString(36).slice(2, 8);
    localStorage.setItem('sessionId', id);
  }
  return id;
}

// 학생 화면에서 호출 — 질문 전송 (DB에서도 어느 수업 질문인지 보이도록 수업 이름을 같이 저장)
export async function sendQuestion(classId, text, name) {
  const trimmed = text.trim().slice(0, MAX_LENGTH);
  if (!trimmed) return;
  await push(ref(db, questionsPath(classId)), {
    className: findClass(classId).name,
    text: trimmed,
    name: (name || '').trim().slice(0, NAME_MAX_LENGTH) || '익명',
    timestamp: serverTimestamp(),
    sessionId: getSessionId(),
  });
}

// 강의자 화면에서 호출 — 선택한 수업에 새 질문이 생길 때마다 callback(question) 실행
// onError: 권한 거부·연결 오류로 목록을 받지 못할 때 호출
export function subscribeToQuestions(classId, callback, onError) {
  const recentQuery = query(ref(db, questionsPath(classId)), limitToLast(50));
  const unsubscribe = onChildAdded(
    recentQuery,
    (snapshot) => {
      callback({ id: snapshot.key, ...snapshot.val() });
    },
    (error) => onError?.(error),
  );
  return unsubscribe; // 화면이 사라지거나 수업을 바꿀 때 unsubscribe() 호출해서 구독 해제
}

// 강의자 화면에서 호출 — 질문 하나 삭제
export async function deleteQuestion(classId, id) {
  await remove(ref(db, `${questionsPath(classId)}/${id}`));
}

// 강의자 화면에서 호출 — 선택한 수업의 질문 전체 삭제
export async function clearAllQuestions(classId) {
  await remove(ref(db, questionsPath(classId)));
}

export const QUESTION_MAX_LENGTH = MAX_LENGTH;
export const NAME_INPUT_MAX_LENGTH = NAME_MAX_LENGTH;
