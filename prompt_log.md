# Prompt Log - AI 도구 사용 기록

이 파일은 프로젝트 개발 과정에서 사용한 AI 도구(Cursor, ChatGPT 등)의 주요 프롬프트와 활용 내역을 기록합니다.

## 프로젝트 초기 설정

### 2025-06-25 16:30 - 모노레포 구조 설정

**프롬프트**: "notepad의 내용을 전체적으로 확인하고 모노레포로 프로젝트를 구성할거니까 그에 맞게 폴더생성하고 프로젝트 세팅해줘"

**활용 내역**:

- 모노레포 구조 설계 및 구현
- 프론트엔드(React + Vite + TypeScript) 프로젝트 초기화
- 백엔드(Node.js + Express + TypeScript) 프로젝트 초기화
- 필요한 의존성 패키지 설치
- 기본 문서 파일 생성

**결과**:

- 모노레포 워크스페이스 설정 완료
- client/server 폴더 구조 생성
- 기본 package.json 설정
- README.md 및 prompt_log.md 생성

---

## 프론트엔드 개발

### 2025-06-25 17:30 - 지원자 정보 입력 폼 구현

**프롬프트**: "2.1.1 지원자 정보 입력 폼 만들거야 일단 client부터 만들어"

**활용 내역**:

- TypeScript 타입 정의 (ApplicantInfo, Answer, TestResult)
- React Hook Form + Yup을 활용한 폼 유효성 검증
- Tailwind CSS로 반응형 UI 디자인
- 입력 필드: 이름, 이메일, 연락처 (전화번호 정규식 검증)

**결과**:

- `client/src/types/index.ts`: 프로젝트 타입 정의
- `client/src/pages/ApplicantForm.tsx`: 지원자 정보 입력 폼 컴포넌트
- App.tsx 통합 및 상태 관리

### 2025-06-25 17:45 - UI/UX 개선

**프롬프트**: "반응형 디자인이 요구사항인데 지금 모바일 사이즈로 되어있어. "이 지원자, 괜찮을까" 이 문구는 뺴고 그리고 "다음 단계로" 버튼은 배경색과 글자색이 거의 비슷해서 눈에 띄지 않으니까 수정해줘"

**활용 내역**:

- 반응형 디자인 적용 (모바일, 태블릿, 데스크톱)
- 불필요한 브랜딩 문구 제거
- 버튼 접근성 및 시각적 개선
- 호버/포커스 상태 애니메이션 추가

**개선 사항**:

- 화면 크기별 최적화: `max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl`
- 텍스트 크기 반응형: `text-2xl sm:text-3xl lg:text-4xl`
- 버튼 스타일 개선: 파란색 계열로 변경, 그림자 효과 추가
- 입력 필드 호버 효과 추가

### 2025-06-25 18:00 - CSS 설정 문제 해결

**프롬프트**: "여전히 버튼 색상이 흰색에 가까운 회색인데 이거 css 제대로 작동하지 않는거 같아"

**문제 상황**:

- Tailwind CSS와 기본 Vite CSS 충돌
- 버튼 색상이 제대로 적용되지 않음
- 반응형 레이아웃이 작동하지 않음

**해결 방법**:

- `index.css`에서 기본 Vite 스타일 완전 제거
- `@import "tailwindcss"` 한 줄만 남김
- `App.css` 파일 삭제
- 인라인 스타일로 버튼 색상 강제 적용

### 2025-06-25 18:15 - 레이아웃 중앙 정렬 문제 해결

**프롬프트**: "여전히 왼쪽에 있네?"

**문제 해결**:

- 기본 CSS의 `body { display: flex; place-items: center; }` 제거
- 인라인 스타일로 Flexbox 중앙 정렬 강제 적용
- 반응형 크기 조정: `max-w-md md:max-w-lg lg:max-w-xl`

### 2025-06-25 18:20 - Tailwind CSS v4 호환성 수정

**프롬프트**: "'@tailwind components' is no longer available in v4. Use '@tailwind utilities' instead."

**해결 방법**:

- Tailwind CSS v4 문법에 맞게 수정
- `@tailwind base`, `@tailwind components`, `@tailwind utilities` 제거
- `@import "tailwindcss"` 한 줄로 통합

### 2025-06-25 18:25 - TypeScript 설정 오류 수정

**프롬프트**: "Unknown compiler option 'erasableSyntaxOnly'."

**해결 방법**:

- `tsconfig.app.json`에서 잘못된 옵션 제거
- TypeScript 컴파일러 호환성 확보

### 2025-06-25 18:30 - 연락처 유효성 검사 개선

**프롬프트**: "연락처 유효성 검사를 01012341234 이런식으로 바꿔줘"

**변경 사항**:

- 정규식: `/^01[016789]\d{8}$/` (하이픈 없는 11자리)
- 플레이스홀더: `"01012345678"`
- 에러 메시지 업데이트
- 하이픈 제거 로직 삭제

---

## 백엔드 개발

### 2025-06-25 19:00 - MongoDB 연결 및 API 구현

**프롬프트**: "일단 mongodb 연결해줘. 그리고 입력폼 작성후 "다음단계로" 버튼을 누르면 서버로 데이터를 전송하고 지원자 정보를 db에 저장하는 api를 만들어줘."

**활용 내역**:

#### 백엔드 구현

1. **MongoDB 모델 생성**

   - `server/src/models/Applicant.ts`: 지원자 정보 스키마 정의
   - 필드 유효성 검증 (이름 2-50자, 이메일 형식, 전화번호 패턴)
   - 이메일 중복 방지를 위한 유니크 인덱스
   - timestamps 자동 생성 (createdAt, updatedAt)

2. **컨트롤러 구현**

   - `server/src/controllers/applicantController.ts`: CRUD 작업 처리
   - createApplicant: 지원자 정보 저장 및 중복 체크
   - getAllApplicants: 지원자 목록 조회 (관리자용)
   - getApplicantById: 특정 지원자 조회
   - 상세한 에러 핸들링 및 응답 메시지

3. **라우트 설정**

   - `server/src/routes/applicants.ts`: RESTful API 엔드포인트 정의
   - POST /api/applicants: 지원자 정보 저장
   - GET /api/applicants: 목록 조회
   - GET /api/applicants/:id: 개별 조회

4. **서버 설정 업데이트**
   - `server/src/index.ts`: MongoDB 연결 및 라우트 등록
   - 환경변수 지원 (dotenv)
   - CORS 설정 및 JSON 파싱
   - 전역 에러 핸들링 및 404 처리

#### 프론트엔드 구현

1. **API 통신 유틸리티**

   - `client/src/utils/api.ts`: 서버 통신 함수
   - submitApplicantInfo: 지원자 정보 제출
   - getApplicants: 지원자 목록 조회
   - getApplicantById: 개별 지원자 조회
   - TypeScript 타입 안전성 확보

2. **폼 컴포넌트 업데이트**
   - `client/src/pages/ApplicantForm.tsx`: 서버 통신 로직 추가
   - useState를 활용한 에러/성공 상태 관리
   - 사용자 피드백 UI (성공/오류 메시지 컴포넌트)
   - 비동기 처리 및 로딩 상태

**구현 결과**:

#### API 엔드포인트

- **POST** `/api/applicants` - 지원자 정보 저장
- **GET** `/api/applicants` - 지원자 목록 조회
- **GET** `/api/applicants/:id` - 특정 지원자 조회

#### 데이터베이스 스키마

```typescript
interface IApplicant {
  name: string; // required, 2-50자, trim
  email: string; // required, unique, lowercase, email 형식
  phone: string; // required, 01[016789]\d{8} 형식
  createdAt: Date; // 자동 생성
  updatedAt: Date; // 자동 생성
}
```

#### 에러 처리 시스템

- MongoDB 유효성 검증 오류 (ValidationError)
- 이메일 중복 오류 (11000 에러 코드)
- 네트워크 오류 및 서버 오류 처리
- 클라이언트 사이드 에러 상태 관리

---

## AI 리포트 시스템 개선

### 2025-01-02 - AI 리포트 저장 오류 수정

**문제 상황**:
MongoDB에 AI 리포트가 저장되지 않는 문제 발생. 로그 분석 결과 다음과 같은 문제들을 확인:

1. **JSON 파싱 오류**: AI가 반환하는 JSON에 백틱(```) 포함
2. **데이터 타입 불일치**: 배열 형태로 반환되는 데이터가 문자열로 저장되려고 함
3. **스키마 검증 실패**: MongoDB 스키마와 실제 데이터 구조 불일치

**프롬프트**: "mongo db에 ai 리포팅이 저장되지 않았어 [...] log 첨부한거 확인해"

**해결 방법**:

#### 1. AI 응답 전처리 시스템 구현

````typescript
// JSON 파싱을 위한 전처리
let cleanContent = content.trim();

// 백틱으로 감싸진 경우 제거
if (cleanContent.startsWith("```json")) {
  cleanContent = cleanContent.replace(/^```json\s*/, "").replace(/\s*```$/, "");
} else if (cleanContent.startsWith("```")) {
  cleanContent = cleanContent.replace(/^```\s*/, "").replace(/\s*```$/, "");
}
````

#### 2. 데이터 구조 검증 및 기본값 설정

```typescript
// 데이터 구조 검증 및 기본값 설정
return {
  technicalAnalysis: {
    overallLevel: parsedData.technicalAnalysis?.overallLevel || "중",
    strengths: Array.isArray(parsedData.technicalAnalysis?.strengths)
      ? parsedData.technicalAnalysis.strengths
      : [],
    weaknesses: Array.isArray(parsedData.technicalAnalysis?.weaknesses)
      ? parsedData.technicalAnalysis.weaknesses
      : [],
    timeEfficiency: parsedData.technicalAnalysis?.timeEfficiency || "보통",
  },
  // ... 기타 필드들
};
```

#### 3. 안전한 폴백 시스템

```typescript
// 파싱 실패 시 기본 구조 반환
return {
  technicalAnalysis: {
    overallLevel: "중",
    strengths: ["분석 중"],
    weaknesses: ["분석 중"],
    timeEfficiency: "보통",
  },
  // ... 기본 구조
};
```

#### 4. 프롬프트 개선

- AI 시스템 메시지에 **백틱 사용 금지** 명시
- JSON 형식 강제를 위한 프롬프트 수정
- 응답 형식 가이드라인 강화

**개선된 파일들**:

- `server/src/utils/aiReportGenerator.ts`: AI 응답 파싱 로직 개선
- 두 함수 모두 동일한 안전장치 적용:
  - `generateAIReport()`: 리포트 생성 함수
  - `generateInterviewQuestions()`: 면접 질문 생성 함수

**결과**:

- AI 응답의 안정적인 파싱 보장
- MongoDB 저장 오류 해결
- 파싱 실패 시에도 기본 데이터 제공
- 사용자 경험 개선 (오류 시에도 서비스 중단 없음)
- 이메일 중복 오류 (E11000)
- 서버 내부 오류 (500)
- 네트워크 오류 처리

### 2025-01-28 - 인성 테스트 시스템 구현

**프롬프트**: "이제 인성테스트 페이지를 만들거야. mongo db에 컬렉션을 cooperates, responsibilities, leaderships 이렇게 3개를 만들었어. 각 문항은 아래와 같은 식으로 구성되어 있는데 여기서 id와 content만 뽑아서 컬렉션에서 모든 문항을 가져와서 무작위로 문항을 배치하는 api를 만들어. 총 문항수는 120문항이야. api를 모두 만들면 화면과 연결해줘"

**활용 내역**:

#### 백엔드 구현

1. **인성 테스트 모델 생성**

   - `server/src/models/PersonalityQuestion.ts`: 인성 테스트 문항 스키마
   - 3개 컬렉션 연결: cooperates, responsibilities, leaderships
   - 필드: item_number, content, scoring_criteria, reverse_scoring

2. **인성 테스트 컨트롤러**

   - `server/src/controllers/personalityController.ts`
   - `getPersonalityTestQuestions`: 3개 컬렉션에서 문항 조회 및 무작위 배치
   - `submitPersonalityTest`: 5점 척도 답변 저장
   - `resetPersonalityTest`: 개발용 데이터 리셋
   - 120문항 제한 및 카테고리 정보 포함

3. **라우트 시스템**
   - `server/src/routes/personality.ts`: 인성 테스트 API 라우트
   - GET `/questions`: 문항 조회
   - POST `/:applicantId/submit`: 답변 제출
   - DELETE `/:applicantId/reset`: 데이터 리셋

#### 프론트엔드 구현

1. **타입 정의 확장**

   - `client/src/types/index.ts`: PersonalityCategory, PersonalityQuestion, PersonalityTestData

2. **API 함수 추가**

   - `client/src/utils/api.ts`: getPersonalityTestQuestions, submitPersonalityTest

3. **인성 테스트 화면**

   - `client/src/pages/PersonalityTest.tsx`: 15분 타이머, 5점 리커트 척도 UI
   - 문항 네비게이션: 5x24 그리드로 120문항 표시
   - 진행률 표시 및 완료/미완료 상태 시각화
   - 3곳 제출 버튼: 헤더, 사이드바, 하단

4. **평가 완료 페이지**

   - `client/src/pages/EvaluationComplete.tsx`: 성공 완료 화면
   - 홈으로 돌아가기 기능

5. **라우팅 업데이트**
   - `App.tsx`: 새로운 라우트 추가
   - `/personality-test/:applicantId`, `/evaluation-complete/:applicantId`

**구현 특징**:

- 무작위 문항 배치: 서버에서 3개 컬렉션 통합 후 셔플링
- 5점 척도 시스템: "전혀 그렇지 않다" ~ "매우 그렇다"
- 실시간 진행률 표시
- 카테고리별 분류: 협업/책임감/리더십
- 소요시간 추적 및 저장
- 이메일 중복 체크 (Duplicate Key Error)
- 네트워크 연결 오류 처리
- 사용자 친화적 한글 오류 메시지
- HTTP 상태 코드별 적절한 응답

#### 사용자 피드백 UI

- 성공 메시지: 초록색 배경, 체크 아이콘
- 오류 메시지: 빨간색 배경, 경고 아이콘
- 로딩 상태: 스피너 애니메이션
- 자동 다음 단계 안내

**의존성 패키지 추가**:

- `mongoose`: MongoDB ODM
- `dotenv`: 환경변수 관리
- `@types/node`: Node.js 타입 정의

---

## 기술적 성과

### CSS 및 스타일링

- Tailwind CSS v4 완전 적용
- 기본 Vite CSS와의 충돌 해결
- 인라인 스타일을 활용한 확실한 스타일 적용
- 완전한 반응형 디자인 구현

### 폼 유효성 검증

- React Hook Form + Yup 조합 성공적 적용
- 실시간 유효성 검증 및 에러 메시지 표시
- 한국 휴대폰 번호 형식 정확한 검증

### 반응형 디자인

- 모바일 우선 설계 (Mobile-first)
- 브레이크포인트별 최적화 (md, lg 활용)
- 중앙 정렬 및 적절한 크기 조정

---

## 향후 AI 활용 계획

### 예정된 AI 활용 영역

1. **안내사항 페이지 구현**: 테스트 규칙 및 부정행위 방지 안내
2. **기술 역량 테스트**: 10문제 JSON 데이터 생성 및 타이머 구현
3. **인성 테스트**: 5문제 객관식 문제 및 채점 로직
4. **문제 데이터 생성**: JSON 형태의 기술/인성 문제 데이터 생성
5. **API 설계**: Express.js 라우트 및 컨트롤러 구현
6. **데이터베이스 모델**: MongoDB 스키마 설계
7. **면접 질문 생성**: 지원자 답변 기반 맞춤형 질문 생성 로직
8. **관리자 페이지**: 지원자 리스트 및 리포트 시각화

### AI 도구 활용 가이드라인

- 모든 생성된 코드는 프로젝트 요구사항에 맞게 수정
- 외부 라이브러리 사용 시 README.md에 출처 명시
- 한국어 주석 및 문서화 우선
- 코드 품질 및 TypeScript 타입 안정성 유지
- 반응형 디자인 및 접근성 고려
- CSS 충돌 방지 및 일관된 스타일링 적용

---

## 2025-01-16 면접 질문 생성 가이드라인 복원

### 문제 인식

- 백업 파일에 있던 상세한 면접 질문 생성 가이드라인이 현재 파일에서 누락됨
- 기존의 단순한 프롬프트로는 고품질의 맞춤형 면접 질문 생성이 어려움

### 복원된 기능들

#### 1. 기술 테스트 상세 분석 로직

```javascript
// 맞힌 문제 중 빠르게 해결한 문제 (심화 질문 대상)
const fastCorrectQuestions = correctQuestions
  .filter((q) => q.timeSpent < 60)
  .sort((a, b) => a.timeSpent - b.timeSpent)
  .slice(0, 3);

// 틀린 문제 (개념 확인 대상)
const incorrectQuestions = questionDetails.filter((q) => !q.isCorrect);

// 오래 걸린 문제 (문제해결 과정 질문 대상)
const slowQuestions = questionDetails
  .filter((q) => q.timeSpent > 120)
  .sort((a, b) => b.timeSpent - a.timeSpent)
  .slice(0, 3);
```

#### 2. 인성 테스트 심화 분석

```javascript
// 카테고리별 극단적 응답 분류
const extremeByCategory = {
  cooperate: personalityQuestionsWithContent.filter(
    (q) => q.category === "cooperate"
  ),
  responsibility: personalityQuestionsWithContent.filter(
    (q) => q.category === "responsibility"
  ),
  leadership: personalityQuestionsWithContent.filter(
    (q) => q.category === "leadership"
  ),
};

// 일반적인 응답 분석 (극단적 응답이 없는 경우 대비)
const generalResponsesByCategory = {
  cooperate: allPersonalityResponses.filter((q) => q.category === "cooperate"),
  // ... 각 카테고리별 평균 응답 계산
};
```

#### 3. 상세한 면접 질문 생성 가이드라인

**기술 질문 전략:**

1. 맞힌 문제 → 심화 질문 (예: "Java GC를 맞혔다면 → G1GC와 ZGC의 차이점")
2. 틀린 문제 → 개념 확인 (예: "XSS를 틀렸다면 → CSRF와의 차이점")
3. 오래 걸린 문제 → 문제 해결 과정 질문

**인성 질문 전략:**

1. **극단적 응답이 있는 경우**: 실제 문항 내용 인용하여 구체적 경험 확인

   - 선택 답변을 명시적으로 언급
   - 예: "'팀 프로젝트에서 중재 역할을 한다'에서 '매우 그렇다'를 선택하셨는데, 실제 중재 경험을 말씀해 주세요"

2. **극단적 응답이 없는 경우**: 해당 영역의 일반적 역량 확인

   - "극단적 응답이 없으셨는데" 같은 부정적 표현 금지
   - 구체적 경험 사례를 요구하는 질문 생성

3. **질문 생성 규칙**:
   - 역채점 문항 특성 고려
   - 추상적 질문("어떻게 생각하시나요?") 지양
   - 구체적 경험 사례 중심

#### 4. 향상된 프롬프트 구조

- 기술 테스트 상세 분석 섹션 추가
- 인성 테스트 극단적 응답 상세 분석 추가
- 면접 질문 생성 가이드라인 명시
- 질문 수량: 기술 6-8개, 인성 4-6개, 꼬리 3-4개

### 기대 효과

- 지원자의 실제 응답 패턴을 바탕으로 한 맞춤형 면접 질문
- 극단적 응답에 대한 구체적 근거 확인 가능
- 기술 역량의 강점/약점 영역별 차별화된 질문
- 면접관에게 실질적으로 도움이 되는 고품질 질문 생성

### 사용된 프롬프트 패턴

```
당신은 면접관을 위한 전문적인 질문 생성 전문가입니다.

=== 기술 테스트 상세 분석 ===
[맞힌 문제/틀린 문제/오래 걸린 문제 분석]

=== 인성 테스트 극단적 응답 상세 분석 ===
[협업/책임감/리더십별 극단적 응답 및 문항 내용]

=== 면접 질문 생성 가이드라인 ===
[기술/인성 질문 전략 및 생성 규칙]
```

이러한 구조화된 가이드라인을 통해 AI가 더욱 정교하고 실용적인 면접 질문을 생성할 수 있게 되었습니다.

---

## 2025-01-16 면접 질문 생성 로직 최종 개선

### 사용자 요구사항

- 실제 문항 내용을 최대 10개가 아닌 **모든 극단적 응답** 조회
- 극단적 응답이 있으면 해당 문항들을 **모두 질문으로 생성**
- 극단적 응답이 없으면 **각 카테고리에서 2개씩 랜덤 선택**하여 질문 생성
- 질문 형식을 더 구체적으로 개선: `"[문항 내용]" 항목에 "[선택 답변]"을 선택해주셨는데, 구체적인 경험이나 사례를 들어 설명해 주세요.`

### 주요 개선사항

#### 1. 극단적 응답 전체 조회

```javascript
// 기존: 최대 10개만 조회
for (const response of extremeResponses.slice(0, 10)) {

// 개선: 모든 극단적 응답 조회
for (const response of extremeResponses) {
```

#### 2. 랜덤 문항 선택 로직 추가

```javascript
// 극단적 응답이 없는 경우 각 카테고리에서 2개씩 랜덤 선택
if (extremeResponses.length === 0) {
  const cooperateQuestions = await CooperateQuestion.aggregate([
    { $sample: { size: 2 } },
  ]);
  const responsibilityQuestions = await ResponsibilityQuestion.aggregate([
    { $sample: { size: 2 } },
  ]);
  const leadershipQuestions = await LeadershipQuestion.aggregate([
    { $sample: { size: 2 } },
  ]);
}
```

#### 3. 4단계 강화된 JSON 파싱 시스템

```javascript
// 1차: 기본 정리
// 2차: 강력한 복구 함수 (한글 조사, 따옴표 처리)
// 3차: 정규식 추출 + 따옴표 밸런싱
// 4차: 수동 패턴 매칭 복구
```

#### 4. 질문 형식 표준화

**극단적 응답:**

- 형식: `"[문항 내용]" 항목에 "[선택 답변]"을 선택해주셨는데, 구체적인 경험이나 사례를 들어 설명해 주세요.`
- 예시: `"나는 팀 프로젝트에서 책임감을 가지고 리드한다." 항목에 "매우 그렇다"를 선택해주셨는데, 구체적인 경험이나 사례를 들어 설명해 주세요.`

**랜덤 선택:**

- 형식: `"[문항 내용]"와 관련해서 본인의 경험이나 사례를 구체적으로 말씀해 주세요.`
- 예시: `"나는 팀원들과의 의사소통에서 갈등을 잘 조율한다."와 관련해서 본인의 경험이나 사례를 구체적으로 말씀해 주세요.`

### 최종 질문 생성 전략

#### 극단적 응답이 있는 경우

- **모든** 극단적 응답 문항에 대해 개별 질문 생성
- 실제 문항 내용과 선택 답변을 명시적으로 언급
- 구체적인 경험과 사례 요구

#### 극단적 응답이 없는 경우

- 협업/책임감/리더십 각 카테고리에서 2개씩 랜덤 선택
- 총 6개의 랜덤 문항 기반 질문 생성
- 문항 내용을 언급하되 선택 답변은 언급하지 않음

### 기대 효과

- **완전한 맞춤형 질문**: 지원자의 모든 극단적 응답에 대한 구체적 확인
- **균형 잡힌 평가**: 극단적 응답이 없어도 각 영역별 2개씩 질문 확보
- **실용적인 질문**: 실제 문항 내용을 직접 인용하여 면접관이 쉽게 활용 가능
- **안정적인 생성**: 4단계 JSON 파싱으로 생성 실패율 대폭 감소

이제 지원자의 응답 패턴에 완벽하게 맞춤화된 면접 질문이 생성될 것입니다.

---

## 2025-01-16 면접 질문 생성 버그 수정

### 발견된 문제점

1. **극단적 응답 누락**: "나는 팀원의 기술적 도전을 격려하지 않는다"에 "매우 그렇다"로 답했음에도 해당 질문이 생성되지 않음
2. **지원자 답변 누락**: 생성된 질문에서 지원자가 실제로 선택한 답변이 질문에 포함되지 않음

### 근본 원인 분석

1. **잘못된 랜덤 보충 로직**: 극단적 응답이 있어도 전체가 0개일 때만 체크하여 랜덤 문항이 추가되지 않음
2. **질문 형식 불명확**: AI 프롬프트에서 지원자의 답변을 질문에 포함하라는 지시가 약함

### 수정사항

#### 1. 카테고리별 개별 체크 로직으로 변경

```javascript
// 기존: 전체 극단적 응답이 0개일 때만 랜덤 추가
if (extremeResponses.length === 0) {

// 수정: 각 카테고리별로 개별 체크
for (const category of categories) {
  const extremeCount = extremeByCategory[category.name].length;
  if (extremeCount < 2) {
    const needCount = 2 - extremeCount;
    // 부족한 만큼만 랜덤 보충
  }
}
```

#### 2. 질문 형식 표준화 강화

**기존 형식:**

```
"[문항 내용]" 항목에 "[선택 답변]"을 선택해주셨는데, 구체적인 경험이나 사례를 들어 설명해 주세요.
```

**개선된 형식:**

```
"[문항 내용]"에 대해 "[선택 답변]"라고 답변하셨는데, 구체적인 경험이나 사례를 말씀해 주세요.
```

#### 3. AI 시스템 메시지 강화

```
"극단적 응답 문항의 경우 지원자가 선택한 답변('매우 그렇다', '전혀 그렇지 않다' 등)을 반드시 질문에 포함시켜야 합니다."
```

#### 4. 타입 시스템 개선

```typescript
type QuestionWithContent = {
  questionId: string;
  category: string;
  content: string;
  selected_answer: number;
  reverse_scoring: boolean;
  final_score: number;
  isRandom?: boolean;
};
```

### 예상 결과

- **완전한 극단적 응답 포착**: 모든 1점/5점 응답이 질문으로 생성
- **명확한 질문 형식**: "'나는 팀원의 기술적 도전을 격려하지 않는다.'에 대해 '매우 그렇다'라고 답변하셨는데..."
- **균형 잡힌 질문 수**: 각 카테고리별 최소 2개씩 확보
- **정확한 맥락 제공**: 면접관이 지원자의 실제 답변을 알고 질문 가능

이제 지원자의 극단적 응답이 빠짐없이 포착되고, 실제 답변이 포함된 명확한 면접 질문이 생성될 것입니다.

---

## 최신 이슈: 극단적 응답 감지 실패 문제 (진행 중)

### 문제 상황

지원자가 명확한 극단적 응답을 했음에도 불구하고 AI 면접 질문 생성 시 해당 응답들이 반영되지 않고 있음.

**지원자의 실제 극단적 응답:**

1. "나는 팀 내에서 코드 품질 기준을 주도적으로 유지한다" → **"전혀 그렇지 않다"** (1점)
2. "나는 팀 내에서 새로운 아이디어를 공유하는 것을 즐긴다" → **"전혀 그렇지 않다"** (1점)
3. "나는 팀 프로젝트에서 역할 분담을 명확히 하는 데 관심이 없다" → **"매우 그렇다"** (5점)
4. "나는 팀 내에서 기술적 표준화를 주도한다" → **"전혀 그렇지 않다"** (1점)
5. "나는 팀 프로젝트에서 동료의 성공을 기뻐한다" → **"매우 그렇다"** (5점)

**실제 DB에 저장된 AI 질문:** 전혀 다른 랜덤 문항들 기반의 일반적인 질문들...

### 가능한 원인

1. 극단적 응답 필터링 로직이 작동하지 않음
2. 서버 재시작 없이 이전 코드가 실행되고 있음
3. 데이터 타입 불일치 (확인 완료: `selected_answer`는 `number` 타입)
4. 로그 미출력으로 인한 디버깅 어려움

### 추가한 디버깅 로그

```typescript
console.log("=== 극단적 응답 분석 ===");
console.log(
  "전체 인성 테스트 응답 수:",
  applicantData.personalityTest.questionDetails.length
);
console.log("극단적 응답 수:", extremeResponses.length);
console.log(
  "극단적 응답 상세:",
  extremeResponses.map((r) => ({
    questionId: r.questionId,
    category: r.category,
    selected_answer: r.selected_answer,
    reverse_scoring: r.reverse_scoring,
  }))
);

console.log("=== 카테고리별 극단적 응답 분류 ===");
console.log("협업 극단적 응답:", extremeByCategory.cooperate.length, "개");
console.log(
  "책임감 극단적 응답:",
  extremeByCategory.responsibility.length,
  "개"
);
console.log("리더십 극단적 응답:", extremeByCategory.leadership.length, "개");

extremeByCategory.cooperate.forEach((q) =>
  console.log(`협업: "${q.content}" (${q.selected_answer}점)`)
);
extremeByCategory.responsibility.forEach((q) =>
  console.log(`책임감: "${q.content}" (${q.selected_answer}점)`)
);
extremeByCategory.leadership.forEach((q) =>
  console.log(`리더십: "${q.content}" (${q.selected_answer}점)`)
);
```

### 해결 완료! ✅

**문제 원인 발견:**
라인 459-467에서 `extremeByCategory`를 `allQuestionsForAnalysis`로 다시 필터링하면서 극단적 응답이 랜덤 응답으로 덮어쓰여짐.

**해결 방법:**

1. `extremeByCategory`는 원래 극단적 응답만 유지
2. `randomByCategory`를 별도로 생성
3. `finalAnalysisData`에서 극단적 응답 + 랜덤 응답 결합
4. AI 프롬프트에는 `finalAnalysisData` 사용

**수정된 로직:**

```typescript
// 극단적 응답은 그대로 유지
const extremeByCategory = { ... };

// 랜덤 응답은 별도 관리
const randomByCategory = { ... };

// 최종 분석용 데이터 (극단적 + 랜덤)
const finalAnalysisData = {
  cooperate: [...extremeByCategory.cooperate, ...randomByCategory.cooperate],
  responsibility: [...extremeByCategory.responsibility, ...randomByCategory.responsibility],
  leadership: [...extremeByCategory.leadership, ...randomByCategory.leadership],
};
```

이제 지원자의 극단적 응답이 정확히 AI 프롬프트에 전달되어 맞춤형 면접 질문이 생성될 것입니다.

### 추가 문제 발견 및 해결 ✅

**문제:** 스프레드 연산자(`...response`) 사용 시 객체 속성이 `undefined`로 복사됨

**해결:** 명시적 속성 지정으로 변경

```typescript
// 기존 (문제)
personalityQuestionsWithContent.push({
  ...response,
  content: questionContent || "문항 내용을 찾을 수 없습니다.",
});

// 수정 (해결)
personalityQuestionsWithContent.push({
  questionId: response.questionId,
  category: response.category,
  selected_answer: response.selected_answer,
  reverse_scoring: response.reverse_scoring,
  final_score: response.final_score,
  content: questionContent || "문항 내용을 찾을 수 없습니다.",
});
```

**최종 결과:** 극단적 응답이 정확히 감지되고 AI 프롬프트에 전달되어 맞춤형 면접 질문 생성 완료!

### 질문 개수 로직 개선 ✅

**요구사항:** 극단적 응답 개수에 맞춰 면접 질문 생성

- 극단적 응답이 7개면 → 7개 질문 생성
- 극단적 응답이 0개면 → 2개 랜덤 질문 생성

**수정된 로직:**

```typescript
// 기존: 무조건 2개씩 생성
if (extremeCount < 2) {
  const needCount = 2 - extremeCount;
  // 랜덤 보충
}

// 수정: 극단적 응답 개수에 맞춰 생성
if (extremeCount === 0) {
  const needCount = 2; // 극단적 응답이 없으면 무조건 2개
  // 랜덤 2개 생성
} else {
  // 극단적 응답이 1개 이상이면 극단적 응답 개수만큼 질문 생성 (랜덤 추가 안함)
}
```

**AI 프롬프트 동적 생성:**

```typescript
// 인성 질문 생성 요구사항:
// - 협업 관련: ${cooperateCount}개 질문 생성
// - 책임감 관련: ${responsibilityCount}개 질문 생성
// - 리더십 관련: ${leadershipCount}개 질문 생성
// - 총 인성 질문: ${totalPersonalityQuestions}개
```

이제 지원자의 극단적 응답 패턴에 정확히 맞춘 개수의 면접 질문이 생성됩니다!

## 결과

TypeScript 컴파일 오류가 모두 해결되고, JSON 파싱 안정성이 대폭 향상되며, 지원자의 모든 극단적 응답이 빠짐없이 포착되어 실제 답변이 포함된 명확한 면접 질문이 생성되는 완전한 AI 리포트 생성 시스템이 완성됨. 최종적으로 극단적 응답 개수에 정확히 맞춘 개수의 맞춤형 면접 질문이 생성되도록 개선됨. 또한 기술 테스트에서 틀린 문제의 실제 내용과 정답까지 포함하여 더욱 구체적이고 유용한 면접 질문이 생성되도록 완성됨.
