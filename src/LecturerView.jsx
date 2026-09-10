import { useEffect, useState } from 'react';
import { subscribeToQuestions, deleteQuestion, clearAllQuestions } from './services/questionRepository';
import { translateAndExtractKeywords, isBuiltInAIAvailable } from './services/translator';

export default function LecturerView() {
  const [questions, setQuestions] = useState([]);
  const [results, setResults] = useState({}); // id -> { translated, keywords, loading, error }

  useEffect(() => {
    const unsubscribe = subscribeToQuestions((q) => {
      setQuestions((prev) => [q, ...prev]);
    });
    return unsubscribe;
  }, []);

  async function handleDoubleClick(question) {
    setResults((prev) => ({ ...prev, [question.id]: { loading: true } }));
    try {
      const { translated, keywords } = await translateAndExtractKeywords(question.text);
      setResults((prev) => ({ ...prev, [question.id]: { translated, keywords, loading: false } }));
    } catch (e) {
      setResults((prev) => ({ ...prev, [question.id]: { error: e.message, loading: false } }));
    }
  }

  async function handleDelete(id) {
    await deleteQuestion(id);
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    setResults((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  async function handleClearAll() {
    if (!window.confirm('질문을 전부 삭제할까요? 되돌릴 수 없습니다.')) return;
    await clearAllQuestions();
    setQuestions([]);
    setResults({});
  }

  return (
    <div className="view">
      <div className="lecturer-header">
        <h2>강의자 화면</h2>
        {questions.length > 0 && (
          <button className="clear-all" onClick={handleClearAll}>전체 삭제</button>
        )}
      </div>
      {!isBuiltInAIAvailable() && (
        <p className="warn">Gemini API 키가 설정되지 않았습니다 (.env 파일 확인 필요).</p>
      )}
      <p className="hint">질문을 더블클릭하면 번역 + 키워드가 표시됩니다.</p>
      <ul className="question-list">
        {questions.map((q) => {
          const r = results[q.id];
          return (
            <li key={q.id} onDoubleClick={() => handleDoubleClick(q)}>
              <div className="question-header">
                <span className="student-name">{q.name || '익명'}</span>
                <button
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(q.id);
                  }}
                  aria-label="질문 삭제"
                >
                  ×
                </button>
              </div>
              <div className="original">{q.text}</div>
              {r?.loading && <div className="loading">번역 중...</div>}
              {r?.error && <div className="error">오류: {r.error}</div>}
              {r?.translated && (
                <div className="result">
                  <div className="translated">{r.translated}</div>
                  <div className="keywords">#{r.keywords.replaceAll(',', ' #')}</div>
                </div>
              )}
            </li>
          );
        })}
        {questions.length === 0 && <li className="empty">아직 들어온 질문이 없습니다.</li>}
      </ul>
    </div>
  );
}
