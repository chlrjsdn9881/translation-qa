import StudentView from './StudentView';
import LecturerView from './LecturerView';
import { createRoomCode, normalizeRoomCode } from './services/questionRepository';
import './App.css';

// 학생이 강의자 화면(다른 학생 질문 전체)을 볼 수 없도록 URL로 화면을 분리.
// "/" — 학생 화면, "/lecturer" — 강의자 화면 (강의자만 알고 있는 주소)
// ?room=코드 — 수업 구분. 같은 코드끼리만 질문이 오간다.
function getRoom(isLecturer) {
  const params = new URLSearchParams(window.location.search);
  const room = normalizeRoomCode(params.get('room'));
  if (room || !isLecturer) return room;

  // 강의자가 코드 없이 들어오면 새 수업 코드를 만들어 주소에 붙인다 (새로고침해도 같은 수업 유지)
  const created = createRoomCode();
  params.set('room', created);
  window.history.replaceState(null, '', `${window.location.pathname}?${params}`);
  return created;
}

export default function App() {
  const isLecturer = window.location.pathname.replace(/\/+$/, '') === '/lecturer';
  const room = getRoom(isLecturer);

  return (
    <div className="app">
      {isLecturer ? <LecturerView room={room} /> : <StudentView room={room} />}
    </div>
  );
}
