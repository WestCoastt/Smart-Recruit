# 인적성 평가 시스템 - "이 지원자, 괜찮을까?"

## 프로젝트 개요

신입 및 경력 개발자 지원자를 대상으로 기술 역량, 인성, 문제 해결력을 평가하는 온라인 시스템입니다.

## 기술 스택

### 프론트엔드

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Hook Form
- Chart.js
- React Router DOM

### 백엔드

- Node.js
- Express.js
- TypeScript
- MongoDB (Mongoose)
- OpenAI GPT API (지능형 리포트 생성)
- JWT 인증

## 프로젝트 구조

```
smart-recruit/
├── client/                 # React 프론트엔드
│   ├── src/
│   │   ├── components/     # 재사용 가능한 컴포넌트
│   │   ├── pages/         # 페이지 컴포넌트
│   │   ├── hooks/         # 커스텀 훅
│   │   ├── types/         # TypeScript 타입 정의
│   │   └── utils/         # 유틸리티 함수
│   └── package.json
├── server/                # Node.js 백엔드
│   ├── src/
│   │   ├── routes/        # API 라우트
│   │   ├── models/        # MongoDB 모델
│   │   ├── middleware/    # Express 미들웨어
│   │   ├── controllers/   # 컨트롤러
│   │   └── utils/         # 유틸리티 함수
│   └── package.json
├── package.json           # 루트 패키지 설정 (워크스페이스)
├── README.md
└── prompt_log.md          # AI 도구 사용 기록
```

## 설치 및 실행

### 1. 전체 프로젝트 설치

```bash
npm install
```

### 2. 환경 변수 설정

`server` 디렉토리에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
MONGODB_URI=mongodb://localhost:27017/smart-recruit
PORT=5000
NODE_ENV=development

# OpenAI API 키 (필수)
OPENAI_API_KEY=your_openai_api_key_here
```

⚠️ **OpenAI API 키 설정 필수**: AI 리포트 생성 기능을 사용하려면 OpenAI API 키가 필요합니다.

- [OpenAI API 키 발급받기](https://platform.openai.com/api-keys)
- API 키를 발급받아 위의 `OPENAI_API_KEY`에 입력해주세요.

### 개발 모드 실행 (동시 실행)

```bash
npm run dev
```

### 개별 실행

```bash
# 프론트엔드만 실행
npm run dev:client

# 백엔드만 실행
npm run dev:server
```

## 주요 기능

### 지원자 평가 시스템

- 지원자 정보 입력 및 안내사항 확인
- 기술 역량 테스트 (30문제, 30분)
- 인성 테스트 (120문항, 15분)
- 부정행위 방지 기능 (화면 이탈 감지)
- 자동 채점 및 점수 계산

### 관리자 시스템

- 지원자 리스트 조회
- 개별 지원자 상세 리포트
- **AI 기반 지능형 리포트 생성** 🤖
  - GPT-4를 활용한 종합 평가 리포트
  - 지원자 맞춤형 면접 질문 자동 생성
  - 기술/인성 점수 기반 분석
  - 채용 추천도 및 개선점 제시

## 개발 진행 상황

- [x] 프로젝트 초기 설정
- [ ] 프론트엔드 기본 구조 구현
- [ ] 백엔드 API 구현
- [ ] 데이터베이스 모델 설계
- [ ] 테스트 및 배포

## 개발자

바이브코딩 챌린지 참가자

## 라이센스

MIT
