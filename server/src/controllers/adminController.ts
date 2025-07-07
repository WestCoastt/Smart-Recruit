import { Request, Response } from "express";
import { Admin, IAdmin } from "../models/Admin";
import { generateToken } from "../middleware/auth";
import Applicant from "../models/Applicant";
import {
  MultipleChoiceQuestion,
  ShortAnswerQuestion,
} from "../models/Question";
import {
  CooperateQuestion,
  ResponsibilityQuestion,
  LeadershipQuestion,
} from "../models/PersonalityQuestion";
import {
  generateAIReport,
  generateInterviewQuestions,
} from "../utils/aiReportGenerator";
import { generateInterviewQuestions as questionGenerator } from "../utils/questionGenerator";

// 관리자 로그인
export const loginAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { username, password } = req.body;

    // 입력값 검증
    if (!username || !password) {
      res.status(400).json({
        success: false,
        message: "아이디와 비밀번호를 모두 입력해주세요.",
      });
      return;
    }

    // 관리자 조회
    const admin = await Admin.findOne({ username });
    if (!admin) {
      res.status(401).json({
        success: false,
        message: "아이디 또는 비밀번호가 올바르지 않습니다.",
      });
      return;
    }

    // 비밀번호 검증
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: "아이디 또는 비밀번호가 올바르지 않습니다.",
      });
      return;
    }

    // JWT 토큰 생성
    const token = generateToken(admin);

    res.status(200).json({
      success: true,
      message: "로그인에 성공했습니다.",
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        createdAt: admin.createdAt,
      },
    });
  } catch (error) {
    console.error("관리자 로그인 오류:", error);
    res.status(500).json({
      success: false,
      message: "서버 내부 오류가 발생했습니다.",
    });
  }
};

// 관리자 회원가입 (개발/테스트용)
export const registerAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { username, password, email } = req.body;

    // 입력값 검증
    if (!username || !password) {
      res.status(400).json({
        success: false,
        message: "아이디와 비밀번호는 필수입니다.",
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: "비밀번호는 최소 6자 이상이어야 합니다.",
      });
      return;
    }

    // 중복 사용자명 검사
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      res.status(409).json({
        success: false,
        message: "이미 존재하는 관리자 아이디입니다.",
      });
      return;
    }

    // 새 관리자 생성
    const newAdmin = new Admin({
      username,
      password,
      email,
    });

    await newAdmin.save();

    // JWT 토큰 생성
    const token = generateToken(newAdmin);

    res.status(201).json({
      success: true,
      message: "관리자 계정이 생성되었습니다.",
      token,
      admin: {
        id: newAdmin._id,
        username: newAdmin.username,
        email: newAdmin.email,
        createdAt: newAdmin.createdAt,
      },
    });
  } catch (error) {
    console.error("관리자 회원가입 오류:", error);
    res.status(500).json({
      success: false,
      message: "서버 내부 오류가 발생했습니다.",
    });
  }
};

// 관리자 정보 조회 (토큰 검증 필요)
export const getAdminProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const admin = req.admin; // 미들웨어에서 설정된 관리자 정보

    if (!admin) {
      res.status(401).json({
        success: false,
        message: "인증되지 않은 요청입니다.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt,
      },
    });
  } catch (error) {
    console.error("관리자 정보 조회 오류:", error);
    res.status(500).json({
      success: false,
      message: "서버 내부 오류가 발생했습니다.",
    });
  }
};

// 토큰 검증
export const verifyToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const admin = req.admin;

    if (!admin) {
      res.status(401).json({
        success: false,
        message: "유효하지 않은 토큰입니다.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "유효한 토큰입니다.",
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error("토큰 검증 오류:", error);
    res.status(500).json({
      success: false,
      message: "서버 내부 오류가 발생했습니다.",
    });
  }
};

// 지원자 목록 조회
export const getApplicants = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // 쿼리 파라미터에서 검색 조건 추출
    const {
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    // 검색 조건 설정
    const searchCondition: any = {};
    if (search) {
      searchCondition.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    // 정렬 조건 설정
    const sortCondition: any = {};
    sortCondition[sortBy as string] = sortOrder === "desc" ? -1 : 1;

    // 페이지네이션 설정
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // 지원자 목록 조회
    const applicants = await Applicant.find(searchCondition)
      .select(
        "name email phone technicalTest.score technicalTest.maxScore personalityTest.scores.total createdAt cheatingDetected aiReport.overallAssessment.recommendation"
      )
      .sort(sortCondition)
      .skip(skip)
      .limit(limitNum);

    // 전체 개수 조회
    const total = await Applicant.countDocuments(searchCondition);

    // 데이터 가공
    const processedApplicants = applicants.map((applicant) => ({
      id: applicant._id,
      name: applicant.name,
      email: applicant.email,
      phone: applicant.phone,
      technicalScore: applicant.technicalTest?.score || 0,
      technicalMaxScore: 30, // 총 문제 수는 항상 30문제로 고정
      personalityScore: applicant.personalityTest?.scores?.total || 0,
      createdAt: applicant.createdAt,
      hasAiReport: !!applicant.aiReport,
      recommendation:
        applicant.aiReport?.overallAssessment?.recommendation || null,
      cheatingDetected: applicant.cheatingDetected || { isCheating: false },
    }));

    res.status(200).json({
      success: true,
      data: {
        applicants: processedApplicants,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalItems: total,
          itemsPerPage: limitNum,
        },
      },
    });
  } catch (error) {
    console.error("지원자 목록 조회 오류:", error);
    res.status(500).json({
      success: false,
      message: "서버 내부 오류가 발생했습니다.",
    });
  }
};

// 지원자 상세 정보 조회
export const getApplicantDetail = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { applicantId } = req.params;

    // 지원자 상세 정보 조회
    const applicant = await Applicant.findById(applicantId);

    if (!applicant) {
      res.status(404).json({
        success: false,
        message: "지원자를 찾을 수 없습니다.",
      });
      return;
    }

    // 부정행위자인 경우 상세보기 차단
    if (applicant.cheatingDetected?.isCheating) {
      res.status(403).json({
        success: false,
        message: "부정행위가 감지된 지원자의 상세 정보는 조회할 수 없습니다.",
        cheatingInfo: {
          reason: applicant.cheatingDetected.reason,
          detectedAt: applicant.cheatingDetected.detectedAt,
          testType: applicant.cheatingDetected.testType,
        },
      });
      return;
    }

    console.log(
      "원본 applicant.technicalTest.results:",
      applicant.technicalTest?.results
    );
    console.log("results 길이:", applicant.technicalTest?.results?.length);
    if (applicant.technicalTest?.results?.[0]) {
      console.log("첫 번째 result:", applicant.technicalTest.results[0]);
    }

    // 기술 테스트 결과가 있으면 질문 정보도 함께 조회
    let enrichedApplicant = applicant.toObject();

    console.log(
      "toObject 후 results:",
      enrichedApplicant.technicalTest?.results
    );
    if (enrichedApplicant.technicalTest?.results?.[0]) {
      console.log(
        "toObject 후 첫 번째 result:",
        enrichedApplicant.technicalTest.results[0]
      );
    }

    // 기술 테스트의 총 문제수 계산 (questionTimes의 개수)
    if (enrichedApplicant.technicalTest) {
      console.log(
        "원본 questionTimes:",
        enrichedApplicant.technicalTest.questionTimes
      );
      console.log(
        "questionTimes 타입:",
        typeof enrichedApplicant.technicalTest.questionTimes
      );

      const questionTimesCount = enrichedApplicant.technicalTest.questionTimes
        ? Object.keys(enrichedApplicant.technicalTest.questionTimes).length
        : 0;

      console.log("questionTimesCount:", questionTimesCount);
      console.log(
        "results.length:",
        enrichedApplicant.technicalTest.results?.length
      );
      console.log("maxScore:", enrichedApplicant.technicalTest.maxScore);

      // questionTimes가 비어있으면 results.length를 사용하고, 그것도 없으면 maxScore 사용
      const totalQuestions =
        questionTimesCount > 0
          ? questionTimesCount
          : enrichedApplicant.technicalTest.results?.length ||
            enrichedApplicant.technicalTest.maxScore;

      console.log("최종 totalQuestions:", totalQuestions);
      (enrichedApplicant.technicalTest as any).totalQuestions = totalQuestions;
    }

    if (applicant.technicalTest) {
      console.log("기술 테스트 질문 정보 조회 시작...");

      // 일단 제출된 문제들의 ID만 가져오기 (안전한 방법)
      let questionIds: string[] = [];
      if (applicant.technicalTest.results) {
        questionIds = applicant.technicalTest.results.map(
          (result) => result.questionId
        );
      }

      console.log("제출된 문제 ID들:", questionIds.length, questionIds);

      // questionTimes에서 추가 문제 ID들 시도 (나중에 미제출 문제용)
      let allQuestionIds = [...questionIds];
      if (applicant.technicalTest.questionTimes) {
        console.log(
          "원본 questionTimes 타입:",
          typeof applicant.technicalTest.questionTimes
        );
        console.log(
          "원본 questionTimes 전체:",
          JSON.stringify(applicant.technicalTest.questionTimes, null, 2)
        );
        console.log(
          "원본 questionTimes keys:",
          Object.keys(applicant.technicalTest.questionTimes)
        );

        // questionTimes가 Map 객체인 경우도 처리
        let questionTimesKeys = [];
        if (applicant.technicalTest.questionTimes instanceof Map) {
          console.log("questionTimes는 Map 객체입니다");
          questionTimesKeys = Array.from(
            applicant.technicalTest.questionTimes.keys()
          );
        } else {
          console.log("questionTimes는 일반 객체입니다");
          questionTimesKeys = Object.keys(
            applicant.technicalTest.questionTimes
          );
        }

        console.log("추출된 questionTimes 키들:", questionTimesKeys);

        const additionalIds = questionTimesKeys.filter((id) => {
          // ObjectId 형식인지 확인하고 이미 포함되지 않은 것만
          return (
            /^[0-9a-fA-F]{24}$/.test(id) &&
            id !== "$__parent" &&
            !questionIds.includes(id)
          );
        });

        console.log("추가 문제 ID들:", additionalIds.length, additionalIds);
        allQuestionIds = [...questionIds, ...additionalIds];
      }

      console.log(
        "전체 조회할 문제 ID들:",
        allQuestionIds.length,
        allQuestionIds
      );

      if (allQuestionIds.length > 0) {
        console.log("DB에서 문제 조회 시작...");
        console.log("조회할 문제 ID들:", allQuestionIds);

        // 객관식과 주관식 질문 모두 조회
        const [multipleChoiceQuestions, shortAnswerQuestions] =
          await Promise.all([
            MultipleChoiceQuestion.find({ _id: { $in: allQuestionIds } }),
            ShortAnswerQuestion.find({ _id: { $in: allQuestionIds } }),
          ]);

        console.log(
          "객관식 문제 조회 결과:",
          multipleChoiceQuestions.length,
          "개"
        );
        console.log(
          "주관식 문제 조회 결과:",
          shortAnswerQuestions.length,
          "개"
        );

        if (multipleChoiceQuestions.length > 0) {
          console.log("첫 번째 객관식 문제 샘플:", {
            id: multipleChoiceQuestions[0]._id,
            question:
              multipleChoiceQuestions[0].question?.substring(0, 50) + "...",
            category: multipleChoiceQuestions[0].category,
          });
        }

        if (shortAnswerQuestions.length > 0) {
          console.log("첫 번째 주관식 문제 샘플:", {
            id: shortAnswerQuestions[0]._id,
            question:
              shortAnswerQuestions[0].question?.substring(0, 50) + "...",
            category: shortAnswerQuestions[0].category,
          });
        }

        // 모든 질문을 하나의 맵으로 합치기
        const questionMap = new Map();

        multipleChoiceQuestions.forEach((q) => {
          questionMap.set((q._id as any).toString(), {
            id: q._id,
            category: q.category,
            question: q.question,
            type: "multiple-choice",
            options: q.options,
            correctAnswer: q.answer,
            explanation: q.explanation,
          });
        });

        shortAnswerQuestions.forEach((q) => {
          questionMap.set((q._id as any).toString(), {
            id: q._id,
            category: q.category,
            question: q.question,
            type: "short-answer",
            correctAnswer: q.answer,
          });
        });

        console.log(
          `${allQuestionIds.length}개 문제 중 ${questionMap.size}개 질문 정보 조회 완료`
        );

        // 전체 문제 정보를 응답에 포함 (questionTimes 키 활용)
        console.log("allQuestions 생성 시작...");

        // questionTimes의 모든 키들을 순서대로 정렬
        const allQuestionIdsFromTimes = allQuestionIds.filter(
          (id) => /^[0-9a-fA-F]{24}$/.test(id) && id !== "$__parent"
        );

        console.log(
          "questionTimes에서 가져온 유효한 문제 ID들:",
          allQuestionIdsFromTimes.length,
          allQuestionIdsFromTimes
        );

        const allQuestions = allQuestionIdsFromTimes.map(
          (questionId, index) => {
            const questionInfo = questionMap.get(questionId);
            const isSubmitted = questionIds.includes(questionId);

            console.log(
              `문제 ${index + 1} (${questionId}): ${
                isSubmitted ? "제출됨" : "미제출"
              }, 정보 ${questionInfo ? "찾음" : "못찾음"}`
            );

            return {
              index: index + 1,
              questionId,
              questionInfo: questionInfo || {
                question: "질문 정보를 찾을 수 없습니다.",
                type: "unknown",
                category: "Unknown",
              },
            };
          }
        );

        (enrichedApplicant.technicalTest as any).allQuestions = allQuestions;
        console.log("allQuestions 생성 완료:", allQuestions.length, "개");

        // 기존 results에도 질문 정보 추가
        if (
          applicant.technicalTest.results &&
          enrichedApplicant.technicalTest
        ) {
          enrichedApplicant.technicalTest.results =
            applicant.technicalTest.results.map((result) => {
              const questionInfo = questionMap.get(result.questionId);
              // Mongoose 문서 객체에서 실제 데이터를 추출
              const resultData = (result as any).toObject
                ? (result as any).toObject()
                : result;
              return {
                ...resultData,
                questionInfo: questionInfo || {
                  question: "질문 정보를 찾을 수 없습니다.",
                  type: "unknown",
                  category: "Unknown",
                },
              };
            });
        }
      }
    }

    // maxScore를 30으로 수정 (총 문제 수 고정)
    if (enrichedApplicant.technicalTest) {
      enrichedApplicant.technicalTest.maxScore = 30;
    }

    // 인성 테스트 질문 정보 조회
    if (
      applicant.personalityTest &&
      applicant.personalityTest.questionDetails
    ) {
      console.log("인성 테스트 질문 정보 조회 시작...");

      const questionIds = applicant.personalityTest.questionDetails.map(
        (detail) => detail.questionId
      );

      console.log("조회할 인성 테스트 질문 ID들:", questionIds.length, "개");

      // 각 카테고리별로 질문 조회
      const [cooperateQuestions, responsibilityQuestions, leadershipQuestions] =
        await Promise.all([
          CooperateQuestion.find({ _id: { $in: questionIds } }),
          ResponsibilityQuestion.find({ _id: { $in: questionIds } }),
          LeadershipQuestion.find({ _id: { $in: questionIds } }),
        ]);

      console.log("인성 테스트 질문 조회 결과:", {
        cooperate: cooperateQuestions.length,
        responsibility: responsibilityQuestions.length,
        leadership: leadershipQuestions.length,
      });

      // 첫 번째 질문 샘플 로그
      if (cooperateQuestions.length > 0) {
        console.log("첫 번째 협업 질문 샘플:", {
          id: cooperateQuestions[0]._id,
          content: cooperateQuestions[0].content?.substring(0, 50) + "...",
          reverse_scoring: cooperateQuestions[0].reverse_scoring,
        });
      }
      if (responsibilityQuestions.length > 0) {
        console.log("첫 번째 책임감 질문 샘플:", {
          id: responsibilityQuestions[0]._id,
          content: responsibilityQuestions[0].content?.substring(0, 50) + "...",
          reverse_scoring: responsibilityQuestions[0].reverse_scoring,
        });
      }
      if (leadershipQuestions.length > 0) {
        console.log("첫 번째 리더십 질문 샘플:", {
          id: leadershipQuestions[0]._id,
          content: leadershipQuestions[0].content?.substring(0, 50) + "...",
          reverse_scoring: leadershipQuestions[0].reverse_scoring,
        });
      }

      // 모든 질문을 하나의 맵으로 합치기
      const personalityQuestionMap = new Map();

      cooperateQuestions.forEach((q) => {
        personalityQuestionMap.set((q._id as any).toString(), {
          id: q._id,
          content: q.content,
          category: "cooperate",
          reverse_scoring: q.reverse_scoring,
        });
      });

      responsibilityQuestions.forEach((q) => {
        personalityQuestionMap.set((q._id as any).toString(), {
          id: q._id,
          content: q.content,
          category: "responsibility",
          reverse_scoring: q.reverse_scoring,
        });
      });

      leadershipQuestions.forEach((q) => {
        personalityQuestionMap.set((q._id as any).toString(), {
          id: q._id,
          content: q.content,
          category: "leadership",
          reverse_scoring: q.reverse_scoring,
        });
      });

      console.log("personalityQuestionMap 크기:", personalityQuestionMap.size);
      console.log(
        "첫 번째 questionDetail ID:",
        applicant.personalityTest.questionDetails[0]?.questionId
      );
      console.log(
        "맵에서 찾은 질문:",
        personalityQuestionMap.get(
          applicant.personalityTest.questionDetails[0]?.questionId
        )
      );

      // questionDetails에 질문 정보 추가
      if (enrichedApplicant.personalityTest) {
        enrichedApplicant.personalityTest.questionDetails =
          applicant.personalityTest.questionDetails.map((detail, index) => {
            const questionInfo = personalityQuestionMap.get(detail.questionId);

            // 명시적으로 모든 필드를 포함하여 반환
            return {
              questionId: detail.questionId,
              category: detail.category,
              selected_answer: detail.selected_answer,
              reverse_scoring: detail.reverse_scoring,
              final_score: detail.final_score,
              questionInfo: questionInfo || {
                content: "질문 정보를 찾을 수 없습니다.",
                category: "unknown",
                reverse_scoring: false,
              },
            };
          });
      }

      console.log("인성 테스트 질문 정보 조회 완료");
      console.log(
        "첫 번째 questionDetail 결과:",
        enrichedApplicant.personalityTest?.questionDetails?.[0]
      );
    }

    console.log(
      "응답 직전 enrichedApplicant.technicalTest.results:",
      enrichedApplicant.technicalTest?.results
    );
    if (enrichedApplicant.technicalTest?.results?.[0]) {
      console.log(
        "응답 직전 첫 번째 result:",
        enrichedApplicant.technicalTest.results[0]
      );
    }

    res.status(200).json({
      success: true,
      data: enrichedApplicant,
    });
  } catch (error) {
    console.error("지원자 상세 정보 조회 오류:", error);
    res.status(500).json({
      success: false,
      message: "서버 내부 오류가 발생했습니다.",
    });
  }
};

// 지원자 통계 조회
export const getApplicantStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const totalApplicants = await Applicant.countDocuments();
    const completedTests = await Applicant.countDocuments({
      technicalTest: { $exists: true },
      personalityTest: { $exists: true },
    });
    const withAiReports = await Applicant.countDocuments({
      aiReport: { $exists: true },
    });

    // 평균 점수 계산
    const avgScores = await Applicant.aggregate([
      {
        $match: {
          "technicalTest.score": { $exists: true },
          "personalityTest.scores.total": { $exists: true },
        },
      },
      {
        $group: {
          _id: null,
          avgTechnicalScore: { $avg: "$technicalTest.score" },
          avgPersonalityScore: { $avg: "$personalityTest.scores.total" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalApplicants,
        completedTests,
        withAiReports,
        avgTechnicalScore: avgScores[0]?.avgTechnicalScore || 0,
        avgPersonalityScore: avgScores[0]?.avgPersonalityScore || 0,
      },
    });
  } catch (error) {
    console.error("지원자 통계 조회 오류:", error);
    res.status(500).json({
      success: false,
      message: "서버 내부 오류가 발생했습니다.",
    });
  }
};

// AI 리포트 재생성
export const regenerateAIReport = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { applicantId } = req.params;

    // 지원자 조회
    const applicant = await Applicant.findById(applicantId);
    if (!applicant) {
      res.status(404).json({
        success: false,
        message: "지원자를 찾을 수 없습니다.",
      });
      return;
    }

    // 기술 테스트와 인성 테스트 완료 여부 확인
    if (!applicant.technicalTest || !applicant.personalityTest) {
      res.status(400).json({
        success: false,
        message:
          "기술 테스트와 인성 테스트를 모두 완료한 지원자만 AI 리포트를 생성할 수 있습니다.",
      });
      return;
    }

    console.log(`${applicant.name} 지원자의 AI 리포트 재생성 시작...`);

    // 기존 AI 리포트 완전 삭제 (스키마 검증 문제 해결)
    console.log("기존 AI 리포트 완전 삭제 중...");
    await Applicant.updateOne(
      { _id: applicantId },
      { $unset: { aiReport: 1 } }
    );
    console.log("기존 AI 리포트 삭제 완료");

    // 지원자 정보 다시 로드
    const updatedApplicant = await Applicant.findById(applicantId);
    if (!updatedApplicant) {
      res.status(404).json({
        success: false,
        message: "지원자를 찾을 수 없습니다.",
      });
      return;
    }

    // 카테고리별 점수 계산 (실제 문제 정보 활용)
    const categoryScores: {
      [key: string]: { correct: number; total: number; percentage: number };
    } = {};

    const questionDetails: Array<{
      questionId: string;
      category: string;
      isCorrect: boolean;
      timeSpent: number;
      difficulty?: string;
    }> = [];

    if (updatedApplicant.technicalTest?.results) {
      // 모든 문제 ID 수집
      const questionIds = updatedApplicant.technicalTest.results.map(
        (result) => result.questionId
      );

      // 문제 정보 조회 (MultipleChoiceQuestion과 ShortAnswerQuestion 모두)
      const [multipleChoiceQuestions, shortAnswerQuestions] = await Promise.all(
        [
          MultipleChoiceQuestion.find({ _id: { $in: questionIds } }),
          ShortAnswerQuestion.find({ _id: { $in: questionIds } }),
        ]
      );

      // 문제 정보 맵 생성
      const questionInfoMap = new Map();
      multipleChoiceQuestions.forEach((q) => {
        questionInfoMap.set((q._id as any).toString(), {
          category: q.category,
          type: "multiple-choice",
        });
      });
      shortAnswerQuestions.forEach((q) => {
        questionInfoMap.set((q._id as any).toString(), {
          category: q.category,
          type: "short-answer",
        });
      });

      // 결과 처리
      updatedApplicant.technicalTest!.results!.forEach((result) => {
        const questionInfo = questionInfoMap.get(result.questionId);
        const category = questionInfo?.category || "기타";

        if (!categoryScores[category]) {
          categoryScores[category] = { correct: 0, total: 0, percentage: 0 };
        }
        categoryScores[category].total += 1;
        if (result.isCorrect) {
          categoryScores[category].correct += 1;
        }

        questionDetails.push({
          questionId: result.questionId,
          category: category,
          isCorrect: result.isCorrect,
          timeSpent: result.timeSpent,
          difficulty: "medium",
        });
      });

      // 퍼센티지 계산
      Object.keys(categoryScores).forEach((category) => {
        const cat = categoryScores[category];
        cat.percentage = cat.total > 0 ? (cat.correct / cat.total) * 100 : 0;
      });
    }

    console.log("카테고리별 점수:", categoryScores);

    // AI 리포트 데이터 준비
    const applicantData = {
      name: updatedApplicant.name,
      email: updatedApplicant.email,
      phone: updatedApplicant.phone,
      technicalTest: {
        totalScore: updatedApplicant.technicalTest!.score,
        categoryScores: categoryScores,
        questionDetails: questionDetails,
        totalTime: updatedApplicant.technicalTest!.totalTime,
      },
      personalityTest: {
        scores: updatedApplicant.personalityTest!.scores,
        questionDetails:
          updatedApplicant.personalityTest!.questionDetails?.map((detail) => ({
            questionId: detail.questionId,
            category: detail.category,
            selected_answer: detail.selected_answer,
            reverse_scoring: detail.reverse_scoring,
            final_score: detail.final_score,
          })) || [],
        totalTime: updatedApplicant.personalityTest!.totalTime,
      },
    };

    console.log(
      "AI 리포트 생성 데이터:",
      JSON.stringify(applicantData, null, 2)
    );

    // AI 리포트 생성
    console.log("=== AI 리포트 생성 시작 ===");
    const [aiReport, interviewQuestions] = await Promise.all([
      generateAIReport(applicantData),
      generateInterviewQuestions(applicantData),
    ]);

    console.log("=== AI 리포트 생성 완료 ===");
    console.log("aiReport 존재 여부:", !!aiReport);
    console.log("interviewQuestions 존재 여부:", !!interviewQuestions);

    if (aiReport) {
      console.log("aiReport 구조:", Object.keys(aiReport));
      if (aiReport.technicalAnalysis) {
        console.log(
          "technicalAnalysis 구조:",
          Object.keys(aiReport.technicalAnalysis)
        );
        console.log(
          "strengths 타입:",
          typeof aiReport.technicalAnalysis.strengths,
          Array.isArray(aiReport.technicalAnalysis.strengths)
        );
        console.log(
          "weaknesses 타입:",
          typeof aiReport.technicalAnalysis.weaknesses,
          Array.isArray(aiReport.technicalAnalysis.weaknesses)
        );
      }
    }

    if (aiReport && interviewQuestions) {
      console.log("=== 저장 전 데이터 구조 정규화 시작 ===");
      console.log("변환 전 aiReport 구조:", JSON.stringify(aiReport, null, 2));

      // 재귀적으로 모든 배열을 문자열로 변환
      const convertedAiReport = convertArraysToStrings(aiReport);

      console.log(
        "변환 후 aiReport 구조:",
        JSON.stringify(convertedAiReport, null, 2)
      );
      console.log("=== 저장 전 데이터 구조 정규화 완료 ===");

      // AI 리포트 저장 (변환된 데이터 사용)
      updatedApplicant.aiReport = {
        ...convertedAiReport,
        interviewQuestions,
        generatedAt: new Date(),
        modelUsed: "gpt-4",
      };

      await updatedApplicant.save();

      console.log(`${updatedApplicant.name} 지원자의 AI 리포트 재생성 완료`);

      res.status(200).json({
        success: true,
        message: "AI 리포트가 성공적으로 재생성되었습니다.",
        data: updatedApplicant.aiReport,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "AI 리포트 생성 중 오류가 발생했습니다.",
      });
    }
  } catch (error) {
    console.error("AI 리포트 재생성 오류:", error);
    res.status(500).json({
      success: false,
      message: "서버 내부 오류가 발생했습니다.",
    });
  }
};

// 배열을 문자열로 변환하는 재귀 함수
const convertArraysToStrings = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    // interviewQuestions 필드는 배열 형태 유지
    if (obj[0] && typeof obj[0] === "string") {
      return obj;
    }
    // 나머지 배열은 문자열로 변환
    return obj.join(" ");
  }

  if (typeof obj === "object") {
    // 객체인 경우 재귀적으로 처리
    const result: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        result[key] = convertArraysToStrings(obj[key]);
      }
    }
    return result;
  }

  // 기본 타입인 경우 그대로 반환
  return obj;
};

// 면접 질문만 재생성 (기술/인성 구분)
export const regenerateInterviewQuestions = async (
  req: Request,
  res: Response
) => {
  // ... 기존 코드 유지 ...
};
