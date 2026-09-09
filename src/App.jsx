import React, { useState } from "react";

import StudentPage from "./StudentView";
import LecturerPage from "./LecturerView";

import "./App.css";

export default function App() {
  const [mode, setMode] = useState("student");

  return (
    <div className="app">

      {/* 상단 */}
      <header className="app-header">
        <div>
          <h1>실시간 다국어 강의 질의응답</h1>
          <p>
            외국인 학생과 강의자를 위한 실시간 질문 번역 시스템
          </p>
        </div>

        {/* 학생 / 강의자 전환 */}
        <div className="mode-buttons">
          <button
            className={mode === "student" ? "active" : ""}
            onClick={() => setMode("student")}
          >
            학생 화면
          </button>

          <button
            className={mode === "lecturer" ? "active" : ""}
            onClick={() => setMode("lecturer")}
          >
            강의자 화면
          </button>
        </div>
      </header>

      {/* 화면 */}
      <main>
        {mode === "student" ? (
          <StudentPage />
        ) : (
          <LecturerPage />
        )}
      </main>

    </div>
  );
}
