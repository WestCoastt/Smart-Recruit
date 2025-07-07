import type { ApplicantInfo } from "../types";

const API_BASE_URL = "http://localhost:5000/api";

// 지원자 정보 관리 유틸리티
export interface StoredApplicantData extends ApplicantInfo {
  applicantId: string;
}

// 지원자 정보를 sessionStorage에서 가져오기
export const getStoredApplicantData = (): StoredApplicantData | null => {
  try {
    const stored = sessionStorage.getItem("applicantInfo");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

// 지원자 정보를 sessionStorage에 저장
export const setStoredApplicantData = (data: StoredApplicantData): void => {
  try {
    sessionStorage.setItem("applicantInfo", JSON.stringify(data));
  } catch {
    // 저장 실패 시 무시
  }
};

// 지원자 정보 삭제
export const clearStoredApplicantData = (): void => {
  try {
    sessionStorage.removeItem("applicantInfo");
  } catch {
    // 삭제 실패 시 무시
  }
};

// URL의 applicantId와 저장된 정보가 일치하는지 확인
export const validateApplicantId = (urlApplicantId: string): boolean => {
  const storedData = getStoredApplicantData();
  return storedData ? storedData.applicantId === urlApplicantId : false;
};

// API 응답 타입 정의
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: { [key: string]: string };
}

// 지원자 정보 제출 API
export const submitApplicantInfo = async (
  applicantData: ApplicantInfo
): Promise<ApiResponse> => {
  const response = await fetch(`${API_BASE_URL}/applicants`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(applicantData),
  });

  const result: ApiResponse = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "서버 오류가 발생했습니다.");
  }

  return result;
};

// 지원자 목록 조회 API (관리자용)
export const getApplicants = async (): Promise<ApiResponse> => {
  const adminToken = localStorage.getItem("adminToken");
  if (!adminToken) {
    throw new Error("관리자 인증이 필요합니다.");
  }

  const response = await fetch(`${API_BASE_URL}/applicants`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    credentials: "include",
  });

  const result: ApiResponse = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "서버 오류가 발생했습니다.");
  }

  return result;
};

// 특정 지원자 조회 API
export const getApplicantById = async (id: string): Promise<ApiResponse> => {
  const adminToken = localStorage.getItem("adminToken");
  if (!adminToken) {
    throw new Error("관리자 인증이 필요합니다.");
  }

  const response = await fetch(`${API_BASE_URL}/applicants/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    credentials: "include",
  });

  const result: ApiResponse = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "서버 오류가 발생했습니다.");
  }

  return result;
};

// 기술 테스트 문제 조회
export const getTechnicalTestQuestions = async (): Promise<ApiResponse> => {
  const response = await fetch(`${API_BASE_URL}/questions/technical-test`);
  return response.json();
};

// 기술 테스트 제출
export const submitTechnicalTest = async (
  applicantId: string,
  answers: { [questionId: string]: string },
  questionTimes: { [questionId: string]: number },
  totalTime: number
): Promise<ApiResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/applicants/${applicantId}/technical-test`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        answers,
        questionTimes,
        totalTime,
      }),
    }
  );

  return response.json();
};

// 문제 통계 조회
export const getQuestionStats = async (): Promise<ApiResponse> => {
  const response = await fetch(`${API_BASE_URL}/questions/stats`);
  return response.json();
};

// 인성 테스트 문항 조회
export const getPersonalityTestQuestions = async (): Promise<ApiResponse> => {
  const response = await fetch(`${API_BASE_URL}/personality/questions`);
  return response.json();
};

// 인성 테스트 제출
export const submitPersonalityTest = async (
  applicantId: string,
  answers: { [questionId: string]: number },
  totalTime: number
): Promise<ApiResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/personality/${applicantId}/submit`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        answers,
        totalTime,
      }),
    }
  );

  return response.json();
};

// 면접 질문만 재생성 (기술/인성)
export const regenerateInterviewQuestions = async (
  applicantId: string,
  type: "technical" | "personality"
): Promise<ApiResponse> => {
  const adminToken = localStorage.getItem("adminToken");
  if (!adminToken) {
    throw new Error("관리자 인증이 필요합니다.");
  }

  const response = await fetch(
    `${API_BASE_URL}/admin/applicants/${applicantId}/interview-questions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      credentials: "include",
      body: JSON.stringify({ type }),
    }
  );

  return response.json();
};

// AI 리포트 재생성
export const regenerateAIReport = async (
  applicantId: string
): Promise<ApiResponse> => {
  const adminToken = localStorage.getItem("adminToken");
  if (!adminToken) {
    throw new Error("관리자 인증이 필요합니다.");
  }

  const response = await fetch(
    `${API_BASE_URL}/admin/applicants/${applicantId}/regenerate-ai-report`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      credentials: "include",
    }
  );

  const result: ApiResponse = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "서버 오류가 발생했습니다.");
  }

  return result;
};
