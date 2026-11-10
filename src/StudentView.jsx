import { useEffect, useRef, useState } from 'react';
import { sendQuestion, QUESTION_MAX_LENGTH, NAME_INPUT_MAX_LENGTH } from './services/questionRepository';

const COOLDOWN_SECONDS = 10;
const LAST_SENT_KEY = 'lastQuestionSentAt';

function remainingCooldown() {
  const lastSentAt = Number(localStorage.getItem(LAST_SENT_KEY) || 0);
  const elapsed = (Date.now() - lastSentAt) / 1000;
  return Math.max(0, Math.ceil(COOLDOWN_SECONDS - elapsed));
}

export default function StudentView({ room }) {
  const [text, setText] = useState('');
  const [name, setName] = useState('');
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(remainingCooldown);
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  async function handleSend() {
    if (!text.trim() || cooldown > 0) return;
    await sendQuestion(room, text, name);
    localStorage.setItem(LAST_SENT_KEY, String(Date.now()));
    setText('');
    setSent(true);
    setTimeout(() => setSent(false), 2000);
    setCooldown(COOLDOWN_SECONDS);
  }

  const disabled = !text.trim() || cooldown > 0;

  if (!room) {
    return (
      <div className="view">
        <h2>학생 화면</h2>
        <p className="warn">수업 코드가 없습니다. 강의자가 안내한 주소로 접속해 주세요.</p>
      </div>
    );
  }

  return (
    <div className="view">
      <h2>학생 화면</h2>
      <p className="hint">수업 코드: {room}</p>
      <input
        type="text"
        className="name-input"
        value={name}
        maxLength={NAME_INPUT_MAX_LENGTH}
        onChange={(e) => setName(e.target.value)}
        placeholder="이름 (선택)"
      />
      <textarea
        value={text}
        maxLength={QUESTION_MAX_LENGTH}
        onChange={(e) => setText(e.target.value)}
        placeholder="질문을 입력하세요 (모국어로 입력해도 됩니다)"
        rows={4}
      />
      <div className="counter">{text.length} / {QUESTION_MAX_LENGTH}</div>
      <button onClick={handleSend} disabled={disabled}>
        {cooldown > 0 ? `${cooldown}초 후 전송 가능` : '전송'}
      </button>
      {sent && <p className="sent-feedback">전송됨</p>}
    </div>
  );
}
