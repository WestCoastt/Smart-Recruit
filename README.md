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

### 전체 프로젝트 설치

```bash
npm install
```

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

- 지원자 정보 입력 및 안내사항 확인
- 기술 역량 테스트 (10문제, 30분)
- 인성 테스트 (5문제, 15분)
- 부정행위 방지 기능
- 관리자 페이지 (지원자 리스트, 개별 리포트)
- 자동 채점 및 시각화

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
