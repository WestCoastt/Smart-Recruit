import express from "express";
import {
  loginAdmin,
  registerAdmin,
  getAdminProfile,
  verifyToken,
  getApplicants,
  getApplicantDetail,
  getApplicantStats,
} from "../controllers/adminController";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

// 관리자 로그인
router.post("/login", loginAdmin);

// 관리자 회원가입 (개발/테스트용)
router.post("/register", registerAdmin);

// 관리자 프로필 조회 (인증 필요)
router.get("/profile", authenticateToken, getAdminProfile);

// 토큰 검증
router.get("/verify", authenticateToken, verifyToken);

// 지원자 관련 API (인증 필요)
router.get("/applicants", authenticateToken, getApplicants);
router.get("/applicants/stats", authenticateToken, getApplicantStats);
router.get("/applicants/:applicantId", authenticateToken, getApplicantDetail);

export default router;
