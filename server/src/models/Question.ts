import mongoose, { Document, Schema } from "mongoose";

// 카테고리 타입 정의
export type QuestionCategory =
  | "Java"
  | "Database"
  | "Operating System"
  | "Cloud"
  | "Security"
  | "Network";

// 객관식 문제 인터페이스
export interface IMultipleChoiceQuestion extends Document {
  category: QuestionCategory;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

// 주관식 문제 인터페이스
export interface IShortAnswerQuestion extends Document {
  category: QuestionCategory;
  question: string;
  answer: string[];
}

// 객관식 문제 스키마
const MultipleChoiceQuestionSchema: Schema = new Schema(
  {
    category: {
      type: String,
      required: true,
      enum: [
        "Java",
        "Database",
        "Operating System",
        "Cloud",
        "Security",
        "Network",
      ],
    },
    question: {
      type: String,
      required: true,
    },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: function (v: string[]) {
          return v && v.length >= 2;
        },
        message: "최소 2개의 선택지가 필요합니다.",
      },
    },
    answer: {
      type: String,
      required: true,
    },
    explanation: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// 주관식 문제 스키마
const ShortAnswerQuestionSchema: Schema = new Schema(
  {
    category: {
      type: String,
      required: true,
      enum: [
        "Java",
        "Database",
        "Operating System",
        "Cloud",
        "Security",
        "Network",
      ],
    },
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: [String],
      required: true,
      validate: {
        validator: function (v: string[]) {
          return v && v.length >= 1;
        },
        message: "최소 1개의 정답이 필요합니다.",
      },
    },
  },
  {
    timestamps: true,
  }
);

// 모델 생성
export const MultipleChoiceQuestion = mongoose.model<IMultipleChoiceQuestion>(
  "multiple-choices",
  MultipleChoiceQuestionSchema
);
export const ShortAnswerQuestion = mongoose.model<IShortAnswerQuestion>(
  "short-answers",
  ShortAnswerQuestionSchema
);
