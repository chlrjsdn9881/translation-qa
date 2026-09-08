import React, {
  useEffect,
  useState,
} from "react";

import {
  subscribeToQuestions,
} from "./services/questionRepository";

import {
  checkChromeAI,
  translateAndExtractKeywords,
} from "./services/translator";

export default function LecturerPage() {
  // ----------------------------------------
  // 상태
  // ----------------------------------------

  // Firebase에서 받은 전체 질문
  const [questions, setQuestions] =
    useState([]);

  // 현재 선택한 질문
  const [selectedQuestion, setSelectedQuestion] =
    useState(null);

  // 번역 결과
  const [translation, setTranslation] =
    useState("");

  // 키워드
  const [keywords, setKeywords] =
    useState([]);

  // AI 처리 중
  const [processing, setProcessing] =
    useState(false);

  // AI 상태
  const [aiStatus, setAiStatus] =
    useState("확인 중...");

  // 오류 메시지
  const [errorMessage, setErrorMessage] =
    useState("");

  // ----------------------------------------
  // Chrome AI 상태 확인
  // ----------------------------------------
  useEffect(() => {
    const checkAI = async () => {
      try {
        const result =
          await checkChromeAI();

        if (result.available) {
          setAiStatus(
            "Chrome 내장 AI 사용 가능"
          );
        } else {
          setAiStatus(
            "온라인 번역 사용 가능"
          );
        }
      } catch (error) {
        console.error(
          "Chrome AI 확인 오류:",
          error
        );

        setAiStatus(
          "Chrome 내장 AI 확인 실패"
        );
      }
    };

    checkAI();
  }, []);

  // ----------------------------------------
  // Firebase 실시간 질문 구독
  // ----------------------------------------
  useEffect(() => {
    const unsubscribe =
      subscribeToQuestions(
        (newQuestions) => {
          setQuestions(newQuestions);
        }
      );

    // 페이지를 나갈 때 구독 해제
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // ----------------------------------------
  // 질문 선택
  // ----------------------------------------
  const handleSelectQuestion = (
    question
  ) => {
    setSelectedQuestion(question);

    // 이전 AI 결과 초기화
    setTranslation("");
    setKeywords([]);
    setErrorMessage("");
  };

  // ----------------------------------------
  // 질문 더블클릭
  // ----------------------------------------
  const handleDoubleClick = async (
    question
  ) => {
    setSelectedQuestion(question);

    setTranslation("");
    setKeywords([]);
    setErrorMessage("");
    setProcessing(true);

    try {
      // Chrome 내장 AI 실행
      const result =
        await translateAndExtractKeywords(
          question.text
        );

      setTranslation(
        result.translation || ""
      );

      setKeywords(
        Array.isArray(result.keywords)
          ? result.keywords.slice(0, 2)
          : []
      );
    } catch (error) {
      console.error(
        "AI 처리 오류:",
        error
      );

      setErrorMessage(
        error?.message ||
          "번역 처리 중 오류가 발생했습니다."
      );
    } finally {
      setProcessing(false);
    }
  };

  // ----------------------------------------
  // 시간 표시
  // ----------------------------------------
  const formatTime = (timestamp) => {
    if (!timestamp) {
      return "시간 확인 중";
    }

    const date =
      new Date(timestamp);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "시간 확인 중";
    }

    return date.toLocaleTimeString(
      "ko-KR",
      {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }
    );
  };

  // ----------------------------------------
  // 질문 번호
  // ----------------------------------------
  const getQuestionNumber = (
    index
  ) => {
    return questions.length - index;
  };

  return (
    <div className="page lecturer-page">

      {/* ========================================
          상단 헤더
      ======================================== */}
      <div className="lecturer-header">

        <div>
          <h1>
            강의자 질문 관리
          </h1>

          <p>
            학생들의 질문을 실시간으로 확인하세요.
          </p>
        </div>

        {/* AI 상태 */}
        <div className="ai-status">
          <span className="ai-status-dot"></span>

          <span>
            {aiStatus}
          </span>
        </div>
      </div>


      {/* ========================================
          메인 영역
      ======================================== */}
      <div className="lecturer-content">

        {/* ======================================
            왼쪽 - 질문 목록
        ====================================== */}
        <section className="question-list-section">

          <div className="section-header">
            <div>
              <h2>
                실시간 질문
              </h2>

              <span className="question-count">
                {questions.length}개
              </span>
            </div>

            <span className="realtime-label">
              ● 실시간
            </span>
          </div>


          {/* 질문이 없는 경우 */}
          {questions.length === 0 ? (
            <div className="empty-questions">

              <div className="empty-icon">
                💬
              </div>

              <h3>
                아직 질문이 없습니다.
              </h3>

              <p>
                학생이 질문을 보내면
                이곳에 실시간으로 표시됩니다.
              </p>

            </div>
          ) : (

            /* 질문 목록 */
            <div className="question-list">

              {[...questions]
                .reverse()
                .map(
                  (
                    question,
                    index
                  ) => {

                    const isSelected =
                      selectedQuestion?.id ===
                      question.id;

                    return (
                      <div
                        key={
                          question.id
                        }
                        className={`question-item ${
                          isSelected
                            ? "selected"
                            : ""
                        }`}
                        onClick={() =>
                          handleSelectQuestion(
                            question
                          )
                        }
                        onDoubleClick={() =>
                          handleDoubleClick(
                            question
                          )
                        }
                      >

                        {/* 질문 번호 */}
                        <div className="question-number">
                          {getQuestionNumber(
                            index
                          )}
                        </div>


                        {/* 질문 내용 */}
                        <div className="question-content">

                          <div className="question-text">
                            {question.text}
                          </div>

                          <div className="question-meta">

                            <span>
                              {formatTime(
                                question.timestamp
                              )}
                            </span>

                            <span className="anonymous-label">
                              익명
                            </span>

                          </div>

                        </div>


                        <button
                          type="button"
                          className="question-action"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleDoubleClick(question);
                          }}
                          disabled={processing}
                        >
                          번역하기
                        </button>

                      </div>
                    );
                  }
                )}

            </div>
          )}

        </section>


        {/* ======================================
            오른쪽 - 질문 분석 결과
        ====================================== */}
        <section className="answer-section">

          <div className="section-header">
            <h2>
              질문 분석
            </h2>
          </div>


          {/* 질문을 선택하지 않은 경우 */}
          {!selectedQuestion ? (

            <div className="analysis-empty">

              <div className="analysis-empty-icon">
                🤖
              </div>

              <h3>
                질문을 선택해주세요.
              </h3>

              <p>
                질문의 번역하기를 누르면
                한국어 번역과 핵심 키워드를
                확인할 수 있습니다.
              </p>

            </div>

          ) : (

            <div className="analysis-content">

              {/* ----------------------------------
                  원문 질문
              ---------------------------------- */}
              <div className="analysis-block">

                <div className="analysis-label">
                  학생 질문
                </div>

                <div className="original-question">
                  {selectedQuestion.text}
                </div>

              </div>


              {/* ----------------------------------
                  번역 결과
              ---------------------------------- */}
              <div className="analysis-block">

                <div className="analysis-label">
                  한국어 번역
                </div>

                {processing ? (

                  <div className="processing-box">

                    <div className="loading-spinner"></div>

                    <span>
                      질문을
                      번역하고 있습니다...
                    </span>

                  </div>

                ) : errorMessage ? (

                  <div className="error-box">
                    {errorMessage}
                  </div>

                ) : translation ? (

                  <div className="translation-result">
                    {translation}
                  </div>

                ) : (

                  <div className="empty-result">
                    질문의 번역하기를 누르면
                    번역 결과가 표시됩니다.
                  </div>

                )}

              </div>


              {/* ----------------------------------
                  키워드
              ---------------------------------- */}
              <div className="analysis-block">

                <div className="analysis-label">
                  핵심 키워드
                </div>

                {processing ? (

                  <div className="empty-result">
                    키워드를 추출하고 있습니다...
                  </div>

                ) : keywords.length > 0 ? (

                  <div className="keyword-list">

                    {keywords
                      .slice(0, 2)
                      .map(
                        (
                          keyword,
                          index
                        ) => (
                          <span
                            key={`${keyword}-${index}`}
                            className="keyword"
                          >
                            {keyword}
                          </span>
                        )
                      )}

                  </div>

                ) : (

                  <div className="empty-result">
                    질문의 번역하기를 누르면
                    핵심 키워드가 표시됩니다.
                  </div>

                )}

              </div>


              {/* ----------------------------------
                  AI 안내
              ---------------------------------- */}
              <div className="ai-info">

                <span>
                  ✨
                </span>

                <p>
                  Chrome 내장 AI를 우선 사용하며, 지원하지 않는 환경에서는
                  온라인 번역 서비스로 자동 처리됩니다.
                </p>

              </div>

            </div>
          )}

        </section>

      </div>


      {/* ========================================
          하단 안내
      ======================================== */}
      <div className="lecturer-footer">

        <span>
          💡
        </span>

        <span>
          질문의 번역하기를 누르면
          한국어 번역과 핵심 키워드가 표시됩니다.
        </span>

      </div>

    </div>
  );
}
