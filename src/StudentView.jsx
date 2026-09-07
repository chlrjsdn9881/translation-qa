import { useState } from 'react';
import { sendQuestion, QUESTION_MAX_LENGTH } from './services/questionRepository';

export default function StudentView() {
  const [text, setText] = useState('');
  const [sent, setSent] = useState(false);

  async function handleSend() {
    if (!text.trim()) return;
    await sendQuestion(text);
    setText('');
    setSent(true);
    setTimeout(() => setSent(false), 2000);
  }

  return (
    <div className="view">
      <h2>학생 화면</h2>
      <textarea
        value={text}
        maxLength={QUESTION_MAX_LENGTH}
        onChange={(e) => setText(e.target.value)}
        placeholder="질문을 입력하세요 (모국어로 입력해도 됩니다)"
        rows={4}
      />
      <div className="counter">{text.length} / {QUESTION_MAX_LENGTH}</div>
      <button onClick={handleSend} disabled={!text.trim()}>전송</button>
      {sent && <p className="sent-feedback">전송됨</p>}
    </div>
  );
}
