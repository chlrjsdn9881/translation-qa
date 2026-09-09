const AI_TIMEOUT_MS = 30000;
const TRANSLATION_TIMEOUT_MS = 15000;
const MY_MEMORY_API_URL = "https://api.mymemory.translated.net/get";

function withTimeout(promise, ms, message) {
  let timeoutId;

  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(message));
    }, ms);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeoutId);
  });
}

export async function checkChromeAI() {
  if (
    typeof window === "undefined" ||
    !("LanguageModel" in window)
  ) {
    return {
      available: false,
      status: "unsupported",
    };
  }

  try {
    const status = await withTimeout(
      window.LanguageModel.availability(),
      AI_TIMEOUT_MS,
      "Chrome AI 상태 확인 시간이 초과되었습니다."
    );

    return {
      available: status !== "unavailable",
      status,
    };
  } catch (error) {
    console.error("Chrome AI 상태 확인 실패:", error);

    return {
      available: false,
      status: "error",
      error,
    };
  }
}

export async function translateAndExtractKeywords(text) {
  if (!text || !text.trim()) {
    throw new Error("분석할 질문이 없습니다.");
  }

  const cleanText = text.trim();

  if (cleanText.length > 300) {
    throw new Error("질문은 300자 이내여야 합니다.");
  }

  if (isKorean(cleanText)) {
    return { translation: cleanText, keywords: extractKeywords(cleanText) };
  }

  if (
    typeof window === "undefined" ||
    !("LanguageModel" in window)
  ) {
    return translateWithMyMemory(cleanText);
  }

  let availability;
  try {
    availability = await withTimeout(
      window.LanguageModel.availability(),
      AI_TIMEOUT_MS,
      "Chrome AI 모델 준비 시간이 초과되었습니다. 모델 다운로드 상태를 확인해주세요."
    );
  } catch {
    return translateWithMyMemory(cleanText);
  }

  if (availability === "unavailable") {
    return translateWithMyMemory(cleanText);
  }

  const responseSchema = {
    type: "object",
    properties: {
      translation: {
        type: "string",
        description: "학생의 질문을 자연스러운 한국어로 번역한 문장",
      },
      keywords: {
        type: "array",
        description: "질문의 핵심 내용을 나타내는 키워드 1~2개",
        items: { type: "string" },
        minItems: 1,
        maxItems: 2,
      },
    },
    required: ["translation", "keywords"],
    additionalProperties: false,
  };

  let session;

  try {
    session = await withTimeout(
      window.LanguageModel.create({
        initialPrompts: [
          {
            role: "system",
            content: `
너는 대학 강의의 다국어 질문을 처리하는 AI이다.

학생이 외국어로 질문하면 다음 두 가지를 수행한다.

1. 질문의 의미를 정확하게 이해하고 자연스러운 한국어로 번역한다.
2. 질문의 핵심 내용을 나타내는 키워드를 1~2개만 추출한다.

규칙:
- 질문의 의미를 임의로 추가하지 않는다.
- 질문의 의미를 생략하지 않는다.
- 번역은 강의자가 이해하기 쉬운 자연스러운 한국어로 작성한다.
- 키워드는 질문의 핵심 주제 또는 개념을 선택한다.
- 키워드는 짧은 명사 또는 명사구로 작성한다.
- 키워드는 반드시 1~2개만 반환한다.
- 결과는 반드시 지정된 JSON 형식을 따른다.
            `.trim(),
          },
        ],
      }),
      AI_TIMEOUT_MS,
      "Chrome AI 세션 생성 시간이 초과되었습니다."
    );

    const result = await withTimeout(
      session.prompt(
        `
다음 학생의 질문을 처리해줘.

학생 질문:
${cleanText}

한국어 번역과 핵심 키워드 1~2개를 반환해줘.
        `.trim(),
        {
          responseConstraint: responseSchema,
        }
      ),
      AI_TIMEOUT_MS,
      "Chrome AI 번역 요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요."
    );

    let parsedResult;

    try {
      parsedResult = JSON.parse(result);
    } catch {
      console.error("AI JSON 변환 실패:", result);
      throw new Error("AI가 올바른 형식의 결과를 반환하지 않았습니다.");
    }

    const translation =
      typeof parsedResult.translation === "string"
        ? parsedResult.translation.trim()
        : "";

    const keywords = Array.isArray(parsedResult.keywords)
      ? parsedResult.keywords
          .filter(
            (keyword) => typeof keyword === "string" && keyword.trim()
          )
          .map((keyword) => keyword.trim())
          .slice(0, 2)
      : [];

    if (!translation) {
      throw new Error("한국어 번역 결과가 없습니다.");
    }

    return { translation, keywords };
  } catch (error) {
    console.error("Chrome AI 처리 실패:", error);
    try {
      return await translateWithMyMemory(cleanText);
    } catch (fallbackError) {
      throw new Error(
        fallbackError?.message || error?.message || "번역 처리 중 오류가 발생했습니다."
      );
    }
  } finally {
    if (session) {
      try {
        session.destroy();
      } catch {
        // 세션 종료 오류 무시
      }
    }
  }
}

function isKorean(text) {
  return /[\uac00-\ud7a3]/.test(text);
}

function extractKeywords(text) {
  const stopWords = new Set([
    "the", "and", "for", "with", "that", "this", "what", "when", "where",
    "how", "why", "are", "was", "were", "can", "could", "would", "please",
  ]);
  const words = text.toLowerCase().match(/[\p{L}\p{N}]{2,}/gu)
    ?.filter((word) => !stopWords.has(word)) ?? [];

  return [...new Set(words)].slice(0, 2);
}

async function translateWithMyMemory(text) {
  const url = new URL(MY_MEMORY_API_URL);
  url.searchParams.set("q", text);
  url.searchParams.set("langpair", "autodetect|ko");

  const response = await withTimeout(
    fetch(url),
    TRANSLATION_TIMEOUT_MS,
    "번역 서버 응답 시간이 초과되었습니다."
  );
  if (!response.ok) throw new Error("번역 서버에 연결하지 못했습니다.");

  const data = await response.json();
  const translation = data?.responseData?.translatedText?.trim();
  if (!translation || data?.responseStatus !== 200) {
    throw new Error(data?.responseDetails || "번역 결과를 받지 못했습니다.");
  }

  return { translation, keywords: extractKeywords(text) };
}
