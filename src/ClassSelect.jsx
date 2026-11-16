import { CLASSES } from './config/classes';

export default function ClassSelect({ value, onChange }) {
  return (
    <select className="class-select" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">수업을 선택하세요</option>
      {CLASSES.map((c) => (
        <option key={c.id} value={c.id}>{c.name}</option>
      ))}
    </select>
  );
}
