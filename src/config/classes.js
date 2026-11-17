// 수업 목록
// - name: 강의자 화면 선택 상자와 DB에 저장되는 수업 이름 (한국어)
// - en:   학생 화면 선택 상자에 보이는 수업 이름 (영어 — 유학생이 한국어를 몰라도 고를 수 있게)
// id는 Firebase 경로(classes/{id}/questions)로 쓰이고 보안 규칙의 허용 목록(class1~class5)과
// 맞춰야 하므로 바꾸지 않는다.
export const CLASSES = [
  { id: 'class1', name: '데이터베이스', en: 'Database' },
  { id: 'class2', name: '수업 2', en: 'Class 2' },
  { id: 'class3', name: '수업 3', en: 'Class 3' },
  { id: 'class4', name: '수업 4', en: 'Class 4' },
  { id: 'class5', name: '수업 5', en: 'Class 5' },
];

export function findClass(id) {
  return CLASSES.find((c) => c.id === id) || null;
}
