import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Admin, IAdmin } from "../models/Admin";

// JWT 페이로드 인터페이스
interface JwtPayload {
  adminId: string;
  username: string;
}

// Request 타입 확장
declare global {
  namespace Express {
    interface Request {
      admin?: IAdmin;
    }
  }
}

// JWT 시크릿 키 (환경변수에서 가져오거나 기본값 사용)
const JWT_SECRET =
  process.env.JWT_SECRET ||
  "your-super-secret-jwt-key-change-this-in-production";

// JWT 토큰 생성 함수
export const generateToken = (admin: IAdmin): string => {
  const payload: JwtPayload = {
    adminId: (admin._id as any).toString(),
    username: admin.username,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d", // 7일 후 만료
  });
};

// JWT 토큰 검증 미들웨어
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // "Bearer TOKEN"

    if (!token) {
      res.status(401).json({
        success: false,
        message: "접근 토큰이 필요합니다.",
      });
      return;
    }

    // 토큰 검증
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    // 관리자 정보 조회
    const admin = await Admin.findById(decoded.adminId);
    if (!admin) {
      res.status(401).json({
        success: false,
        message: "유효하지 않은 토큰입니다.",
      });
      return;
    }

    // 요청 객체에 관리자 정보 추가
    req.admin = admin;
    next();
  } catch (error) {
    console.error("토큰 검증 오류:", error);

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: "유효하지 않은 토큰입니다.",
      });
    } else if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: "토큰이 만료되었습니다.",
      });
    } else {
      res.status(500).json({
        success: false,
        message: "서버 내부 오류가 발생했습니다.",
      });
    }
  }
};

// 선택적 인증 미들웨어 (토큰이 있으면 검증하지만 없어도 통과)
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
      const admin = await Admin.findById(decoded.adminId);
      if (admin) {
        req.admin = admin;
      }
    }

    next();
  } catch (error) {
    // 선택적 인증에서는 오류가 발생해도 통과
    next();
  }
};
