import mongoose, { Document, Schema } from "mongoose";

interface ITechnicalTest {
  answers: { [key: string]: string };
  questionTimes: { [key: string]: number };
  totalTime: number;
  score: number;
  maxScore: number;
  results: Array<{
    questionId: string;
    userAnswer: string;
    correctAnswer: string | string[];
    isCorrect: boolean;
    timeSpent: number;
  }>;
  submittedAt: Date;
}

interface IPersonalityTest {
  answers: { [key: string]: number };
  totalTime: number;
  submittedAt: Date;
  questionDetails: Array<{
    questionId: string;
    category: string;
    selected_answer: number;
    reverse_scoring: boolean;
    final_score: number;
  }>;
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
}

// 지원자 정보 인터페이스
export interface IApplicant extends Document {
  name: string;
  email: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;

  // 가상 필드 (계산된 값)
  technicalScore: number;
  technicalMaxScore: number;
  personalityScore: number;

  // 부정행위 여부
  cheatingDetected?: {
    isCheating: boolean;
    reason: string;
    detectedAt: Date;
    testType: "technical" | "personality";
  };

  // 테스트 결과
  technicalTest?: ITechnicalTest;
  personalityTest?: IPersonalityTest;

  // AI 생성 리포트
  aiReport?: {
    report: {
      technicalAnalysis: {
        overallLevel: string;
        detailedAssessment: string;
        strengths: string;
        weaknesses: string;
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
        comprehensiveEvaluation: string;
        keyStrengths: string;
        developmentAreas: string;
      };
      interviewFocus: {
        technicalQuestions: string;
        personalityQuestions: string;
      };
    };
    interviewQuestions: {
      technical: Array<{
        category: string;
        question: string;
        purpose: string;
      }>;
      personality: Array<{
        category: string;
        question: string;
        purpose: string;
      }>;
      followUp: Array<{
        type: string;
        question: string;
        purpose: string;
      }>;
    };
    generatedAt: Date;
    modelUsed: string;
  };
}

// 지원자 스키마 정의
const ApplicantSchema = new Schema<IApplicant>(
  {
    name: {
      type: String,
      required: [true, "이름은 필수입니다"],
      trim: true,
      minlength: [2, "이름은 최소 2글자 이상이어야 합니다"],
      maxlength: [50, "이름은 50글자를 초과할 수 없습니다"],
    },
    email: {
      type: String,
      required: [true, "이메일은 필수입니다"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "올바른 이메일 형식이 아닙니다",
      ],
    },
    phone: {
      type: String,
      required: [true, "연락처는 필수입니다"],
      match: [/^01[016789]\d{8}$/, "올바른 휴대폰 번호 형식이 아닙니다"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },

    // 부정행위 여부
    cheatingDetected: {
      isCheating: Boolean,
      reason: String,
      detectedAt: Date,
      testType: {
        type: String,
        enum: ["technical", "personality"],
      },
    },

    // 기술 역량 테스트 결과
    technicalTest: {
      answers: {
        type: Map,
        of: String,
      },
      questionTimes: {
        type: Map,
        of: Number,
      },
      totalTime: Number,
      score: Number,
      maxScore: Number,
      results: [
        {
          questionId: String,
          userAnswer: String,
          correctAnswer: Schema.Types.Mixed,
          isCorrect: Boolean,
          timeSpent: Number,
        },
      ],
      submittedAt: Date,
    },

    // 인성 테스트 결과
    personalityTest: {
      answers: {
        type: Map,
        of: Number,
      },
      totalTime: Number,
      submittedAt: Date,
      questionDetails: [
        {
          questionId: String,
          category: String,
          selected_answer: Number,
          reverse_scoring: Boolean,
          final_score: Number,
        },
      ],
      scores: {
        cooperate: {
          score: Number,
          level: String,
        },
        responsibility: {
          score: Number,
          level: String,
        },
        leadership: {
          score: Number,
          level: String,
        },
        total: Number,
      },
    },

    // AI 생성 리포트
    aiReport: {
      report: {
        technicalAnalysis: {
          overallLevel: String,
          detailedAssessment: String,
          strengths: String,
          weaknesses: String,
          timeEfficiency: String,
        },
        personalityAnalysis: {
          cooperation: String,
          responsibility: String,
          leadership: String,
          organizationFit: String,
          growthPotential: String,
        },
        overallAssessment: {
          recommendation: {
            type: String,
            enum: ["high", "medium", "low"],
          },
          comprehensiveEvaluation: String,
          keyStrengths: String,
          developmentAreas: String,
        },
        interviewFocus: {
          technicalQuestions: String,
          personalityQuestions: String,
        },
      },
      interviewQuestions: {
        technical: [
          {
            category: String,
            question: String,
            purpose: String,
          },
        ],
        personality: [
          {
            category: String,
            question: String,
            purpose: String,
          },
        ],
        followUp: [
          {
            type: String,
            question: String,
            purpose: String,
          },
        ],
      },
      generatedAt: Date,
      modelUsed: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// 이메일 중복 체크를 위한 인덱스
ApplicantSchema.index({ email: 1 }, { unique: true });

// 가상 필드 정의
ApplicantSchema.virtual("technicalScore").get(function (this: IApplicant) {
  return this.technicalTest?.score ?? 0;
});

ApplicantSchema.virtual("technicalMaxScore").get(function (this: IApplicant) {
  return this.technicalTest?.maxScore ?? 100;
});

ApplicantSchema.virtual("personalityScore").get(function (this: IApplicant) {
  return this.personalityTest?.scores?.total ?? 0;
});

// 지원자 모델 생성
const Applicant = mongoose.model<IApplicant>("Applicant", ApplicantSchema);

export default Applicant;
