// Gemini API로 번역 + 키워드 추출.
// Cloud Translation API는 결제 계정이 필요해서, 결제 없이 무료로 쓸 수 있는
// Gemini API(AI Studio 키)로 번역과 키워드 추출을 한 번에 처리합니다.

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL = 'gemini-3.5-flash-lite';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

export function isBuiltInAIAvailable() {
  return Boolean(API_KEY);
}

export async function translateAndExtractKeywords(text) {
  if (!API_KEY) {
    throw new Error('Gemini API 키가 설정되지 않았습니다. .env 파일에 VITE_GEMINI_API_KEY를 추가해주세요.');
  }

  const prompt =
    `다음 문장을 한국어로 번역하고, 핵심 키워드를 한국어로 1~2개만 뽑아줘.\n` +
    `다른 설명 없이 반드시 아래 JSON 형식으로만 답해:\n` +
    `{"translated": "번역 결과", "keywords": "키워드1, 키워드2"}\n\n` +
    `문장: "${text}"`;

  const res = await fetch(`${ENDPOINT}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API 오류 (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) throw new Error('Gemini 응답을 파싱할 수 없습니다.');

  const parsed = JSON.parse(raw);
  return { translated: parsed.translated, keywords: parsed.keywords };
}
