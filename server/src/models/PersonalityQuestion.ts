import mongoose, { Schema, Document } from "mongoose";

export interface IPersonalityQuestion extends Document {
  item_number: number;
  content: string;
  scoring_criteria: string;
  reverse_scoring: boolean;
}

const personalityQuestionSchema = new Schema<IPersonalityQuestion>({
  item_number: {
    type: Number,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  scoring_criteria: {
    type: String,
    required: true,
  },
  reverse_scoring: {
    type: Boolean,
    default: false,
  },
});

// 세 개의 컬렉션을 위한 모델 생성
export const CooperateQuestion = mongoose.model<IPersonalityQuestion>(
  "CooperateQuestion",
  personalityQuestionSchema,
  "cooperates"
);
export const ResponsibilityQuestion = mongoose.model<IPersonalityQuestion>(
  "ResponsibilityQuestion",
  personalityQuestionSchema,
  "responsibilities"
);
export const LeadershipQuestion = mongoose.model<IPersonalityQuestion>(
  "LeadershipQuestion",
  personalityQuestionSchema,
  "leaderships"
);
