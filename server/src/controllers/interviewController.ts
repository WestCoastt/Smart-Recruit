import { Request, Response } from "express";
import Applicant from "../models/Applicant";
import {
  MultipleChoiceQuestion,
  ShortAnswerQuestion,
} from "../models/Question";
import { generateInterviewQuestions as questionGenerator } from "../utils/questionGenerator";

interface InterviewQuestion {
  category: string;
  question: string;
  purpose: string;
}

interface FollowUpQuestion {
  type: string;
  question: string;
  purpose: string;
}

interface AIReport {
  report: {
    technicalAnalysis: {
      overallLevel: string;
      detailedAssessment: string;
      strengths: string;
      weaknesses: string;
      timeEfficiency: string;
    };
    personalityAnalysis: {
      cooperation: string;
      responsibility: string;
      leadership: string;
      organizationFit: string;
      growthPotential: string;
    };
    overallAssessment: {
      recommendation: "high" | "medium" | "low";
      comprehensiveEvaluation: string;
      keyStrengths: string;
      developmentAreas: string;
    };
    interviewFocus: {
      technicalQuestions: string;
      personalityQuestions: string;
    };
  };
  interviewQuestions: {
    technical: InterviewQuestion[];
    personality: InterviewQuestion[];
    followUp: FollowUpQuestion[];
  };
  generatedAt: Date;
  modelUsed: string;
}

// 면접 질문만 재생성 (기술/인성 구분)
export const regenerateInterviewQuestions = async (
  req: Request,
  res: Response
) => {
  try {
    console.log("[면접 질문 재생성] 시작");
    const { applicantId } = req.params;
    const { type } = req.body as { type: "technical" | "personality" };
    console.log("[면접 질문 재생성] 요청 정보:", { applicantId, type });

    if (!["technical", "personality"].includes(type)) {
      console.log("[면접 질문 재생성] 잘못된 type:", type);
      return res.status(400).json({
        success: false,
        message: "type은 technical 또는 personality만 허용됩니다.",
      });
    }

    // 지원자 조회
    console.log("[면접 질문 재생성] 지원자 조회 시작");
    const applicant = await Applicant.findById(applicantId);
    if (!applicant) {
      console.log("[면접 질문 재생성] 지원자를 찾을 수 없음:", applicantId);
      return res
        .status(404)
        .json({ success: false, message: "지원자를 찾을 수 없습니다." });
    }
    console.log("[면접 질문 재생성] 지원자 조회 성공:", applicant.name);

    if (!applicant.technicalTest || !applicant.personalityTest) {
      console.log("[면접 질문 재생성] 테스트 미완료:", {
        technicalTest: !!applicant.technicalTest,
        personalityTest: !!applicant.personalityTest,
      });
      return res.status(400).json({
        success: false,
        message:
          "기술/인성 테스트를 모두 완료해야 면접 질문을 재생성할 수 있습니다.",
      });
    }

    // 카테고리별 점수 계산
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

    // 기술 테스트 결과 처리
    if (applicant.technicalTest.results) {
      console.log("[면접 질문 재생성] 기술 테스트 결과 처리 시작");
      const questionIds = applicant.technicalTest.results.map(
        (result) => result.questionId
      );

      // 문제 정보 조회
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
      applicant.technicalTest.results.forEach((result) => {
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

    // 질문 생성을 위한 데이터 준비
    console.log("[면접 질문 재생성] 데이터 준비");
    const applicantData = {
      name: applicant.name,
      email: applicant.email,
      phone: applicant.phone,
      technicalTest: {
        totalScore: applicant.technicalTest.score,
        categoryScores: categoryScores,
        questionDetails: questionDetails,
        totalTime: applicant.technicalTest.totalTime,
      },
      personalityTest: {
        scores: applicant.personalityTest.scores,
        questionDetails: applicant.personalityTest.questionDetails || [],
        totalTime: applicant.personalityTest.totalTime,
      },
    };
    console.log(
      "[면접 질문 재생성] 준비된 데이터:",
      JSON.stringify(applicantData, null, 2)
    );

    console.log("[면접 질문 재생성] 질문 생성 시작");
    const interviewQuestions = await questionGenerator(applicantData);
    console.log(
      "[면접 질문 재생성] 생성된 질문:",
      JSON.stringify(interviewQuestions, null, 2)
    );

    // aiReport가 없으면 기본 구조로 생성
    if (!applicant.aiReport) {
      console.log("[면접 질문 재생성] aiReport 기본 구조 생성");
      const defaultAIReport: AIReport = {
        report: {
          technicalAnalysis: {
            overallLevel: "",
            detailedAssessment: "",
            strengths: "",
            weaknesses: "",
            timeEfficiency: "",
          },
          personalityAnalysis: {
            cooperation: "",
            responsibility: "",
            leadership: "",
            organizationFit: "",
            growthPotential: "",
          },
          overallAssessment: {
            recommendation: "medium",
            comprehensiveEvaluation: "",
            keyStrengths: "",
            developmentAreas: "",
          },
          interviewFocus: {
            technicalQuestions: "",
            personalityQuestions: "",
          },
        },
        interviewQuestions: {
          technical: [],
          personality: [],
          followUp: [],
        },
        generatedAt: new Date(),
        modelUsed: "custom",
      };
      applicant.aiReport = defaultAIReport;
    }

    if (applicant.aiReport) {
      console.log(
        "[면접 질문 재생성] 기존 질문:",
        JSON.stringify(applicant.aiReport.interviewQuestions, null, 2)
      );
      // 해당 타입의 질문만 업데이트
      applicant.aiReport.interviewQuestions[type] = interviewQuestions[type];
      applicant.aiReport.generatedAt = new Date();
      console.log(
        "[면접 질문 재생성] 갱신된 질문:",
        JSON.stringify(applicant.aiReport.interviewQuestions, null, 2)
      );
    }

    console.log("[면접 질문 재생성] 저장 시작");
    await applicant.save();
    console.log("[면접 질문 재생성] 저장 완료");

    return res.json({
      success: true,
      message: `${
        type === "technical" ? "기술" : "인성"
      } 면접 질문이 재생성되었습니다.`,
      data: interviewQuestions[type],
    });
  } catch (err) {
    console.error("[면접 질문 재생성] 오류 발생:", err);
    return res.status(500).json({ success: false, message: "서버 오류" });
  }
};
