import { useEffect, useState } from 'react';
import { subscribeToQuestions } from './services/questionRepository';
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

  return (
    <div className="view">
      <h2>강의자 화면</h2>
      {!isBuiltInAIAvailable() && (
        <p className="warn">이 브라우저는 Chrome 내장 AI를 지원하지 않습니다 (최신 Chrome 필요).</p>
      )}
      <p className="hint">질문을 더블클릭하면 번역 + 키워드가 표시됩니다.</p>
      <ul className="question-list">
        {questions.map((q) => {
          const r = results[q.id];
          return (
            <li key={q.id} onDoubleClick={() => handleDoubleClick(q)}>
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
