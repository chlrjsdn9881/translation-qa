# Hybrid Translation Q&A

강의 중 학생의 익명 질문을 Firebase Realtime Database로 실시간 전달하고, 강사 화면에서 한국어 번역과 핵심 키워드를 확인하는 React/Vite 앱입니다.

`lecture-translation-client`의 학생·강사 UI, Chrome AI 우선 처리와 온라인 번역 대체 로직을 `translation-qa` 저장소로 통합했습니다.

## 시작하기

1. `.env.example`을 `.env`로 복사하고 Firebase 웹 앱 설정값을 입력합니다.
2. Firebase Realtime Database를 만들고 `firebase.rules.json`의 규칙을 배포합니다.
3. 의존성을 설치하고 실행합니다.

```bash
npm install
npm run dev
```

프로덕션 빌드는 다음과 같습니다.

```bash
npm run build
```

## 구성

- 학생 화면: 최대 300자의 익명 질문 전송
- 강사 화면: 실시간 질문 목록, 선택·번역·키워드 확인
- 번역: Chrome 내장 AI를 우선 사용하고, 사용할 수 없으면 MyMemory 번역 API로 대체
- 데이터 전달: Firebase Realtime Database

`.env`에는 Firebase 설정이 포함될 수 있으므로 Git에 올리지 않습니다. 공유가 필요한 설정 키 목록은 `.env.example`에 있습니다.
