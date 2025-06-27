import { Request, Response } from "express";
import {
  CooperateQuestion,
  ResponsibilityQuestion,
  LeadershipQuestion,
} from "../models/PersonalityQuestion";
import Applicant from "../models/Applicant";

// 인성 테스트 문항 조회 (총 120문항)
export const getPersonalityTestQuestions = async (
  req: Request,
  res: Response
) => {
  try {
    console.log("인성 테스트 문항 조회 요청");

    // 각 컬렉션에서 모든 문항 조회
    const [cooperateQuestions, responsibilityQuestions, leadershipQuestions] =
      await Promise.all([
        CooperateQuestion.find().select("_id content"),
        ResponsibilityQuestion.find().select("_id content"),
        LeadershipQuestion.find().select("_id content"),
      ]);

    console.log("문항 조회 결과:", {
      cooperate: cooperateQuestions.length,
      responsibility: responsibilityQuestions.length,
      leadership: leadershipQuestions.length,
    });

    // 모든 문항을 하나의 배열로 합치고 카테고리 정보 추가
    const allQuestions = [
      ...cooperateQuestions.map((q) => ({
        _id: q._id,
        content: q.content,
        category: "cooperate",
      })),
      ...responsibilityQuestions.map((q) => ({
        _id: q._id,
        content: q.content,
        category: "responsibility",
      })),
      ...leadershipQuestions.map((q) => ({
        _id: q._id,
        content: q.content,
        category: "leadership",
      })),
    ];

    // 문항을 무작위로 섞기
    const shuffledQuestions = allQuestions.sort(() => Math.random() - 0.5);

    // 총 120문항 선택 (만약 전체 문항이 120개 미만이면 모든 문항 반환)
    const selectedQuestions = shuffledQuestions.slice(0, 120);

    console.log("선택된 문항 수:", selectedQuestions.length);

    res.status(200).json({
      success: true,
      message: "인성 테스트 문항을 성공적으로 조회했습니다.",
      data: {
        questions: selectedQuestions,
        totalQuestions: selectedQuestions.length,
      },
    });
  } catch (error: any) {
    console.error("인성 테스트 문항 조회 오류:", error);
    res.status(500).json({
      success: false,
      message: "인성 테스트 문항 조회 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
};

// 인성 테스트 제출
export const submitPersonalityTest = async (req: Request, res: Response) => {
  try {
    console.log("인성 테스트 제출 요청");
    console.log("Request params:", req.params);
    console.log("Request body:", req.body);

    const { applicantId } = req.params;
    const { answers, totalTime } = req.body;

    // 입력 데이터 유효성 검사
    if (!answers || totalTime === undefined) {
      console.log("필수 데이터 누락:", { answers: !!answers, totalTime });
      return res.status(400).json({
        success: false,
        message: "필수 데이터가 누락되었습니다. (answers, totalTime 필요)",
      });
    }

    // 지원자 조회
    console.log("지원자 조회 중:", applicantId);
    const applicant = await Applicant.findById(applicantId);
    if (!applicant) {
      console.log("지원자를 찾을 수 없음:", applicantId);
      return res.status(404).json({
        success: false,
        message: "지원자를 찾을 수 없습니다.",
      });
    }

    // 이미 인성 테스트를 제출했는지 확인 (개발 중 주석 처리)
    /*
    if (applicant.personalityTest) {
      console.log('이미 인성 테스트 제출됨:', applicantId);
      return res.status(400).json({
        success: false,
        message: '이미 인성 테스트를 제출하였습니다.',
      });
    }
    */

    // 답변 개수 확인
    const answerCount = Object.keys(answers).length;
    console.log("제출된 답변 개수:", answerCount);

    if (answerCount === 0) {
      console.log("답변이 없음");
      return res.status(400).json({
        success: false,
        message: "제출할 답변이 없습니다.",
      });
    }

    // 채점 로직 실행
    console.log("인성 테스트 채점 시작...");
    const { scores, questionDetails } = await calculatePersonalityScores(
      answers
    );
    console.log("채점 결과:", scores);
    console.log("문항별 상세 결과:", questionDetails);

    // 인성 테스트 결과 저장
    console.log("인성 테스트 결과 저장 중...");
    applicant.personalityTest = {
      answers,
      totalTime,
      submittedAt: new Date(),
      questionDetails,
      scores,
    };

    await applicant.save();
    console.log("인성 테스트 저장 완료");

    res.status(200).json({
      success: true,
      message: "인성 테스트가 성공적으로 제출되었습니다.",
      data: {
        answerCount,
        totalTime,
        scores,
      },
    });
  } catch (error: any) {
    console.error("인성 테스트 제출 오류:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "인성 테스트 제출 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
};

// 인성 테스트 채점 함수
const calculatePersonalityScores = async (answers: {
  [questionId: string]: number;
}) => {
  console.log("채점 함수 시작, 답변 개수:", Object.keys(answers).length);

  // 카테고리별 점수 초기화
  const categoryScores = {
    cooperate: 0,
    responsibility: 0,
    leadership: 0,
  };

  // 문항별 상세 데이터 배열
  const questionDetails: {
    questionId: string;
    category: string;
    selected_answer: number;
    reverse_scoring: boolean;
    final_score: number;
  }[] = [];

  // 각 답변에 대해 채점
  for (const [questionId, answer] of Object.entries(answers)) {
    try {
      // 문항 정보 조회 (어느 컬렉션에 있는지 확인)
      let question = await CooperateQuestion.findById(questionId);
      let category = "cooperate";

      if (!question) {
        question = await ResponsibilityQuestion.findById(questionId);
        category = "responsibility";
      }

      if (!question) {
        question = await LeadershipQuestion.findById(questionId);
        category = "leadership";
      }

      if (!question) {
        console.warn(`문항을 찾을 수 없음: ${questionId}`);
        continue;
      }

      // 점수 계산 (역채점 고려)
      let score = answer;
      if (question.reverse_scoring) {
        // 역채점: 1->5, 2->4, 3->3, 4->2, 5->1
        score = 6 - answer;
      }

      // 문항별 상세 데이터 저장
      questionDetails.push({
        questionId,
        category,
        selected_answer: answer,
        reverse_scoring: question.reverse_scoring,
        final_score: score,
      });

      // 카테고리별 점수 누적
      categoryScores[category as keyof typeof categoryScores] += score;
    } catch (error) {
      console.error(`문항 ${questionId} 채점 오류:`, error);
    }
  }

  console.log("카테고리별 원점수:", categoryScores);

  // 레벨 판정 함수 (카테고리명 포함)
  const getLevel = (score: number, category: string): string => {
    const categoryName =
      {
        cooperate: "협업",
        responsibility: "책임감",
        leadership: "리더십",
      }[category] || category;

    if (score >= 160) return `높은 ${categoryName}`;
    if (score >= 120) return `보통 ${categoryName}`;
    return `낮은 ${categoryName}`;
  };

  // 최종 결과 구성
  const scores = {
    cooperate: {
      score: categoryScores.cooperate,
      level: getLevel(categoryScores.cooperate, "cooperate"),
    },
    responsibility: {
      score: categoryScores.responsibility,
      level: getLevel(categoryScores.responsibility, "responsibility"),
    },
    leadership: {
      score: categoryScores.leadership,
      level: getLevel(categoryScores.leadership, "leadership"),
    },
    total:
      categoryScores.cooperate +
      categoryScores.responsibility +
      categoryScores.leadership,
  };

  console.log("최종 채점 결과:", scores);
  console.log("문항별 상세 데이터 개수:", questionDetails.length);

  return { scores, questionDetails };
};

// 인성 테스트 데이터 리셋 (개발용)
export const resetPersonalityTest = async (req: Request, res: Response) => {
  try {
    const { applicantId } = req.params;

    console.log("인성 테스트 데이터 리셋 요청:", applicantId);

    const applicant = await Applicant.findById(applicantId);
    if (!applicant) {
      return res.status(404).json({
        success: false,
        message: "지원자를 찾을 수 없습니다.",
      });
    }

    // 인성 테스트 데이터 삭제
    applicant.personalityTest = undefined;
    await applicant.save();

    console.log("인성 테스트 데이터 리셋 완료:", applicantId);

    res.status(200).json({
      success: true,
      message: "인성 테스트 데이터가 리셋되었습니다.",
    });
  } catch (error: any) {
    console.error("인성 테스트 리셋 오류:", error);
    res.status(500).json({
      success: false,
      message: "인성 테스트 리셋 중 오류가 발생했습니다.",
    });
  }
};
