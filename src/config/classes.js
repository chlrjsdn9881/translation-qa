// 수업 목록 — name만 바꾸면 학생·강의자 화면의 선택 상자와 DB에 저장되는 수업 이름이 바뀐다.
// id는 Firebase 경로(classes/{id}/questions)로 쓰이고 보안 규칙의 허용 목록(class1~class5)과
// 맞춰야 하므로 바꾸지 않는다.
export const CLASSES = [
  { id: 'class1', name: '수업 1' },
  { id: 'class2', name: '수업 2' },
  { id: 'class3', name: '수업 3' },
  { id: 'class4', name: '수업 4' },
  { id: 'class5', name: '수업 5' },
];

export function findClass(id) {
  return CLASSES.find((c) => c.id === id) || null;
}
