import StudentView from './StudentView';
import LecturerView from './LecturerView';
import './App.css';

// 학생이 강의자 화면(다른 학생 질문 전체)을 볼 수 없도록 URL로 화면을 분리.
// "/" — 학생 화면, "/lecturer" — 강의자 화면 (강의자만 알고 있는 주소)
export default function App() {
  const isLecturer = window.location.pathname.replace(/\/+$/, '') === '/lecturer';

  return (
    <div className="app">
      {isLecturer ? <LecturerView /> : <StudentView />}
    </div>
  );
}
