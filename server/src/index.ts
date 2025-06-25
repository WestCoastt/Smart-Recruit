import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

// 환경 변수 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 미들웨어
app.use(cors());
app.use(express.json());

// MongoDB 연결
const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/smart-recruit"
    );
    console.log("MongoDB 연결 성공");
  } catch (error) {
    console.error("MongoDB 연결 실패:", error);
    process.exit(1);
  }
};

// 기본 라우트
app.get("/", (req, res) => {
  res.json({
    message: "인적성 평가 시스템 API 서버",
    version: "1.0.0",
    status: "running",
  });
});

// 서버 시작
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
  });
};

startServer();
