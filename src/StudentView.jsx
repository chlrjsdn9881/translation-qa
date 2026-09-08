import React, { useState } from "react";

import { sendQuestion } from "./services/questionRepository";

export default function StudentPage() {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  const MAX_LENGTH = 300;

  // ----------------------------------------
  // 질문 입력
  // ----------------------------------------
  const handleChange = (event) => {
    const value = event.target.value;

    if (value.length <= MAX_LENGTH) {
      setText(value);
      setMessage("");
    }
  };

  // ----------------------------------------
  // 질문 전송
  // ----------------------------------------
  const handleSubmit = async (event) => {
    event.preventDefault();

    const cleanText = text.trim();

    // 빈 질문 확인
    if (!cleanText) {
      setMessage("질문을 입력해주세요.");
      return;
    }

    // 300자 확인
    if (cleanText.length > MAX_LENGTH) {
      setMessage(
        "질문은 300자 이내로 입력해주세요."
      );
      return;
    }

    try {
      setSending(true);
      setMessage("");

      // Firebase에 질문 전송
      // sessionId는 questionRepository에서 자동 처리
      await sendQuestion(cleanText);

      // 입력창 초기화
      setText("");

      // 성공 메시지
      setMessage("질문이 전송되었습니다.");
    } catch (error) {
      console.error(
        "질문 전송 오류:",
        error
      );

      setMessage(
        error?.message ||
          "질문 전송에 실패했습니다."
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="page student-page">
      {/* ----------------------------------------
          제목
      ---------------------------------------- */}
      <div className="student-header">
        <h1>강의 질문하기</h1>

        <p>
          모국어로 질문을 입력해주세요.
        </p>
      </div>

      {/* ----------------------------------------
          질문 입력 영역
      ---------------------------------------- */}
      <form
        className="question-form"
        onSubmit={handleSubmit}
      >
        <div className="textarea-wrapper">
          <textarea
            value={text}
            onChange={handleChange}
            maxLength={MAX_LENGTH}
            placeholder={
              "궁금한 내용을 모국어로 입력해주세요."
            }
            disabled={sending}
          />

          {/* 글자 수 */}
          <div className="character-count">
            {text.length} / {MAX_LENGTH}
          </div>
        </div>

        {/* 전송 버튼 */}
        <button
          type="submit"
          disabled={
            sending ||
            !text.trim()
          }
          className="send-button"
        >
          {sending
            ? "전송 중..."
            : "질문 보내기"}
        </button>
      </form>

      {/* ----------------------------------------
          전송 결과 메시지
      ---------------------------------------- */}
      {message && (
        <div
          className={`student-message ${
            message.includes("실패") ||
            message.includes("오류")
              ? "error"
              : "success"
          }`}
        >
          {message}
        </div>
      )}

      {/* ----------------------------------------
          사용 안내
      ---------------------------------------- */}
      <div className="student-guide">
        <div className="guide-item">
          <span>🌐</span>

          <div>
            <strong>
              모국어로 질문
            </strong>

            <p>
              한국어가 아니어도 자유롭게
              질문할 수 있습니다.
            </p>
          </div>
        </div>

        <div className="guide-item">
          <span>⚡</span>

          <div>
            <strong>
              실시간 전달
            </strong>

            <p>
              질문은 강의자 화면에
              실시간으로 전달됩니다.
            </p>
          </div>
        </div>

        <div className="guide-item">
          <span>🔒</span>

          <div>
            <strong>
              익명 질문
            </strong>

            <p>
              이름이나 학번을 입력하지 않습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
