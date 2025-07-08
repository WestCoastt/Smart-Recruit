export interface TechnicalResult {
  totalScore: number;
  categoryScores: {
    [key: string]: {
      correct: number;
      total: number;
      percentage: number;
    };
  };
  questionDetails: Array<{
    questionId: string;
    category: string;
    isCorrect: boolean;
    timeSpent: number;
    difficulty?: string;
  }>;
  totalTime: number;
}

export interface PersonalityResult {
  scores: {
    cooperate: {
      score: number;
      level: string;
    };
    responsibility: {
      score: number;
      level: string;
    };
    leadership: {
      score: number;
      level: string;
    };
    total: number;
  };
  questionDetails: Array<{
    questionId: string;
    category: string;
    selected_answer: number;
    timeSpent: number;
    reverse_scoring: boolean;
    final_score: number;
  }>;
  totalTime: number;
}

export interface ITechnicalTest {
  score: number;
  maxScore: number;
  results: Array<{
    questionId: string;
    userAnswer: string;
    correctAnswer: string | string[];
    isCorrect: boolean;
    timeSpent: number;
    questionInfo?: {
      category: string;
      question: string;
      type: "multiple-choice" | "short-answer" | "unknown";
      options?: string[];
      correctAnswer: string | string[];
    };
  }>;
  totalTime: number;
  submittedAt?: Date;
  answers: { [key: string]: string };
  questionTimes: { [key: string]: number };
}

export interface IPersonalityTest {
  scores: {
    cooperate: {
      score: number;
      level: string;
    };
    responsibility: {
      score: number;
      level: string;
    };
    leadership: {
      score: number;
      level: string;
    };
    total: number;
  };
  questionDetails: Array<{
    questionId: string;
    category: string;
    selected_answer: number;
    timeSpent: number;
    reverse_scoring: boolean;
    final_score: number;
  }>;
  totalTime: number;
  submittedAt?: Date;
}
