// 강의자 주소(QR코드)에 붙는 비밀 키(?key=)의 SHA-256 해시.
// 키 자체는 저장소에 두지 않고, 강의자용 QR코드와 링크에만 들어갑니다.
// 키를 바꾸려면 새 키의 해시로 이 값을 바꾸고 강의자용 QR코드를 다시 만듭니다.
export const LECTURER_KEY_HASH = 'bcba489d0d63419db9e23a35affbd68a801e66172106892bbea424945793acae';
