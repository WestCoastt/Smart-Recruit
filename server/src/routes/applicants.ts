import express from "express";
import {
  createApplicant,
  getAllApplicants,
  getApplicantById,
  submitTechnicalTest,
  resetTechnicalTest,
  markAsCheating,
} from "../controllers/applicantController";

const router = express.Router();

// POST /api/applicants - 지원자 정보 저장
router.post("/", createApplicant);

// GET /api/applicants - 지원자 목록 조회 (관리자용)
router.get("/", getAllApplicants);

// GET /api/applicants/:id - 특정 지원자 정보 조회
router.get("/:id", getApplicantById);

// POST /api/applicants/:applicantId/technical-test - 기술 테스트 제출
router.post("/:applicantId/technical-test", submitTechnicalTest);

// DELETE /api/applicants/:applicantId/technical-test - 기술 테스트 데이터 리셋 (개발용)
router.delete("/:applicantId/technical-test", resetTechnicalTest);

// POST /api/applicants/:applicantId/cheating - 부정행위 처리
router.post("/:applicantId/cheating", markAsCheating);

export default router;
