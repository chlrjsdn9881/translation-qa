import { useEffect, useRef, useState } from 'react';
import { sendQuestion, QUESTION_MAX_LENGTH, NAME_INPUT_MAX_LENGTH } from './services/questionRepository';
import ClassSelect from './ClassSelect';
import { useSelectedClass } from './useSelectedClass';

const COOLDOWN_SECONDS = 10;
const LAST_SENT_KEY = 'lastQuestionSentAt';

function remainingCooldown() {
  const lastSentAt = Number(localStorage.getItem(LAST_SENT_KEY) || 0);
  const elapsed = (Date.now() - lastSentAt) / 1000;
  return Math.max(0, Math.ceil(COOLDOWN_SECONDS - elapsed));
}

export default function StudentView() {
  const [classId, setClassId] = useSelectedClass();
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
    if (!classId || !text.trim() || cooldown > 0) return;
    await sendQuestion(classId, text, name);
    localStorage.setItem(LAST_SENT_KEY, String(Date.now()));
    setText('');
    setSent(true);
    setTimeout(() => setSent(false), 2000);
    setCooldown(COOLDOWN_SECONDS);
  }

  const disabled = !classId || !text.trim() || cooldown > 0;

  return (
    <div className="view">
      <h2>Ask a Question</h2>
      <ClassSelect value={classId} onChange={setClassId} english />
      <input
        type="text"
        className="name-input"
        value={name}
        maxLength={NAME_INPUT_MAX_LENGTH}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name (optional)"
      />
      <textarea
        value={text}
        maxLength={QUESTION_MAX_LENGTH}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your question (you can write in your own language)"
        rows={4}
      />
      <div className="counter">{text.length} / {QUESTION_MAX_LENGTH}</div>
      <button onClick={handleSend} disabled={disabled}>
        {cooldown > 0 ? `You can send again in ${cooldown}s` : 'Send'}
      </button>
      {!classId && <p className="hint">Please select your class before sending a question.</p>}
      {sent && <p className="sent-feedback">Sent!</p>}
    </div>
  );
}
