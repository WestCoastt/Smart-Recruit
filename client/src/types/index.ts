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

// 문제 카테고리 타입
export type QuestionCategory =
  | "Java"
  | "Database"
  | "Operating System"
  | "Cloud"
  | "Security"
  | "Network";

// 객관식 문제 타입
export interface MultipleChoiceQuestion {
  _id: string;
  category: QuestionCategory;
  question: string;
  options: string[];
  questionNumber: number;
  type: "multiple-choice";
}

// 주관식 문제 타입
export interface ShortAnswerQuestion {
  _id: string;
  category: QuestionCategory;
  question: string;
  questionNumber: number;
  type: "short-answer";
}

// 통합 문제 타입
export type Question = MultipleChoiceQuestion | ShortAnswerQuestion;

// 기술 역량 테스트 데이터 타입
export interface TechnicalTestData {
  questions: Question[];
  totalQuestions: number;
  multipleChoiceCount: number;
  shortAnswerCount: number;
  timeLimit: number;
  categories: QuestionCategory[];
}
