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

## 2025-01-11

### 기술 역량 테스트 화면 구현 및 부정행위 방지 시스템

**프롬프트**: 이제 기술 역량 테스트 화면을 만들어서 api와 연결해줘

문제는 한문제씩 보여주면 되고

테스트 화면에서 다른 탭/창으로 이동
브라우저 최소화 또는 다른 애플리케이션으로 전환

이럴경우 평가를 종료시켜야해

그리고 브라우저의 뒤로가기 버튼 클릭시 평가가 종료된다는 알림창을 띄우고
페이지 나가기 / 페이지에 계속 있기 버튼을 사용자에게 보여줘서 선택할 수 있게 해야해

**구현 내용**:

1. **TechnicalTest 컴포넌트 구현**

   - 한 문제씩 표시하는 UI
   - 객관식/주관식 문제 지원
   - 30분 타이머 (실시간 카운트다운)
   - 문제 네비게이션 (완료/미완료 상태 표시)

2. **부정행위 방지 시스템**

   - `document.visibilitychange` 이벤트로 화면 이탈 감지
   - `window.blur` 이벤트로 다른 애플리케이션 전환 감지
   - 부정행위 감지 시 즉시 평가 종료

3. **브라우저 뒤로가기 방지**

   - `beforeunload` 이벤트로 페이지 나가기 경고
   - `popstate` 이벤트로 뒤로가기 감지
   - 사용자 선택형 confirm 창 ("페이지 나가기" vs "페이지에 계속 있기")
   - History API를 활용한 뒤로가기 방지

4. **UI/UX 특징**

   - 문제별 진행률 표시 (프로그레스 바)
   - 문제 목록 네비게이션 (완료/현재/미완료 상태 구분)
   - 시간 부족 시 빨간색 경고 (5분 미만)
   - 미완료 문제 제출 시 확인 창
   - 로딩 스피너 및 에러 처리

5. **라우팅 시스템**
   - `/test/:applicantId` 경로 추가
   - 지원자 ID 검증 및 접근 제어
   - 안내사항 페이지에서 테스트 페이지로 자동 이동

**기술적 구현**:

- React Hooks (useState, useEffect, useCallback)
- 타이머 관리 (setInterval)
- 브라우저 이벤트 리스너 관리
- History API 조작
- 반응형 디자인 (Tailwind CSS)

**보안 고려사항**:

- 화면 이탈 1회 감지 시 즉시 종료
- 브라우저 뒤로가기 시 사용자 의사 확인
- 제한 시간 초과 시 자동 종료
- 답변 데이터 실시간 저장

_이 로그는 개발 과정에서 지속적으로 업데이트됩니다._

## 6단계: 기술 역량 테스트 제출 시 부정행위 감지 방지 개선

### 문제점

- 테스트 제출 버튼 클릭 시 나타나는 confirm/alert 창으로 인해 `blur` 이벤트가 발생
- 이로 인해 부정행위로 오인되어 테스트가 종료되는 문제

### 해결 방안 구현

- **상태 플래그 추가**: `isShowingAlert` 상태로 alert/confirm 창 표시 여부 추적
- **부정행위 감지 로직 수정**:
  - `handleBlur`: alert 표시 중일 때는 부정행위 감지 제외
  - `handleVisibilityChange`: alert 표시 중일 때는 화면 이탈 감지 제외
- **제출 과정 보호**:
  - 미완료 문제 확인 창
  - 최종 제출 확인 창
  - 제출 완료 알림 창
  - 각 단계에서 `setIsShowingAlert(true/false)` 호출하여 보호
- **confirm 창 닫힘 후 blur 이벤트 처리**:
  - `setTimeout(100ms)` 지연을 두어 confirm 창이 완전히 닫힌 후 `isShowingAlert` 상태 해제
  - confirm 취소 버튼 클릭 시 발생하는 blur 이벤트도 방지

### 변경된 파일

- `client/src/pages/TechnicalTest.tsx`: 부정행위 감지 로직 개선, 불필요한 변수 제거

### 기술적 개선사항

- TypeScript 타입 오류 수정: `MultipleChoiceQuestion` 타입 사용
- 사용하지 않는 import 및 변수 정리
- 린터 오류 해결

## 현재 상태

- 테스트 제출 과정에서 부정행위 오감지 문제 해결
- 정상적인 화면 이탈이나 애플리케이션 전환은 여전히 감지
- 사용자 경험 개선: 제출 과정에서 오류 없이 진행 가능

## 7단계: 기술 테스트 제출 및 채점 시스템 구현

### 백엔드 구현

- **지원자 모델 확장** (`server/src/models/Applicant.ts`):

  - 기술 테스트 결과 저장 필드 추가: answers, questionTimes, totalTime, score, results
  - 인성 테스트 결과 필드 준비 (향후 구현)

- **기술 테스트 제출 API** (`server/src/controllers/applicantController.ts`):

  - `submitTechnicalTest`: 답변 제출 및 자동 채점 기능
  - **유연한 주관식 채점**: 대소문자, 공백, 특수문자 무시하여 정답 판별
    - "Round Robin", "라운드로빈", "roundrobin" 모두 정답 처리
    - `normalizeAnswer` 함수로 답안 정규화
  - 객관식/주관식 구분 채점
  - 문제별 소요시간 및 전체 소요시간 저장
  - 채점 결과 및 점수 계산

- **API 라우트 추가** (`server/src/routes/applicants.ts`):
  - `POST /api/applicants/:applicantId/technical-test`: 기술 테스트 제출

### 프론트엔드 구현

- **API 함수 추가** (`client/src/utils/api.ts`):

  - `submitTechnicalTest`: 답변, 문제별 소요시간, 전체 소요시간 전송

- **TechnicalTest 컴포넌트 개선** (`client/src/pages/TechnicalTest.tsx`):
  - **문제별 소요시간 추적**: 각 문제 진입/이탈 시점 기록
  - **제출 기능 구현**:
    - 서버로 답변 및 소요시간 전송
    - 채점 결과 표시 (점수/만점/백분율)
    - 제출 완료 후 인성 테스트 안내 페이지로 이동
  - **제출 버튼 로딩 상태**: 중복 제출 방지

### 인성 테스트 안내사항 페이지 구현

- **새 컴포넌트** (`client/src/pages/PersonalityInstructions.tsx`):

  - **테스트 개요**: 120문항, 15분, 5점 척도, 협업/책임감/리더십 평가
  - **주의사항**: 솔직한 답변, 시간 관리 안내
  - **부정행위 방지 정책**: 화면 전환, 뒤로가기, 외부 자료 참고 금지
  - **권장 환경**: 브라우저, 네트워크, 화면 해상도, 환경 안내
  - **동의 체크박스**: 필수 동의 후 테스트 시작 가능
  - **반응형 디자인**: 색상 코딩으로 섹션별 구분

- **라우팅 추가** (`client/src/App.tsx`):
  - `/personality-instructions/:applicantId` 경로 추가
  - 지원자 ID 검증 래퍼 컴포넌트

### 기술적 특징

- **유연한 주관식 채점**:
  ```javascript
  const normalizeAnswer = (answer: string): string => {
    return answer
      .toLowerCase()
      .replace(/[\s\-_\.]/g, "")
      .trim();
  };
  ```
- **실시간 소요시간 추적**: 문제별 진입/이탈 시점 기록
- **중복 제출 방지**: `isSubmitting` 상태로 제출 버튼 비활성화
- **자동 채점 알고리즘**: 객관식 정확 매칭, 주관식 유연 매칭

### 사용자 플로우

1. 기술 테스트 완료 → 제출 버튼 클릭
2. 미완료 문제 확인 → 최종 제출 확인
3. 서버에서 자동 채점 → 점수 표시
4. 인성 테스트 안내사항 페이지로 자동 이동
5. 안내사항 확인 및 동의 → 인성 테스트 시작

## 현재 상태

- 기술 테스트 제출 및 채점 시스템 완료
- 주관식 답안 유연한 채점 로직 구현
- 인성 테스트 안내사항 페이지 구현 완료
- 채점 결과 비공개 처리 완료
- 다음 단계: 인성 테스트 화면 구현 필요

### 사용자 경험 개선

- **채점 결과 비공개**: 기술 테스트 제출 후 점수를 사용자에게 보여주지 않음
  - 제출 완료 alert 제거
  - 바로 인성 테스트 안내 페이지로 이동
  - 채점 결과는 관리자 페이지에서만 확인 가능

## 현재 상태

- 기술 테스트 제출 및 채점 시스템 완료
- 주관식 답안 유연한 채점 로직 구현
- 인성 테스트 안내사항 페이지 구현 완료
- 채점 결과 비공개 처리 완료
- 다음 단계: 인성 테스트 화면 구현 필요
