import { useEffect, useState } from 'react';
import { subscribeToQuestions, deleteQuestion, clearAllQuestions } from './services/questionRepository';
import { translateAndExtractKeywords, isBuiltInAIAvailable } from './services/translator';
import { findClass } from './config/classes';
import ClassSelect from './ClassSelect';
import { useSelectedClass } from './useSelectedClass';

export default function LecturerView() {
  const [classId, setClassId] = useSelectedClass('lecturerClass');
  const [questions, setQuestions] = useState([]);
  const [results, setResults] = useState({}); // id -> { translated, keywords, loading, error }

  // 선택한 수업의 질문만 구독 — 수업을 바꾸면 이전 수업 구독은 해제됨
  useEffect(() => {
    if (!classId) return undefined;
    const unsubscribe = subscribeToQuestions(classId, (q) => {
      setQuestions((prev) => [q, ...prev]);
    });
    return unsubscribe;
  }, [classId]);

  function handleClassChange(id) {
    setQuestions([]);
    setResults({});
    setClassId(id);
  }

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
    await deleteQuestion(classId, id);
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    setResults((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  async function handleClearAll() {
    if (!window.confirm(`'${findClass(classId).name}' 질문을 전부 삭제할까요? 되돌릴 수 없습니다.`)) return;
    await clearAllQuestions(classId);
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
      <ClassSelect value={classId} onChange={handleClassChange} />
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
        {!classId && <li className="empty">수업을 선택하면 그 수업의 질문이 표시됩니다.</li>}
        {classId && questions.length === 0 && <li className="empty">아직 들어온 질문이 없습니다.</li>}
      </ul>
    </div>
  );
}
