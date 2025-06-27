import { Request, Response } from "express";
import mongoose from "mongoose";
import {
  MultipleChoiceQuestion,
  ShortAnswerQuestion,
  QuestionCategory,
} from "../models/Question";

// 카테고리별로 균등하게 문제를 뽑아오는 함수 (중복 방지)
const getQuestionsPerCategory = async (
  model: any,
  questionsPerCategory: number,
  categories: QuestionCategory[],
  excludeIds: string[] = []
) => {
  const questions = [];

  for (const category of categories) {
    // 각 카테고리에서 지정된 개수만큼 무작위로 뽑기 (이미 선택된 문제 제외)
    const categoryQuestions = await model.aggregate([
      {
        $match: {
          category,
          _id: {
            $nin: excludeIds.map((id) => new mongoose.Types.ObjectId(id)),
          },
        },
      },
      { $sample: { size: questionsPerCategory } },
      { $project: { answer: 0 } }, // answer 필드 제외
    ]);

    questions.push(...categoryQuestions);
    // 선택된 문제 ID를 제외 목록에 추가
    excludeIds.push(...categoryQuestions.map((q: any) => q._id.toString()));
  }

  return questions;
};

// 기술 역량 테스트 문제 조회
export const getTechnicalTestQuestions = async (
  req: Request,
  res: Response
) => {
  try {
    const categories: QuestionCategory[] = [
      "Java",
      "Database",
      "Operating System",
      "Cloud",
      "Security",
      "Network",
    ];

    // 객관식 20문제 (카테고리당 약 3-4문제)
    const multipleChoiceQuestionsPerCategory = Math.floor(
      20 / categories.length
    );
    const multipleChoiceRemaining = 20 % categories.length;

    // 주관식 10문제 (카테고리당 약 1-2문제)
    const shortAnswerQuestionsPerCategory = Math.floor(10 / categories.length);
    const shortAnswerRemaining = 10 % categories.length;

    // 중복 방지를 위한 선택된 문제 ID 추적
    const selectedIds: string[] = [];

    // 각 카테고리에서 기본 개수만큼 뽑기
    let multipleChoiceQuestions = await getQuestionsPerCategory(
      MultipleChoiceQuestion,
      multipleChoiceQuestionsPerCategory,
      categories,
      selectedIds
    );

    let shortAnswerQuestions = await getQuestionsPerCategory(
      ShortAnswerQuestion,
      shortAnswerQuestionsPerCategory,
      categories,
      selectedIds
    );

    // 남은 문제들을 무작위 카테고리에서 추가로 뽑기 (중복 제외)
    if (multipleChoiceRemaining > 0) {
      const additionalMultipleChoice = await MultipleChoiceQuestion.aggregate([
        {
          $match: {
            _id: {
              $nin: selectedIds.map((id) => new mongoose.Types.ObjectId(id)),
            },
          },
        },
        { $sample: { size: multipleChoiceRemaining } },
        { $project: { answer: 0 } },
      ]);
      multipleChoiceQuestions.push(...additionalMultipleChoice);
      selectedIds.push(
        ...additionalMultipleChoice.map((q: any) => q._id.toString())
      );
    }

    if (shortAnswerRemaining > 0) {
      const additionalShortAnswer = await ShortAnswerQuestion.aggregate([
        {
          $match: {
            _id: {
              $nin: selectedIds.map((id) => new mongoose.Types.ObjectId(id)),
            },
          },
        },
        { $sample: { size: shortAnswerRemaining } },
        { $project: { answer: 0 } },
      ]);
      shortAnswerQuestions.push(...additionalShortAnswer);
      selectedIds.push(
        ...additionalShortAnswer.map((q: any) => q._id.toString())
      );
    }

    // 문제 순서 무작위로 섞기
    const shuffleArray = (array: any[]) => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    multipleChoiceQuestions = shuffleArray(multipleChoiceQuestions);
    shortAnswerQuestions = shuffleArray(shortAnswerQuestions);

    // 문제에 순서 번호 추가
    const allQuestions = [
      ...multipleChoiceQuestions.map((q, index) => ({
        ...q,
        questionNumber: index + 1,
        type: "multiple-choice",
      })),
      ...shortAnswerQuestions.map((q, index) => ({
        ...q,
        questionNumber: multipleChoiceQuestions.length + index + 1,
        type: "short-answer",
      })),
    ];

    // 전체 문제 순서도 무작위로 섞기
    const finalQuestions = shuffleArray(allQuestions).map((q, index) => ({
      ...q,
      questionNumber: index + 1,
    }));

    res.status(200).json({
      success: true,
      message: "기술 역량 테스트 문제를 성공적으로 조회했습니다.",
      data: {
        questions: finalQuestions,
        totalQuestions: finalQuestions.length,
        multipleChoiceCount: multipleChoiceQuestions.length,
        shortAnswerCount: shortAnswerQuestions.length,
        timeLimit: 30, // 30분
        categories: categories,
      },
    });
  } catch (error) {
    console.error("기술 역량 테스트 문제 조회 중 오류:", error);
    res.status(500).json({
      success: false,
      message: "서버 내부 오류가 발생했습니다.",
    });
  }
};

// 문제 통계 조회 (관리자용)
export const getQuestionStats = async (req: Request, res: Response) => {
  try {
    const categories: QuestionCategory[] = [
      "Java",
      "Database",
      "Operating System",
      "Cloud",
      "Security",
      "Network",
    ];

    const stats = await Promise.all(
      categories.map(async (category) => {
        const multipleChoiceCount = await MultipleChoiceQuestion.countDocuments(
          { category }
        );
        const shortAnswerCount = await ShortAnswerQuestion.countDocuments({
          category,
        });

        return {
          category,
          multipleChoiceCount,
          shortAnswerCount,
          totalCount: multipleChoiceCount + shortAnswerCount,
        };
      })
    );

    const totalMultipleChoice = await MultipleChoiceQuestion.countDocuments();
    const totalShortAnswer = await ShortAnswerQuestion.countDocuments();

    res.status(200).json({
      success: true,
      message: "문제 통계를 성공적으로 조회했습니다.",
      data: {
        categoryStats: stats,
        totalStats: {
          multipleChoiceCount: totalMultipleChoice,
          shortAnswerCount: totalShortAnswer,
          totalCount: totalMultipleChoice + totalShortAnswer,
        },
      },
    });
  } catch (error) {
    console.error("문제 통계 조회 중 오류:", error);
    res.status(500).json({
      success: false,
      message: "서버 내부 오류가 발생했습니다.",
    });
  }
};
