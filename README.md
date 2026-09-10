# 번역 Q&A 프로토타입 (하이브리드 구조)

학생이 모국어로 질문을 보내면 강의자 화면에 실시간으로 뜨고, 더블클릭하면 Gemini API로
번역 + 핵심 키워드 1~2개가 표시되는 프로토타입입니다. 백엔드 서버 없이 Firebase Realtime DB(중계) +
Gemini API(번역·키워드 추출)로 구성됩니다.

> 원래는 Chrome 내장 온디바이스 AI(Translator/Prompt API)로 완전 무료·로컬 처리를 시도했으나,
> 테스트 PC에서 `chrome://on-device-internals` 기준 모델 다운로드가 계속 `pending`으로 멈춰
> (네트워크/방화벽/프록시/프로필 전부 정상인데도 원인 불명) Gemini API 호출 방식으로 전환했습니다.

## 처음 세팅하는 법

1. **Firebase 프로젝트 준비**
   - https://console.firebase.google.com 에서 프로젝트 생성
   - Build → Realtime Database 생성
   - 프로젝트 설정 → 일반 → 앱 추가(웹) 에서 나오는 설정값을 `src/services/firebaseConfig.js`에 붙여넣기
   - Realtime Database → 규칙 탭에 이 저장소의 `firebase.rules.json` 내용을 붙여넣고 게시

2. **Gemini API 키 준비**
   - https://aistudio.google.com/apikey 에서 키 발급 (결제 계정 불필요, 무료 등급 존재)
   - 루트에 `.env` 파일 생성 후 `VITE_GEMINI_API_KEY=발급받은키` 추가 (`.gitignore`에 포함되어 있어 커밋 안 됨)
   - 키 노출 위험을 줄이려면 AI Studio/Cloud Console에서 해당 키에 HTTP 리퍼러 제한(배포 도메인 + localhost)을 걸어둘 것

3. **패키지 설치 및 실행**
   ```
   npm install
   npm run dev
   ```
   `.env`를 새로 만들거나 수정한 뒤에는 Vite를 재시작해야 반영됩니다.

## 구조

```
src/
  services/
    firebaseConfig.js   — Firebase 프로젝트 연결 정보 (직접 채워넣어야 함)
    questionRepository.js — 학생↔강의자 질문 데이터 송수신 (리포지토리 패턴)
    translator.js        — Gemini API로 번역 + 키워드 추출 (VITE_GEMINI_API_KEY 필요)
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
Vercel 프로젝트 설정 → Environment Variables 에 `VITE_GEMINI_API_KEY` 추가 필요.

## 아직 미해결

- 강의자 답변을 학생 언어로 재번역하는 기능 없음 (범위 밖)
- 학생 구분: 완전 익명 vs 익명 태그 — 미정 (`sessionId`만 저장 중)
- 연속 전송 쿨타임: 현재 미구현 — Security Rules 또는 클라이언트에서 추가 필요
