# 번역 Q&A 프로토타입 (하이브리드 구조)

학생이 모국어로 질문을 보내면 강의자 화면에 실시간으로 뜨고, 더블클릭하면 Chrome 내장 AI로
번역 + 핵심 키워드 1~2개가 표시되는 프로토타입입니다. 백엔드 서버 없이 Firebase Realtime DB(중계) +
Chrome 내장 AI(번역·요약, 강의자 PC 로컬)로 구성됩니다.

## 처음 세팅하는 법

1. **Firebase 프로젝트 준비**
   - https://console.firebase.google.com 에서 프로젝트 생성
   - Build → Realtime Database 생성
   - 프로젝트 설정 → 일반 → 앱 추가(웹) 에서 나오는 설정값을 `src/services/firebaseConfig.js`에 붙여넣기
   - Realtime Database → 규칙 탭에 이 저장소의 `firebase.rules.json` 내용을 붙여넣고 게시

2. **패키지 설치 및 실행**
   ```
   npm install
   npm run dev
   ```

3. **Chrome 내장 AI 확인** (강의자 화면 테스트용 PC에서)
   - 최신 Chrome 필요
   - 주소창에 `chrome://on-device-internals` 입력해서 모델 상태 확인
   - 안 되면 `chrome://flags` 에서 `optimization guide`, `prompt api` 로 검색해서 관련 옵션 활성화 후 재시작

## 구조

```
src/
  services/
    firebaseConfig.js   — Firebase 프로젝트 연결 정보 (직접 채워넣어야 함)
    questionRepository.js — 학생↔강의자 질문 데이터 송수신 (리포지토리 패턴)
    translator.js        — Chrome 내장 AI로 번역 + 키워드 추출
  StudentView.jsx        — 학생 화면 (질문 입력)
  LecturerView.jsx       — 강의자 화면 (질문 목록 + 번역)
  App.jsx                — 화면 전환(프로토타입용 — 실제로는 URL/역할로 분리 예정)
```

## 배포 (Vercel)

```
npm install -g vercel
vercel
```
루트 디렉토리 그대로 두고 프레임워크 프리셋은 Vite로 자동 인식됩니다.

## 아직 미해결

- 강의자 답변을 학생 언어로 재번역하는 기능 없음 (범위 밖)
- 학생 구분: 완전 익명 vs 익명 태그 — 미정 (`sessionId`만 저장 중)
- 연속 전송 쿨타임: 현재 미구현 — Security Rules 또는 클라이언트에서 추가 필요
