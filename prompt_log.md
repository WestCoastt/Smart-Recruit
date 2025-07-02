# Prompt Log - AI 도구 사용 기록

이 파일은 프로젝트 개발 과정에서 사용한 AI 도구(Cursor, ChatGPT 등)의 주요 프롬프트와 활용 내역을 기록합니다.

## 2025년 1월 2일 - 기술 테스트 탭 UI 모던 디자인 개선

### 요청사항

사용자가 기술 테스트 탭의 UI가 가독성이 좋지 않고 색상 통일성이 부족하다는 피드백을 제공하며, 더 심플하고 모던한 디자인으로 개선 요청.

### 개선 내용

#### 1. 통계 카드 디자인 완전 개편

- **기존**: 단순한 배경색 카드 (gray-50, green-50 등)
- **개선**: 모던한 카드 레이아웃

  ```typescript
  // 각 카드에 아이콘과 호버 효과 추가
  className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow"

  // 아이콘과 수치를 분리하여 시각적 계층 구조 개선
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-slate-600">총 문제</p>
      <p className="text-3xl font-bold text-slate-900 mt-1">30</p>
    </div>
    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
      <svg>...</svg>
    </div>
  </div>
  ```

#### 2. 색상 팔레트 통일화

- **Slate 계열**: 기본 색상 (회색 대신)
- **Emerald 계열**: 정답 관련 (초록 대신)
- **Rose 계열**: 오답 관련 (빨강 대신)
- **Amber 계열**: 미제출 관련 (노랑 대신)

#### 3. 아이콘 추가로 직관성 향상

- 총 문제: 문서 아이콘
- 정답: 체크마크 아이콘
- 오답: X 아이콘
- 미제출: 경고 아이콘

#### 4. 아코디언 UI 대폭 개선

##### 헤더 디자인

- **배경**: 기존 배경색 제거 → 흰색 카드 + 그림자
- **문제 번호**: 텍스트 → 둥근 배지 형태
- **배지 스타일**: rounded-full → rounded-lg (더 모던함)
- **레이아웃**: 정보 배치 최적화

##### 내용 영역 리디자인

- **문제 섹션**: 배경 박스 추가 (bg-slate-50)
- **선택지**: 두꺼운 테두리 + 트랜지션 효과
- **답변 비교**: 카드형 레이아웃으로 개선
- **미제출 알림**: 아이콘 + 구조화된 메시지

#### 5. 타이포그래피 개선

- **제목**: font-medium → font-semibold
- **텍스트 크기**: 일관성 있게 조정
- **행간**: leading-relaxed 적용

#### 6. 인터랙션 개선

- **호버 효과**: 카드에 shadow 변화
- **트랜지션**: duration-200 추가
- **포커스**: ring-slate-300 + ring-offset-2

### 기술적 특징

- Tailwind CSS의 최신 색상 팔레트 활용
- 접근성 고려한 색상 대비
- 모바일 반응형 레이아웃 유지
- 부드러운 애니메이션 효과

### 사용자 경험 개선점

1. **가독성 향상**: 색상 대비 개선 및 타이포그래피 최적화
2. **직관성 증대**: 아이콘을 통한 시각적 정보 전달
3. **모던함**: 최신 디자인 트렌드 반영
4. **일관성**: 색상 팔레트와 스타일 통일

이번 개선으로 기술 테스트 결과 페이지가 더욱 전문적이고 사용하기 쉬운 인터페이스로 변경되었습니다.

## 2025년 1월 2일 - 기술 테스트 점수 계산 로직 수정

### 문제 상황

지원자 목록과 점수 개요 탭에서 기술 테스트 점수가 14/20으로 표시되고 정답률이 70%로 나타나는 문제 발견. 실제로는 총 30문제 중 14문제를 맞췄으므로 14/30 (46.7%)이어야 함.

### 원인 분석

백엔드에서 `maxScore`를 `allQuestions.length`로 설정하고 있었는데, 이는 지원자가 실제로 답변한 문제 개수(20개)를 기준으로 하고 있었음. 하지만 총 문제 수는 30문제로 고정되어야 함.

### 수정 내용

#### 백엔드 수정 (`server/src/controllers/applicantController.ts`)

```typescript
// 기존
const maxScore = allQuestions.length;

// 수정
const maxScore = 30; // 총 문제 수는 항상 30문제로 고정
```

#### 백엔드 관리자 API 수정 (`server/src/controllers/adminController.ts`)

1. **지원자 목록 API 수정**:

```typescript
// 기존
technicalMaxScore: applicant.technicalTest?.maxScore || 0,

// 수정
technicalMaxScore: 30, // 총 문제 수는 항상 30문제로 고정
```

2. **지원자 상세 정보 API 수정**:

```typescript
// maxScore를 30으로 수정 (총 문제 수 고정)
if (enrichedApplicant.technicalTest) {
  enrichedApplicant.technicalTest.maxScore = 30;
}
```

#### 프론트엔드 수정 (`client/src/pages/ApplicantDetail.tsx`)

점수 개요 탭에서 정답률 계산 로직 수정:

```typescript
// 기존
(applicant.technicalTest.score / applicant.technicalTest.maxScore) *
  100(
    // 수정
    applicant.technicalTest.score / 30
  ) *
  100;
```

점수 표시도 수정:

```typescript
// 기존
{applicant.technicalTest.score} / {applicant.technicalTest.maxScore}

// 수정
{applicant.technicalTest.score} / 30
```

### 결과

- **강민경 지원자 예시**: 14/20 (70%) → 14/30 (46.7%)
- 지원자 목록에서도 올바른 점수와 정답률 표시
- 점수 개요 탭과 차트에서도 정확한 계산
- 모든 화면에서 일관된 점수 표시

### 영향도

- 기존에 저장된 데이터의 `score`는 그대로 유지 (실제 정답 개수)
- `maxScore`만 30으로 통일하여 정답률 계산이 정확해짐
- 지원자별 실제 성과를 더 정확하게 반영

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

---

## 2025-01-01 22:00 - 지원자 리포트 페이지 점수 계산 오류 수정

**문제 상황**:

```
db에는 아래와 같이 데이터가 저장됐는데 지원자 리포트 페이지에서는 오답수 24문제 미응답수 24문제 라고 나와
정답수는 0이라고 나오고
```

**분석 결과**:

- DB 데이터 확인: 김영희 지원자는 실제로 24개 문제를 모두 풀었고, 그 중 20개를 정답처리 (isCorrect: true)
- 문제점: 프론트엔드에서 미응답 판단 로직이 잘못되어 있었음
- `userAnswer`가 빈 문자열인지로 미응답을 판단하고 있었지만, 실제로는 모든 문제에 답변이 있었음
- `maxScore`는 24이지만 `results` 배열은 24개였으므로 미응답은 0개가 맞음

**수정 내용**:

### 1. 통계 카드 수정 (`ApplicantDetail.tsx`)

```typescript
// 총 문제수를 results.length에서 maxScore로 변경
<dd className="mt-1 text-2xl font-semibold text-gray-900">
  {applicant.technicalTest.maxScore}문제
</dd>;

// 오답 계산 로직 수정 (응답한 문제 중에서만 오답 계산)
{
  applicant.technicalTest.results.filter(
    (r) => !r.isCorrect && r.userAnswer && r.userAnswer.trim() !== ""
  ).length;
}

// 미응답 계산 로직 수정 (전체 문제수에서 응답한 문제수 차감)
{
  applicant.technicalTest.maxScore - applicant.technicalTest.results.length;
}
```

### 2. 차트 데이터 함수 수정 (`getScoreDistributionData`)

```typescript
const getScoreDistributionData = () => {
  if (!applicant?.technicalTest) return [];

  const { results, maxScore } = applicant.technicalTest;
  const correct = results.filter((r) => r.isCorrect).length;
  const incorrect = results.filter(
    (r) => !r.isCorrect && r.userAnswer && r.userAnswer.trim() !== ""
  ).length;
  const unanswered = maxScore - results.length;

  const data = [
    { name: "정답", value: correct, color: "#10B981" },
    { name: "오답", value: incorrect, color: "#EF4444" },
  ];

  if (unanswered > 0) {
    data.push({ name: "미응답", value: unanswered, color: "#F59E0B" });
  }

  return data;
};
```

### 3. 문제별 상세 결과 수정

```typescript
// results 배열에 있는 문제들은 모두 응답됨으로 처리
const isUnanswered = false; // 실제로 제출된 문제들이므로 모두 응답됨
const cardBgColor = result.isCorrect
  ? "bg-green-50 border-green-200"
  : "bg-red-50 border-red-200";

// 답변 표시 부분 단순화
<div className="p-3 rounded border bg-white border-gray-200">
  {result.userAnswer || "답변 없음"}
</div>;
```

**결과**:

- 김영희 지원자의 정확한 통계 표시: 정답 20문제, 오답 4문제, 미응답 0문제
- 차트에서도 올바른 데이터 표시
- 문제별 상세 결과에서 정답/오답 구분 명확히 표시
- 모든 통계가 DB 데이터와 일치하게 수정 완료

**활용한 AI 도구**: Cursor 코드 분석 및 수정
**소요 시간**: 약 30분

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

## 2025-01-01 21:00 - AI API 파싱 오류 해결을 위한 획기적인 템플릿 기반 질문 생성 시스템 구현

### 문제 상황

- AI API에서 받은 JSON 응답이 자주 파싱 오류를 발생시킴
- 유니코드 문제, 이스케이프 문자 문제, 구조적 JSON 오류 등이 반복 발생
- DB에 기본값("인성 관련 질문을 생성 중입니다.") 데이터만 저장되는 문제

### 해결 방안

**완전히 새로운 접근법: 템플릿 기반 질문 생성 시스템**

- AI API 의존도를 줄이고 안정성을 극대화
- 지원자 데이터 기반 조건부 템플릿 시스템 구현
- JSON 파싱 오류 완전 제거

### 구현 내용

#### 1. 새로운 파일 생성

- `server/src/utils/questionGenerator.ts` 생성
- 템플릿 기반 면접 질문 생성 시스템 완전 구현

#### 2. 핵심 기능

**기술 질문 템플릿 시스템:**

- 틀린 문제 기반 질문: Database, Java, Network, OS, Cloud 카테고리별
- 빠르게 푼 문제 기반 심화 질문
- 동적 변수 삽입: {{time}}, {{concept}}, {{javaFeature}} 등

**인성 질문 템플릿 시스템:**

- 협업, 책임감, 리더십 카테고리별 조건부 질문
- 극단적 답변(1점, 5점) 기반 맞춤형 질문
- 점수 구간별 차별화 질문

**후속 질문 템플릿:**

- 기술적 깊이, 학습능력, 성장계획 영역
- 점수 기반 동적 메시지 생성

#### 3. 템플릿 처리 로직

```typescript
const processTemplate = (
  template: string,
  variables: { [key: string]: string }
): string => {
  let processed = template;
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
    processed = processed.replace(regex, value);
  });
  return processed;
};
```

#### 4. 조건부 질문 생성

- 각 템플릿마다 `triggers.condition` 함수로 적용 조건 확인
- `triggers.variables` 함수로 동적 변수 생성
- 조건 미충족 시 기본 질문 제공

#### 5. 최소 질문 수 보장

- 기술 질문 최소 1개
- 인성 질문 최소 1개
- 후속 질문 최소 1개
- 조건 충족 시 더 많은 맞춤형 질문 생성

#### 6. 기존 시스템과 연결

- `personalityController.ts`에서 import 변경
- 기존 AI API 함수 대신 새로운 템플릿 함수 사용

### 장점

1. **완전한 안정성**: JSON 파싱 오류 0%
2. **빠른 응답**: AI API 호출 없이 즉시 질문 생성
3. **맞춤화**: 지원자 데이터 기반 개인화된 질문
4. **확장성**: 새로운 템플릿 쉽게 추가 가능
5. **디버깅**: 로그로 모든 과정 추적 가능

### 예시 질문들

**기술 질문:**

- "Java 문제를 2초만에 해결하셨네요. G1GC와 ZGC의 차이점과 실무에서의 선택 기준을 설명해주세요."
- "데이터베이스 관련 문제에서 어려움을 겪으신 것 같습니다. 인덱스 최적화와 쿼리 성능에 대해 실무에서 어떻게 활용해보셨나요?"

**인성 질문:**

- "코드 테스트를 철저히 수행하는 것에 대해 '전혀 그렇지 않다'라고 답변하셨는데, 실제 개발 과정에서 품질 관리는 어떻게 하시나요?"
- "팀워크를 매우 중시한다고 답변해주셨습니다. 팀 프로젝트에서 본인의 역할과 기여도를 구체적으로 설명해주세요."

### 결과

AI API 파싱 오류가 완전히 해결되고, 지원자별로 맞춤화된 고품질 면접 질문이 안정적으로 생성됩니다.

## 2025-01-01 21:30 - 기술 테스트 탭 UI 모던 디자인 개선

### 요청사항

사용자가 기술 테스트 탭의 UI가 가독성이 좋지 않고 색상 통일성이 부족하다는 피드백을 제공하며, 더 심플하고 모던한 디자인으로 개선 요청.

### 개선 내용

#### 1. 통계 카드 디자인 완전 개편

- **기존**: 단순한 배경색 카드 (gray-50, green-50 등)
- **개선**: 모던한 카드 레이아웃

  ```typescript
  // 각 카드에 아이콘과 호버 효과 추가
  className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow"

  // 아이콘과 수치를 분리하여 시각적 계층 구조 개선
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-slate-600">총 문제</p>
      <p className="text-3xl font-bold text-slate-900 mt-1">30</p>
    </div>
    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
      <svg>...</svg>
    </div>
  </div>
  ```

#### 2. 색상 팔레트 통일화

- **Slate 계열**: 기본 색상 (회색 대신)
- **Emerald 계열**: 정답 관련 (초록 대신)
- **Rose 계열**: 오답 관련 (빨강 대신)
- **Amber 계열**: 미제출 관련 (노랑 대신)

#### 3. 아이콘 추가로 직관성 향상

- 총 문제: 문서 아이콘
- 정답: 체크마크 아이콘
- 오답: X 아이콘
- 미제출: 경고 아이콘

#### 4. 아코디언 UI 대폭 개선

##### 헤더 디자인

- **배경**: 기존 배경색 제거 → 흰색 카드 + 그림자
- **문제 번호**: 텍스트 → 둥근 배지 형태
- **배지 스타일**: rounded-full → rounded-lg (더 모던함)
- **레이아웃**: 정보 배치 최적화

##### 내용 영역 리디자인

- **문제 섹션**: 배경 박스 추가 (bg-slate-50)
- **선택지**: 두꺼운 테두리 + 트랜지션 효과
- **답변 비교**: 카드형 레이아웃으로 개선
- **미제출 알림**: 아이콘 + 구조화된 메시지

#### 5. 타이포그래피 개선

- **제목**: font-medium → font-semibold
- **텍스트 크기**: 일관성 있게 조정
- **행간**: leading-relaxed 적용

#### 6. 인터랙션 개선

- **호버 효과**: 카드에 shadow 변화
- **트랜지션**: duration-200 추가
- **포커스**: ring-slate-300 + ring-offset-2

### 기술적 특징

- Tailwind CSS의 최신 색상 팔레트 활용
- 접근성 고려한 색상 대비
- 모바일 반응형 레이아웃 유지
- 부드러운 애니메이션 효과

### 사용자 경험 개선점

1. **가독성 향상**: 색상 대비 개선 및 타이포그래피 최적화
2. **직관성 증대**: 아이콘을 통한 시각적 정보 전달
3. **모던함**: 최신 디자인 트렌드 반영
4. **일관성**: 색상 팔레트와 스타일 통일

이번 개선으로 기술 테스트 결과 페이지가 더욱 전문적이고 사용하기 쉬운 인터페이스로 변경되었습니다.
