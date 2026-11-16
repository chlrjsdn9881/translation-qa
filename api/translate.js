// Vercel 서버리스 함수 — Gemini API로 번역 + 키워드 추출.
// API 키를 브라우저 코드에 넣지 않으려고 이 함수에서만 호출합니다 (환경변수 GEMINI_API_KEY).
// 강의자 주소의 키(?key=)가 맞는 요청만 처리해서, 아무나 이 함수로 API를 쓰지 못하게 합니다.
import { createHash } from 'node:crypto';
import { LECTURER_KEY_HASH } from '../src/config/lecturerKey.js';

const MODEL = 'gemini-3.5-flash-lite';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
const MAX_LENGTH = 300;

const fail = (status, error) => ({ status, body: { error } });

// 요청 본문을 받아 { status, body }를 돌려줌 (로컬 개발 서버에서도 같은 함수를 씀)
export async function translate(body, apiKey) {
  const { text, key } = body || {};
  if (typeof key !== 'string' || createHash('sha256').update(key).digest('hex') !== LECTURER_KEY_HASH) {
    return fail(403, '강의자용 주소로 접속해야 번역할 수 있습니다.');
  }
  if (typeof text !== 'string' || !text.trim() || text.length > MAX_LENGTH) {
    return fail(400, `번역할 질문은 1~${MAX_LENGTH}자여야 합니다.`);
  }
  if (!apiKey) return fail(500, '서버에 GEMINI_API_KEY가 설정되지 않았습니다.');

  const prompt =
    `다음 문장을 한국어로 번역하고, 핵심 키워드를 한국어로 1~2개만 뽑아줘.\n` +
    `다른 설명 없이 반드시 아래 JSON 형식으로만 답해:\n` +
    `{"translated": "번역 결과", "keywords": "키워드1, 키워드2"}\n\n` +
    `문장: "${text}"`;

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' },
    }),
  });
  if (!res.ok) return fail(502, `Gemini API 오류 (${res.status})`);

  const data = await res.json();
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
  try {
    const parsed = JSON.parse(raw);
    return { status: 200, body: { translated: parsed.translated, keywords: parsed.keywords } };
  } catch {
    return fail(502, 'Gemini 응답을 파싱할 수 없습니다.');
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'POST만 지원합니다.' });
  }
  const { status, body } = await translate(req.body, process.env.GEMINI_API_KEY);
  return res.status(status).json(body);
}
