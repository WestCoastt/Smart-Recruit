import express from "express";
import {
  getPersonalityTestQuestions,
  submitPersonalityTest,
  resetPersonalityTest,
} from "../controllers/personalityController";

const router = express.Router();

// 인성 테스트 문항 조회
router.get("/questions", getPersonalityTestQuestions);

// 인성 테스트 제출
router.post("/:applicantId/submit", submitPersonalityTest);

// 인성 테스트 데이터 리셋 (개발용)
router.delete("/:applicantId/reset", resetPersonalityTest);

export default router;
