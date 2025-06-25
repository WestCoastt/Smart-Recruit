// 지원자 정보 타입
export interface ApplicantInfo {
  name: string;
  email: string;
  phone: string;
}

// 답변 타입
export interface Answer {
  questionId: string;
  answer: string;
  timeSpent: number;
}

// 테스트 결과 타입
export interface TestResult {
  id: string;
  applicantInfo: ApplicantInfo;
  technicalAnswers: Answer[];
  personalityAnswers: Answer[];
  totalScore: number;
  technicalScore: number;
  personalityScore: number;
  submittedAt: Date;
}
