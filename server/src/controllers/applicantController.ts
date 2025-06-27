import { Request, Response } from "express";
import Applicant, { IApplicant } from "../models/Applicant";
import {
  MultipleChoiceQuestion,
  ShortAnswerQuestion,
} from "../models/Question";

// 객관식 답변에서 선택지 추출 함수
const extractChoice = (answer: string): string => {
  // "A. try-catch-finally" -> "A"
  // "B. 스레드 동기화" -> "B"
  const match = answer.match(/^([A-Z])\./);
  return match ? match[1] : answer;
};

// 정규화 함수 (대소문자, 공백, 특수문자 제거)
const normalizeAnswer = (answer: string): string => {
  return answer
    .toLowerCase()
    .replace(/[\s\-_\.]/g, "") // 공백, 하이픈, 언더스코어, 점 제거
    .trim();
};

// 주관식 답안 채점 함수
const checkShortAnswer = (
  userAnswer: string,
  correctAnswers: string[]
): boolean => {
  const normalizedUserAnswer = normalizeAnswer(userAnswer);

  return correctAnswers.some((correctAnswer) => {
    const normalizedCorrectAnswer = normalizeAnswer(correctAnswer);
    return normalizedUserAnswer === normalizedCorrectAnswer;
  });
};

// 지원자 정보 저장
export const createApplicant = async (req: Request, res: Response) => {
  try {
    const { name, email, phone } = req.body;

    // 입력 데이터 검증
    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "모든 필드를 입력해주세요.",
        errors: {
          name: !name ? "이름은 필수입니다" : null,
          email: !email ? "이메일은 필수입니다" : null,
          phone: !phone ? "연락처는 필수입니다" : null,
        },
      });
    }

    // 이메일 중복 체크
    const existingApplicant = await Applicant.findOne({ email });
    if (existingApplicant) {
      return res.status(409).json({
        success: false,
        message: "이미 등록된 이메일입니다.",
        applicantId: existingApplicant._id,
      });
    }

    // 새 지원자 생성
    const newApplicant: IApplicant = new Applicant({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
    });

    // 데이터베이스에 저장
    const savedApplicant = await newApplicant.save();

    // 성공 응답
    res.status(201).json({
      success: true,
      message: "지원자 정보가 성공적으로 저장되었습니다.",
      data: {
        applicantId: savedApplicant._id,
        name: savedApplicant.name,
        email: savedApplicant.email,
        phone: savedApplicant.phone,
        createdAt: savedApplicant.createdAt,
      },
    });
  } catch (error: any) {
    console.error("지원자 정보 저장 중 오류:", error);

    // MongoDB 유효성 검증 오류 처리
    if (error.name === "ValidationError") {
      const errors: { [key: string]: string } = {};
      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });

      return res.status(400).json({
        success: false,
        message: "입력 데이터가 올바르지 않습니다.",
        errors,
      });
    }

    // 중복 키 오류 처리
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "이미 등록된 이메일입니다.",
      });
    }

    // 일반 서버 오류
    res.status(500).json({
      success: false,
      message: "서버 내부 오류가 발생했습니다.",
    });
  }
};

// 지원자 목록 조회 (관리자용)
export const getAllApplicants = async (req: Request, res: Response) => {
  try {
    const applicants = await Applicant.find()
      .select("name email phone createdAt")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "지원자 목록을 성공적으로 조회했습니다.",
      data: applicants,
      count: applicants.length,
    });
  } catch (error) {
    console.error("지원자 목록 조회 중 오류:", error);
    res.status(500).json({
      success: false,
      message: "서버 내부 오류가 발생했습니다.",
    });
  }
};

// 특정 지원자 정보 조회
export const getApplicantById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const applicant = await Applicant.findById(id);
    if (!applicant) {
      return res.status(404).json({
        success: false,
        message: "지원자를 찾을 수 없습니다.",
      });
    }

    res.status(200).json({
      success: true,
      message: "지원자 정보를 성공적으로 조회했습니다.",
      data: applicant,
    });
  } catch (error) {
    console.error("지원자 정보 조회 중 오류:", error);
    res.status(500).json({
      success: false,
      message: "서버 내부 오류가 발생했습니다.",
    });
  }
};

// 기술 테스트 제출
export const submitTechnicalTest = async (req: Request, res: Response) => {
  try {
    console.log("기술 테스트 제출 요청 받음");
    console.log("Request params:", req.params);
    console.log("Request body:", req.body);

    const { applicantId } = req.params;
    const { answers, questionTimes, totalTime } = req.body;

    // 입력 데이터 유효성 검사
    if (!answers || !questionTimes || totalTime === undefined) {
      console.log("필수 데이터 누락:", {
        answers: !!answers,
        questionTimes: !!questionTimes,
        totalTime,
      });
      return res.status(400).json({
        success: false,
        message:
          "필수 데이터가 누락되었습니다. (answers, questionTimes, totalTime 필요)",
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

    // 이미 기술 테스트를 제출했는지 확인 (개발 중 주석 처리)
    /*
    if (applicant.technicalTest) {
      console.log('이미 기술 테스트 제출됨:', applicantId);
      return res.status(400).json({
        success: false,
        message: '이미 기술 테스트를 제출하였습니다.',
      });
    }
    */

    // 문제 ID들 추출
    const questionIds = Object.keys(answers);
    console.log("문제 IDs:", questionIds);

    if (questionIds.length === 0) {
      console.log("답변이 없음");
      return res.status(400).json({
        success: false,
        message: "제출할 답변이 없습니다.",
      });
    }

    // 객관식 문제들 조회
    console.log("객관식 문제 조회 중...");
    const multipleChoiceQuestions = await MultipleChoiceQuestion.find({
      _id: { $in: questionIds },
    });
    console.log("객관식 문제 개수:", multipleChoiceQuestions.length);

    // 주관식 문제들 조회
    console.log("주관식 문제 조회 중...");
    const shortAnswerQuestions = await ShortAnswerQuestion.find({
      _id: { $in: questionIds },
    });
    console.log("주관식 문제 개수:", shortAnswerQuestions.length);

    // 모든 문제들을 하나의 배열로 합치기
    const allQuestions = [
      ...multipleChoiceQuestions.map((q) => ({
        ...q.toObject(),
        type: "multiple-choice",
      })),
      ...shortAnswerQuestions.map((q) => ({
        ...q.toObject(),
        type: "short-answer",
      })),
    ];

    console.log("전체 문제 개수:", allQuestions.length);

    if (allQuestions.length === 0) {
      console.log("문제를 찾을 수 없음");
      return res.status(400).json({
        success: false,
        message: "제출된 문제 ID에 해당하는 문제를 찾을 수 없습니다.",
      });
    }

    // 채점 진행
    console.log("채점 시작...");
    let score = 0;
    const maxScore = allQuestions.length;
    const results = [];

    for (const question of allQuestions) {
      const questionId = (question._id as any).toString();
      const userAnswer = answers[questionId] || "";
      const timeSpent = questionTimes[questionId] || 0;
      let isCorrect = false;

      if (question.type === "multiple-choice") {
        // 객관식 채점 (정확히 일치해야 함)
        isCorrect = extractChoice(userAnswer) === question.answer;
      } else {
        // 주관식 채점 (유연한 매칭)
        if (Array.isArray(question.answer)) {
          isCorrect = checkShortAnswer(userAnswer, question.answer);
        }
      }

      if (isCorrect) {
        score++;
      }

      results.push({
        questionId,
        userAnswer,
        correctAnswer: question.answer,
        isCorrect,
        timeSpent,
      });
    }

    console.log("채점 완료:", { score, maxScore });

    // 기술 테스트 결과 저장
    console.log("결과 저장 중...");
    applicant.technicalTest = {
      answers,
      questionTimes,
      totalTime,
      score,
      maxScore,
      results,
      submittedAt: new Date(),
    };

    await applicant.save();
    console.log("저장 완료");

    res.status(200).json({
      success: true,
      message: "기술 테스트가 성공적으로 제출되었습니다.",
      data: {
        score,
        maxScore,
        percentage: Math.round((score / maxScore) * 100),
      },
    });
  } catch (error: any) {
    console.error("기술 테스트 제출 오류:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "기술 테스트 제출 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
};

// 기술 테스트 데이터 리셋 (개발용)
export const resetTechnicalTest = async (req: Request, res: Response) => {
  try {
    const { applicantId } = req.params;

    console.log("기술 테스트 데이터 리셋 요청:", applicantId);

    const applicant = await Applicant.findById(applicantId);
    if (!applicant) {
      return res.status(404).json({
        success: false,
        message: "지원자를 찾을 수 없습니다.",
      });
    }

    // 기술 테스트 데이터 삭제
    applicant.technicalTest = undefined;
    await applicant.save();

    console.log("기술 테스트 데이터 리셋 완료:", applicantId);

    res.status(200).json({
      success: true,
      message: "기술 테스트 데이터가 리셋되었습니다.",
    });
  } catch (error: any) {
    console.error("기술 테스트 리셋 오류:", error);
    res.status(500).json({
      success: false,
      message: "기술 테스트 리셋 중 오류가 발생했습니다.",
    });
  }
};

// 지원자 목록 조회
export const getApplicants = async (req: Request, res: Response) => {
  try {
    const applicants = await Applicant.find()
      .select(
        "name email phone createdAt technicalTest.score technicalTest.maxScore"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: applicants,
    });
  } catch (error: any) {
    console.error("지원자 목록 조회 오류:", error);
    res.status(500).json({
      success: false,
      message: "지원자 목록 조회 중 오류가 발생했습니다.",
    });
  }
};
