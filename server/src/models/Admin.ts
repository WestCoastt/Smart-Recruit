import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

// 관리자 인터페이스
export interface IAdmin extends Document {
  username: string;
  password: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// 관리자 스키마
const AdminSchema: Schema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v: string) {
          return !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: "올바른 이메일 형식이 아닙니다.",
      },
    },
  },
  {
    timestamps: true,
  }
);

// 비밀번호 해싱 미들웨어
AdminSchema.pre<IAdmin>("save", async function (next) {
  // 비밀번호가 수정되지 않았으면 건너뛰기
  if (!this.isModified("password")) return next();

  try {
    // 비밀번호 해싱
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// 비밀번호 비교 메서드
AdminSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// JSON 변환 시 비밀번호 제외
AdminSchema.methods.toJSON = function () {
  const adminObject = this.toObject();
  delete adminObject.password;
  return adminObject;
};

// 모델 생성
export const Admin = mongoose.model<IAdmin>("Admin", AdminSchema);
