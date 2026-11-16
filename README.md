# translation-qa

강의 중에 유학생이 모국어로 질문을 보내면, 강의자 화면에 한국어 번역과 핵심 키워드가 함께 뜨는 웹 앱입니다.

한국어 수업에서 유학생은 질문을 한국어로 만들어야 한다는 부담 때문에 질문을 포기하는 경우가 많습니다. 학생은 자기 언어로 편하게 쓰고, 강의자는 번역문과 키워드만 보고 바로 답할 수 있게 하는 게 목표였습니다. 설치 없이 웹 주소만으로 쓸 수 있어야 해서 별도 서버 없이 만들었습니다.

- 배포: https://translation-qa-chi.vercel.app (학생 화면). 강의자 화면은 비밀 키가 붙은 강의자용 주소(QR코드)로만 열립니다.
- 논문: 최건우, 임세정, 「실시간 번역 및 키워드 추출 기반 다국어 강의 질의응답 시스템」, 2026년 제39회 한국전자통신학회 가을철학술대회 구두 발표

## 화면

| 학생 화면 | 강의자 화면 |
| --- | --- |
| <img src="docs/images/student.png" width="380"> | <img src="docs/images/lecturer.png" width="320"> |

학생이 질문을 보내면 강의자 화면 목록에 바로 추가되고, 강의자가 질문을 더블클릭하면 원문 아래에 번역문과 `#키워드`가 표시됩니다.

## 구조

<img src="docs/images/architecture.png" width="260" align="right">

- 학생 화면에서 보낸 질문은 Firebase Realtime Database의 `classes/{수업}/questions` 아래에 수업별로 저장됩니다. 저장 항목은 수업 이름, 질문, 이름, 시각(서버 시각), 세션 ID입니다.
- 강의자 화면은 `onChildAdded`로 새 질문을 구독하기 때문에 따로 API 서버를 두지 않았습니다.
- 강의자가 질문을 더블클릭하면 Vercel 서버리스 함수(`api/translate.js`)가 Gemini API(`gemini-3.5-flash-lite`)를 한 번 호출해서 번역문과 키워드 1~2개를 JSON으로 받습니다. API 키는 이 함수의 환경변수에만 있고 브라우저 코드에는 들어가지 않습니다.
- 배포는 Vercel(정적 호스팅 + 서버리스 함수)입니다. `main`에 푸시하면 자동으로 배포됩니다.

<br clear="right">

**기술 스택**: React 19, Vite, Firebase Realtime Database, Gemini API, Vercel

## 주요 기능

- 학생 화면(`/`)과 강의자 화면(`/lecturer`)을 경로로 분리해서, 학생은 다른 학생의 질문을 볼 수 없습니다.
- 학생용과 강의자용 QR코드를 하나씩 따로 나눠 줍니다. 강의자용 주소에는 비밀 키(`?key=`)가 붙어 있고, 키가 없거나 틀리면 강의자 화면과 번역 기능이 열리지 않습니다. 저장소에는 키의 SHA-256 해시(`src/config/lecturerKey.js`)만 있습니다.
- 학생은 선택 상자에서 수업 5개 중 하나를 골라 질문하고, 강의자는 선택 상자에서 고른 수업의 질문만 봅니다. 고른 수업은 주소(`?class=class1`)에 남아서 새로고침해도 유지됩니다. 학생 화면은 들어올 때마다 수업을 새로 고르게 해서, 여러 수업을 듣는 학생이 지난 수업을 그대로 고르는 실수를 줄였습니다. 강의자 화면은 마지막에 고른 수업을 브라우저에 기억합니다. 수업 이름은 `src/config/classes.js`에서 바꿉니다.
- 이름은 선택 입력입니다. 비워 두면 "익명"으로 표시됩니다.
- 질문을 보낸 뒤 10초 동안은 다시 보낼 수 없습니다. 마지막 전송 시각을 `localStorage`에 저장하기 때문에 새로고침해도 유지됩니다.
- 강의자는 질문을 하나씩 지우거나, 확인 창을 거쳐 전부 지울 수 있습니다.
- 질문은 최대 300자, 이름은 최대 30자입니다. 강의자 화면에는 최근 50개가 표시됩니다.

## 개발하면서 정한 것들

**온디바이스 AI 대신 Gemini API**

처음에는 Chrome에 내장된 Gemini Nano(Translator API, Prompt API)를 쓰려고 했습니다. API 비용이 없고 질문이 외부로 나가지 않는다는 점이 좋았습니다. 그런데 테스트 PC(Windows 11, Chrome 152)에서 모델 다운로드가 `pending` 상태에서 넘어가지 않았습니다. 네트워크, 방화벽, 프록시, 브라우저 프로필을 바꿔 봐도 해결되지 않았습니다. 학생마다 기기가 다른 강의실에서는 이런 실행 환경을 미리 보장하기 어렵다고 판단해서 클라우드 API로 바꿨습니다.

Google Cloud Translation API는 결제 계정 등록이 필요해서, 무료 등급이 있는 Gemini API를 선택했습니다.

**번역과 키워드를 한 번에**

번역과 키워드 추출을 따로 호출하지 않고 프롬프트 하나로 처리합니다. 응답 형식을 JSON(`{"translated": ..., "keywords": ...}`)으로 지정해서 파싱 오류를 줄였습니다. TextRank 같은 키워드 추출 방식은 언어마다 형태소 분석이 필요한데, LLM을 쓰면 어떤 언어로 질문이 들어와도 그대로 처리할 수 있습니다.

**자동 번역 대신 더블클릭**

질문이 들어올 때마다 번역하면 질문 수만큼 API를 호출하게 됩니다. 무료 등급은 호출 횟수에 제한이 있어서, 강의자가 확인하려는 질문만 번역하도록 했습니다.

## 한계와 다음 단계

- 로그인은 두지 않았습니다(지도교수와 협의). 강의자 화면은 주소의 키로만 구분하기 때문에, 강의자용 주소가 퍼지면 누구나 들어갈 수 있습니다. 이때는 키를 새로 만들고 강의자용 QR코드를 다시 배포합니다.
- 같은 이유로 데이터베이스는 Firebase 설정값만 있으면 로그인 없이 읽고 쓸 수 있습니다. 보안 규칙은 수업 이름(class1~class5)과 질문 형식·길이만 검사합니다.
- 쿨타임은 클라이언트에서만 검사하기 때문에 우회할 수 있습니다.
- 수업 구분은 선택 상자 수준입니다. 누구나 다른 수업을 고를 수 있습니다.
- 번역 품질과 응답 시간은 아직 정량적으로 측정하지 않았습니다.

다음 단계는 실제 강의 시범운영입니다.

## 로컬에서 실행하기

1. Firebase 콘솔에서 프로젝트를 만들고 Realtime Database를 생성합니다.
   - 웹 앱 설정값을 `src/services/firebaseConfig.js`에 넣습니다.
   - Realtime Database 규칙 탭에 `firebase.rules.json` 내용을 붙여넣고 게시합니다.
2. https://aistudio.google.com/apikey 에서 Gemini API 키를 발급받습니다.
   - 루트에 `.env` 파일을 만들고 `GEMINI_API_KEY=발급받은키`를 넣습니다. `VITE_`를 붙이면 키가 브라우저 코드에 들어가니 붙이지 않습니다. `.env`는 커밋되지 않습니다.
3. 실행합니다.
   ```
   npm install
   npm run dev
   ```
   `npm run dev`에서도 `/api/translate`가 동작하도록 `vite.config.js`에서 같은 함수를 연결해 두었습니다. `.env`를 바꾼 뒤에는 개발 서버를 다시 켜야 반영됩니다.
4. 강의자 화면은 `/lecturer?key=키`로 엽니다. 키는 직접 정한 문자열이고, 그 SHA-256 해시를 `src/config/lecturerKey.js`에 넣습니다.

Vercel에 배포할 때는 프로젝트 설정의 Environment Variables에 `GEMINI_API_KEY`를 추가하고 다시 배포합니다.

## 폴더 구조

```
api/
  translate.js             서버리스 함수: 강의자 키 확인 후 Gemini API 호출 (번역 + 키워드)
src/
  config/
    classes.js             수업 5개의 id와 이름
    lecturerKey.js         강의자 키의 해시
  services/
    firebaseConfig.js      Firebase 연결 정보
    questionRepository.js  질문 저장·구독·삭제
    translator.js          /api/translate 호출
  StudentView.jsx          학생 화면
  LecturerView.jsx         강의자 화면
  App.jsx                  경로에 따라 학생/강의자 화면 선택
```
