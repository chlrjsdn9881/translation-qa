import { useState } from 'react';
import StudentView from './StudentView';
import LecturerView from './LecturerView';
import './App.css';

export default function App() {
  const [mode, setMode] = useState('student');

  return (
    <div className="app">
      <nav className="mode-switch">
        <button className={mode === 'student' ? 'active' : ''} onClick={() => setMode('student')}>학생 화면</button>
        <button className={mode === 'lecturer' ? 'active' : ''} onClick={() => setMode('lecturer')}>강의자 화면</button>
      </nav>
      {mode === 'student' ? <StudentView /> : <LecturerView />}
    </div>
  );
}
