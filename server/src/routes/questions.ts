import express from "express";
import {
  getTechnicalTestQuestions,
  getQuestionStats,
} from "../controllers/questionController";

const router = express.Router();

// GET /api/questions/technical-test - 기술 역량 테스트 문제 조회
router.get("/technical-test", getTechnicalTestQuestions);

// GET /api/questions/stats - 문제 통계 조회 (관리자용)
router.get("/stats", getQuestionStats);

export default router;
