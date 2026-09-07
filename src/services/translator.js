// Chrome 내장 AI(Gemini Nano) 기반 번역 + 키워드 추출.
// 강의자 PC의 Chrome에서만 동작합니다 (chrome://on-device-internals 에서 모델 상태 확인 가능).

export function isBuiltInAIAvailable() {
  return 'Translator' in self && 'LanguageModel' in self;
}

// 다운로드 진행률을 onProgress(percent)로 알려줌 (선택)
function withProgress(onProgress) {
  if (!onProgress) return undefined;
  return (monitor) => {
    monitor.addEventListener('downloadprogress', (e) => {
      onProgress(Math.round(e.loaded * 100));
    });
  };
}

export async function translateAndExtractKeywords(text, { onProgress } = {}) {
  if (!isBuiltInAIAvailable()) {
    throw new Error('이 브라우저는 Chrome 내장 AI를 지원하지 않습니다. 최신 Chrome에서 실행해주세요.');
  }

  const translator = await Translator.create({
    sourceLanguage: 'en',
    targetLanguage: 'ko',
    monitor: withProgress(onProgress),
  });
  const translated = await translator.translate(text);

  const session = await LanguageModel.create({ monitor: withProgress(onProgress) });
  const keywordPrompt =
    `다음 문장에서 핵심 키워드를 한국어로 1~2개만 뽑아서 쉼표로 구분해 답해줘. 다른 설명은 붙이지 마.\n\n문장: "${text}"`;
  const keywords = await session.prompt(keywordPrompt);

  return { translated, keywords: keywords.trim() };
}
