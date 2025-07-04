// 지원자 정보 타입
export interface ApplicantInfo {
  name: string;
  email: string;
  phone: string;
}

// 지원자 상세 정보 타입 (관리자용)
export interface ApplicantDetail {
  _id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  cheatingDetected?: {
    isCheating: boolean;
    reason: string;
    detectedAt: string;
    testType: "technical" | "personality";
  };
  technicalTest?: {
    score: number;
    maxScore: number;
    totalTime: number;
    totalQuestions?: number;
    results: Array<{
      questionId: string;
      userAnswer: string;
      correctAnswer: string | string[];
      isCorrect: boolean;
      timeSpent: number;
      questionInfo?: {
        id: string;
        category: string;
        question: string;
        type: "multiple-choice" | "short-answer" | "unknown";
        options?: string[];
        correctAnswer: string | string[];
        explanation?: string;
      };
    }>;
    allQuestions?: Array<{
      index: number;
      questionId: string;
      questionInfo: {
        id: string;
        category: string;
        question: string;
        type: "multiple-choice" | "short-answer" | "unknown";
        options?: string[];
        correctAnswer: string | string[];
        explanation?: string;
      };
    }>;
    submittedAt: string;
  };
  personalityTest?: {
    totalTime: number;
    submittedAt: string;
    scores: {
      cooperate: { score: number; level: string };
      responsibility: { score: number; level: string };
      leadership: { score: number; level: string };
      total: number;
    };
    questionDetails?: Array<{
      questionId: string;
      category: string;
      selected_answer: number;
      reverse_scoring: boolean;
      final_score: number;
      questionInfo?: {
        id: string;
        content: string;
        category: string;
        reverse_scoring: boolean;
      };
    }>;
  };
  aiReport?: {
    report: {
      technicalAnalysis: {
        overallLevel: string;
        strengths: string[];
        weaknesses: string[];
        timeEfficiency: string;
      };
      personalityAnalysis: {
        cooperation: string;
        responsibility: string;
        leadership: string;
        organizationFit: string;
        growthPotential: string;
      };
      overallAssessment: {
        recommendation: "high" | "medium" | "low";
        mainStrengths: string[];
        improvementAreas: string[];
      };
    };
    interviewQuestions: {
      technical: Array<{
        category: string;
        question: string;
        purpose: string;
        type?: string;
      }>;
      personality: Array<{
        category: string;
        question: string;
        purpose: string;
        basedOn?: string;
      }>;
      followUp: Array<{
        type: string;
        question: string;
        purpose: string;
      }>;
    };
    generatedAt: string;
    modelUsed: string;
  };
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
  answer: string;
  explanation?: string;
  type: "multiple-choice";
}

// 주관식 문제 타입
export interface ShortAnswerQuestion {
  _id: string;
  category: QuestionCategory;
  question: string;
  answer: string[];
  explanation?: string;
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

// 인성 테스트 관련 타입
export type PersonalityCategory = "cooperate" | "responsibility" | "leadership";

export interface PersonalityQuestion {
  _id: string;
  content: string;
  category: PersonalityCategory;
}

export interface PersonalityTestData {
  questions: PersonalityQuestion[];
  totalQuestions: number;
}
