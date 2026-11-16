// 번역 + 키워드 추출 요청.
// Gemini API 키를 브라우저에 두지 않도록, 서버리스 함수(/api/translate)를 거쳐 호출합니다.
// lecturerKey는 강의자 주소의 ?key= 값으로, 함수가 강의자 요청인지 확인하는 데 씁니다.
export async function translateAndExtractKeywords(text, lecturerKey) {
  const res = await fetch('/api/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, key: lecturerKey }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `번역 요청 실패 (${res.status})`);
  return { translated: data.translated, keywords: data.keywords };
}
