import { CLASSES } from './config/classes';

// english: 학생 화면용 — 안내 문구와 수업 이름을 영어로 표시
export default function ClassSelect({ value, onChange, english = false }) {
  return (
    <select className="class-select" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">{english ? 'Select your class' : '수업을 선택하세요'}</option>
      {CLASSES.map((c) => (
        <option key={c.id} value={c.id}>{english ? c.en : c.name}</option>
      ))}
    </select>
  );
}
