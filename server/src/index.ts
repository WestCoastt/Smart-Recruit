import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import mongoose from "mongoose";
import applicantsRouter from "./routes/applicants";
import questionsRouter from "./routes/questions";
import adminRouter from "./routes/admin";
import personalityRouter from "./routes/personality";
import { createDefaultAdmin } from "./controllers/adminController";

// 환경 변수 로드
dotenv.config();

// 환경변수 기본값 설정
process.env.MONGODB_URI = process.env.MONGODB_URI;
process.env.PORT = process.env.PORT || "5000";

const app = express();
const PORT = process.env.PORT || 5000;

// 미들웨어
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

app.use(express.static(path.join(__dirname, "../client/dist")));

// MongoDB 연결
const connectDB = async () => {
  try {
    const mongoURI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/smart-recruit";
    await mongoose.connect(mongoURI);
    console.log("MongoDB 연결 성공");
  } catch (error) {
    console.error("MongoDB 연결 실패:", error);
    process.exit(1);
  }
};

// API 라우트
app.use("/api/applicants", applicantsRouter);
app.use("/api/questions", questionsRouter);
app.use("/api/personality", personalityRouter);
app.use("/api/admin", adminRouter);

// 기본 라우트
app.get("/", (req, res) => {
  res.json({
    message: "인적성 평가 시스템 API 서버",
    version: "1.0.0",
    status: "running",
    endpoints: {
      applicants: {
        create: "POST /api/applicants",
        getAll: "GET /api/applicants",
        getById: "GET /api/applicants/:id",
        submitTechnicalTest: "POST /api/applicants/:applicantId/technical-test",
        submitPersonalityTest:
          "POST /api/applicants/:applicantId/personality-test",
      },
      questions: {
        getTechnical: "GET /api/questions/technical",
        getPersonality: "GET /api/questions/personality",
      },
      admin: {
        login: "POST /api/admin/login",
        register: "POST /api/admin/register",
        profile: "GET /api/admin/profile",
        verify: "GET /api/admin/verify",
      },
    },
  });
});

// 404 에러 핸들링
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API 엔드포인트를 찾을 수 없습니다.",
  });
});

// 전역 에러 핸들링
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({
      success: false,
      message: "서버 내부 오류가 발생했습니다.",
    });
  }
);

// 서버 시작
const startServer = async () => {
  await connectDB();

  // 기본 관리자 계정 생성
  await createDefaultAdmin();

  app.listen(PORT, () => {
    console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
    console.log(`API 문서: http://localhost:${PORT}`);
    console.log("기본 관리자 계정: admin / admin123");
  });
};

startServer();
