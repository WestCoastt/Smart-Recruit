import "dotenv/config";
import OpenAI from "openai";
import {
  CooperateQuestion,
  ResponsibilityQuestion,
  LeadershipQuestion,
} from "../models/PersonalityQuestion";
import {
  MultipleChoiceQuestion,
  ShortAnswerQuestion,
} from "../models/Question";

// OpenAI API 키 확인
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
console.log("OpenAI API 키 존재 여부:", !!OPENAI_API_KEY);
console.log("OpenAI API 키 길이:", OPENAI_API_KEY ? OPENAI_API_KEY.length : 0);

let openai: OpenAI | null = null;

if (OPENAI_API_KEY && OPENAI_API_KEY.length > 10) {
  try {
    openai = new OpenAI({
      apiKey: OPENAI_API_KEY,
    });
    console.log("OpenAI 클라이언트 초기화 성공");
  } catch (error) {
    console.error("OpenAI 클라이언트 초기화 실패:", error);
  }
} else {
  console.warn(
    "OpenAI API 키가 설정되지 않았습니다. AI 리포트 기능이 작동하지 않습니다."
  );
}

interface TechnicalResult {
  totalScore: number;
  categoryScores: {
    [category: string]: {
      correct: number;
      total: number;
      percentage: number;
    };
  };
  questionDetails: Array<{
    questionId: string;
    category: string;
    isCorrect: boolean;
    timeSpent: number;
    difficulty?: string;
  }>;
  totalTime: number;
}

interface PersonalityResult {
  scores: {
    cooperate: { score: number; level: string };
    responsibility: { score: number; level: string };
    leadership: { score: number; level: string };
    total: number;
  };
  questionDetails: Array<{
    questionId: string;
    category: string;
    selected_answer: number;
    reverse_scoring: boolean;
    final_score: number;
  }>;
  totalTime: number;
}

interface ApplicantData {
  name: string;
  email: string;
  phone: string;
  technicalTest: TechnicalResult;
  personalityTest: PersonalityResult;
}

// 강력한 JSON 정리 함수 (공통 사용)
const cleanJSON = (jsonStr: string): string => {
  let cleaned = jsonStr
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // 제어 문자 제거
    .replace(/\r\n/g, " ") // 윈도우 줄바꿈 제거
    .replace(/\n/g, " ") // 모든 줄바꿈을 공백으로
    .replace(/\r/g, " ") // 캐리지 리턴 제거
    .replace(/\t/g, " ") // 탭을 공백으로
    .replace(/\s+/g, " ") // 연속 공백을 하나로
    .replace(/,\s*}/g, "}") // 마지막 콤마 제거
    .replace(/,\s*]/g, "]") // 배열 마지막 콤마 제거
    .trim();

  // 끊어진 문자열 감지 및 복구
  let quoteCount = 0;
  let inString = false;
  let result = "";

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    const prevChar = i > 0 ? cleaned[i - 1] : "";

    if (char === '"' && prevChar !== "\\") {
      quoteCount++;
      inString = !inString;
    }

    result += char;

    // 문자열이 끝나지 않고 JSON 구조 문자가 나타나면 문자열 종료
    if (
      inString &&
      (char === "{" ||
        char === "}" ||
        char === "[" ||
        char === "]" ||
        char === ":" ||
        char === ",")
    ) {
      if (prevChar !== "\\") {
        result = result.slice(0, -1) + '"' + char;
        inString = false;
        quoteCount++;
      }
    }
  }

  // 홀수 개의 따옴표가 있으면 마지막에 따옴표 추가
  if (quoteCount % 2 !== 0) {
    result += '"';
  }

  return result;
};

export async function generateAIReport(applicantData: ApplicantData) {
  try {
    // OpenAI 클라이언트가 초기화되지 않은 경우 기본 구조 반환
    if (!openai) {
      console.warn(
        "OpenAI 클라이언트가 초기화되지 않아 기본 리포트를 반환합니다."
      );
      return {
        technicalAnalysis: {
          overallLevel: "중",
          strengths: ["AI 분석 미사용"],
          weaknesses: ["AI 분석 미사용"],
          timeEfficiency: "보통",
        },
        personalityAnalysis: {
          cooperation: "AI 분석 미사용",
          responsibility: "AI 분석 미사용",
          leadership: "AI 분석 미사용",
          organizationFit: "AI 분석 미사용",
          growthPotential: "AI 분석 미사용",
        },
        overallAssessment: {
          recommendation: "medium",
          mainStrengths: ["AI 분석 미사용"],
          improvementAreas: ["AI 분석 미사용"],
        },
        interviewFocus: {
          technicalPoints: ["AI 분석 미사용"],
          personalityPoints: ["AI 분석 미사용"],
        },
      };
    }

    console.log("실제 AI 리포트 생성을 시작합니다...");

    const prompt = `당신은 전문 HR 컨설턴트입니다. 다음 지원자의 평가 결과를 분석하여 JSON 형태로 구조화된 리포트를 작성해주세요.

지원자 정보:
- 이름: ${applicantData.name}
- 이메일: ${applicantData.email}

기술 테스트 결과:
- 총점: ${applicantData.technicalTest.totalScore}점/30점
- 소요시간: ${Math.floor(applicantData.technicalTest.totalTime / 60)}분 ${
      applicantData.technicalTest.totalTime % 60
    }초
- 카테고리별 성과:
${Object.entries(applicantData.technicalTest.categoryScores)
  .map(
    ([category, score]) =>
      `  * ${category}: ${score.correct}/${
        score.total
      } (${score.percentage.toFixed(1)}%)`
  )
  .join("\n")}

인성 테스트 결과:
- 협업: ${applicantData.personalityTest.scores.cooperate.score}점 (${
      applicantData.personalityTest.scores.cooperate.level
    })
- 책임감: ${applicantData.personalityTest.scores.responsibility.score}점 (${
      applicantData.personalityTest.scores.responsibility.level
    })
- 리더십: ${applicantData.personalityTest.scores.leadership.score}점 (${
      applicantData.personalityTest.scores.leadership.level
    })
- 총점: ${applicantData.personalityTest.scores.total}점

다음 JSON 구조로 리포트를 작성해주세요. 반드시 유효한 JSON만 반환하고 백틱이나 다른 텍스트는 포함하지 마세요:

{
  "technicalAnalysis": {
    "overallLevel": "전반적인 기술 수준 평가 (상/중/하)",
    "strengths": ["강점 영역1", "강점 영역2"],
    "weaknesses": ["약점 영역1", "약점 영역2"],
    "timeEfficiency": "소요시간 대비 정답률 분석"
  },
  "personalityAnalysis": {
    "cooperation": "협업 능력 분석",
    "responsibility": "책임감 분석",
    "leadership": "리더십 분석",
    "organizationFit": "조직 적응도 예측",
    "growthPotential": "성장 가능성 평가"
  },
  "overallAssessment": {
    "recommendation": "high|medium|low",
    "mainStrengths": ["주요 강점1", "주요 강점2", "주요 강점3"],
    "improvementAreas": ["개선 영역1", "개선 영역2"]
  },
  "interviewFocus": {
    "technicalPoints": ["기술 면접 확인 포인트1", "기술 면접 확인 포인트2"],
    "personalityPoints": ["인성 면접 확인 포인트1", "인성 면접 확인 포인트2"]
  }
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            '당신은 전문적이고 객관적인 HR 평가 전문가입니다. 반드시 유효한 JSON 형식으로만 응답합니다. 중요한 규칙: 1) 문자열 내부에 따옴표가 있으면 반드시 \\"로 이스케이프 2) 줄바꿈 금지, 모든 텍스트는 한 줄로 3) 백틱이나 마크다운 문법 절대 금지 4) JSON 끝에 쉼표 금지 5) 모든 문자열은 완전히 닫아야 함',
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 2000,
      temperature: 0.3,
    });

    const content = response.choices[0].message.content;
    if (!content) return null;

    console.log("=== AI 면접 질문 응답 원본 ===");
    console.log("응답 길이:", content.length);
    console.log("응답 내용 (처음 500자):", content.substring(0, 500));
    console.log(
      "응답 내용 (마지막 200자):",
      content.substring(content.length - 200)
    );

    // JSON 파싱을 위한 전처리
    let cleanContent = content.trim();

    // 백틱으로 감싸진 경우 제거
    if (cleanContent.startsWith("```json")) {
      cleanContent = cleanContent
        .replace(/^```json\s*/, "")
        .replace(/\s*```$/, "");
    } else if (cleanContent.startsWith("```")) {
      cleanContent = cleanContent.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    try {
      let parsedData;

      // 1차 파싱 시도: 기본 정리
      try {
        let cleanedContent = cleanJSON(cleanContent);
        parsedData = JSON.parse(cleanedContent);
        console.log("AI 리포트 1차 파싱 성공");
      } catch (firstParseError) {
        console.warn(
          "AI 리포트 1차 JSON 파싱 실패, 2차 복구 시도:",
          firstParseError
        );

        // 2차 파싱 시도: 정규식으로 JSON 구조 추출
        try {
          const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            let extractedJSON = cleanJSON(jsonMatch[0]);
            parsedData = JSON.parse(extractedJSON);
            console.log("AI 리포트 2차 파싱 성공 (정규식 추출)");
          } else {
            throw new Error("유효한 JSON 구조를 찾을 수 없습니다");
          }
        } catch (secondParseError) {
          console.error("AI 리포트 2차 JSON 파싱도 실패:", secondParseError);
          throw new Error("모든 JSON 파싱 시도 실패");
        }
      }

      console.log("AI 리포트 파싱 성공:", JSON.stringify(parsedData, null, 2));
      return parsedData;
    } catch (parseError) {
      console.error("AI 리포트 JSON 파싱 완전 실패:", parseError);
      console.error("받은 내용:", cleanContent);

      // 파싱 실패 시 기본 구조 반환
      return {
        technicalAnalysis: {
          overallLevel: "중",
          strengths: ["기본 기술 역량"],
          weaknesses: ["상세 분석 불가"],
          timeEfficiency: "분석 중",
        },
        personalityAnalysis: {
          cooperation: "분석 중",
          responsibility: "분석 중",
          leadership: "분석 중",
          organizationFit: "분석 중",
          growthPotential: "분석 중",
        },
        overallAssessment: {
          recommendation: "medium",
          mainStrengths: ["기본 역량"],
          improvementAreas: ["상세 분석 필요"],
        },
        interviewFocus: {
          technicalPoints: ["기술 역량 확인"],
          personalityPoints: ["인성 확인"],
        },
      };
    }
  } catch (error) {
    console.error("AI 리포트 생성 오류:", error);
    return null;
  }
}

export async function generateInterviewQuestions(applicantData: ApplicantData) {
  try {
    if (!openai) {
      console.warn(
        "OpenAI 클라이언트가 초기화되지 않아 기본 면접 질문을 반환합니다."
      );
      return {
        technical: [
          {
            category: "기술",
            question: "기술 관련 질문을 생성 중입니다.",
            purpose: "기술 역량 확인",
            type: "개념확인",
          },
        ],
        personality: [
          {
            category: "인성",
            question: "인성 관련 질문을 생성 중입니다.",
            purpose: "인성 평가",
            basedOn: "일반적 평가",
          },
        ],
        followUp: [
          {
            type: "추가 확인",
            question: "추가 질문을 생성 중입니다.",
            purpose: "심화 평가",
          },
        ],
      };
    }

    console.log("면접 질문 생성을 시작합니다...");
    console.log("=== 입력된 지원자 데이터 검증 ===");
    console.log("지원자명:", applicantData.name);
    console.log("인성 테스트 결과 존재:", !!applicantData.personalityTest);
    console.log(
      "인성 테스트 문항별 상세 데이터:",
      applicantData.personalityTest?.questionDetails?.length || 0,
      "개"
    );

    // 처음 5개 응답 샘플 출력
    if (applicantData.personalityTest?.questionDetails) {
      const sampleResponses =
        applicantData.personalityTest.questionDetails.slice(0, 5);
      console.log(
        "샘플 응답 데이터:",
        sampleResponses.map((r) => ({
          questionId: r.questionId,
          category: r.category,
          selected_answer: r.selected_answer,
          type: typeof r.selected_answer,
        }))
      );
    }

    // 타입 정의
    type QuestionWithContent = {
      questionId: string;
      category: string;
      content: string;
      selected_answer: number;
      reverse_scoring: boolean;
      final_score: number;
      isRandom?: boolean;
    };

    // 기술 테스트 상세 분석
    const correctQuestions = applicantData.technicalTest.questionDetails.filter(
      (q) => q.isCorrect
    );
    const incorrectQuestions =
      applicantData.technicalTest.questionDetails.filter((q) => !q.isCorrect);
    const slowQuestions = applicantData.technicalTest.questionDetails
      .filter((q) => q.timeSpent > 120) // 2분 이상 걸린 문제
      .sort((a, b) => b.timeSpent - a.timeSpent)
      .slice(0, 3);
    const fastCorrectQuestions = correctQuestions
      .filter((q) => q.timeSpent < 60) // 1분 미만으로 맞힌 문제
      .sort((a, b) => a.timeSpent - b.timeSpent)
      .slice(0, 3);

    console.log("=== 기술 테스트 분석 ===");
    console.log("맞힌 문제:", correctQuestions.length, "개");
    console.log("틀린 문제:", incorrectQuestions.length, "개");
    console.log("빠르게 맞힌 문제:", fastCorrectQuestions.length, "개");
    console.log("오래 걸린 문제:", slowQuestions.length, "개");

    // 틀린 문제들의 실제 내용 조회
    type TechnicalQuestionWithContent = {
      questionId: string;
      category: string;
      isCorrect: boolean;
      timeSpent: number;
      questionContent: string;
      questionType: "multiple-choice" | "short-answer";
      options?: string[];
      correctAnswer: string | string[];
    };

    const incorrectQuestionsWithContent: TechnicalQuestionWithContent[] = [];

    for (const incorrectQ of incorrectQuestions) {
      try {
        // 먼저 객관식 문제에서 찾기
        let question = await MultipleChoiceQuestion.findById(
          incorrectQ.questionId
        );
        let questionContent = "";
        let questionType: "multiple-choice" | "short-answer" =
          "multiple-choice";
        let options: string[] = [];
        let correctAnswer: string | string[] = "";

        if (question) {
          questionContent = question.question;
          questionType = "multiple-choice";
          options = question.options;
          correctAnswer = question.answer;
        } else {
          // 주관식 문제에서 찾기
          const shortAnswerQuestion = await ShortAnswerQuestion.findById(
            incorrectQ.questionId
          );
          if (shortAnswerQuestion) {
            questionContent = shortAnswerQuestion.question;
            questionType = "short-answer";
            correctAnswer = shortAnswerQuestion.answer;
          }
        }

        incorrectQuestionsWithContent.push({
          questionId: incorrectQ.questionId,
          category: incorrectQ.category,
          isCorrect: incorrectQ.isCorrect,
          timeSpent: incorrectQ.timeSpent,
          questionContent: questionContent || "문제 내용을 찾을 수 없습니다.",
          questionType,
          options,
          correctAnswer,
        });

        console.log(
          `틀린 문제 조회 성공: [${
            incorrectQ.category
          }] "${questionContent}" (${Math.floor(incorrectQ.timeSpent / 60)}분 ${
            incorrectQ.timeSpent % 60
          }초 소요)`
        );
      } catch (error) {
        console.error(`틀린 문제 ${incorrectQ.questionId} 조회 오류:`, error);
        incorrectQuestionsWithContent.push({
          questionId: incorrectQ.questionId,
          category: incorrectQ.category,
          isCorrect: incorrectQ.isCorrect,
          timeSpent: incorrectQ.timeSpent,
          questionContent: "문제 내용을 찾을 수 없습니다.",
          questionType: "multiple-choice",
          correctAnswer: "",
        });
      }
    }

    // 극단적 응답 (1점 또는 5점) 분석
    const extremeResponses =
      applicantData.personalityTest.questionDetails.filter(
        (detail) => detail.selected_answer === 1 || detail.selected_answer === 5
      );

    console.log("=== 극단적 응답 분석 ===");
    console.log(
      "전체 인성 테스트 응답 수:",
      applicantData.personalityTest.questionDetails.length
    );
    console.log("극단적 응답 수:", extremeResponses.length);
    console.log(
      "극단적 응답 상세:",
      extremeResponses.map((r) => ({
        questionId: r.questionId,
        category: r.category,
        selected_answer: r.selected_answer,
        reverse_scoring: r.reverse_scoring,
      }))
    );

    // 각 극단적 응답의 카테고리 확인
    if (extremeResponses.length > 0) {
      console.log("=== 극단적 응답 카테고리 상세 분석 ===");
      extremeResponses.forEach((response, idx) => {
        console.log(
          `${idx + 1}. questionId: ${response.questionId}, category: "${
            response.category
          }", selected_answer: ${response.selected_answer}`
        );
      });
    }

    // 실제 문항 내용 조회 (모든 극단적 응답)
    const personalityQuestionsWithContent: QuestionWithContent[] = [];
    for (const response of extremeResponses) {
      // 모든 극단적 응답 조회
      try {
        let question = null;
        let questionContent = "";

        if (response.category === "cooperate") {
          question = await CooperateQuestion.findById(response.questionId);
        } else if (response.category === "responsibility") {
          question = await ResponsibilityQuestion.findById(response.questionId);
        } else if (response.category === "leadership") {
          question = await LeadershipQuestion.findById(response.questionId);
        }

        if (question) {
          questionContent = question.content;
        }

        personalityQuestionsWithContent.push({
          questionId: response.questionId,
          category: response.category,
          selected_answer: response.selected_answer,
          reverse_scoring: response.reverse_scoring,
          final_score: response.final_score,
          content: questionContent || "문항 내용을 찾을 수 없습니다.",
        });

        console.log(
          `문항 조회 성공: ${response.questionId} - "${questionContent}" (${response.selected_answer}점) [카테고리: ${response.category}]`
        );
      } catch (error) {
        console.error(`문항 ${response.questionId} 조회 오류:`, error);
        personalityQuestionsWithContent.push({
          questionId: response.questionId,
          category: response.category,
          selected_answer: response.selected_answer,
          reverse_scoring: response.reverse_scoring,
          final_score: response.final_score,
          content: "문항 내용을 찾을 수 없습니다.",
        });
      }
    }

    // 카테고리별 극단적 응답 개수 확인 후 부족한 카테고리만 랜덤 보충
    const extremeByCategory: {
      cooperate: QuestionWithContent[];
      responsibility: QuestionWithContent[];
      leadership: QuestionWithContent[];
    } = {
      cooperate: personalityQuestionsWithContent.filter(
        (q) => q.category === "cooperate"
      ),
      responsibility: personalityQuestionsWithContent.filter(
        (q) => q.category === "responsibility"
      ),
      leadership: personalityQuestionsWithContent.filter(
        (q) => q.category === "leadership"
      ),
    };

    console.log("=== 카테고리별 극단적 응답 분류 ===");
    console.log("협업 극단적 응답:", extremeByCategory.cooperate.length, "개");
    console.log(
      "책임감 극단적 응답:",
      extremeByCategory.responsibility.length,
      "개"
    );
    console.log(
      "리더십 극단적 응답:",
      extremeByCategory.leadership.length,
      "개"
    );

    console.log("=== 분류된 극단적 응답 상세 ===");
    console.log(
      "personalityQuestionsWithContent 총 개수:",
      personalityQuestionsWithContent.length
    );
    personalityQuestionsWithContent.forEach((q, idx) => {
      console.log(
        `${idx + 1}. [${q.category}] "${q.content}" - ${
          q.selected_answer
        }점 (questionId: ${q.questionId})`
      );
    });

    extremeByCategory.cooperate.forEach((q) =>
      console.log(`협업: "${q.content}" (${q.selected_answer}점)`)
    );
    extremeByCategory.responsibility.forEach((q) =>
      console.log(`책임감: "${q.content}" (${q.selected_answer}점)`)
    );
    extremeByCategory.leadership.forEach((q) =>
      console.log(`리더십: "${q.content}" (${q.selected_answer}점)`)
    );

    const randomQuestionsWithContent: QuestionWithContent[] = [];

    try {
      // 각 카테고리별로 극단적 응답이 부족한 경우에만 랜덤 선택
      const categories = [
        { name: "cooperate", model: CooperateQuestion, korean: "협업" },
        {
          name: "responsibility",
          model: ResponsibilityQuestion,
          korean: "책임감",
        },
        { name: "leadership", model: LeadershipQuestion, korean: "리더십" },
      ];

      for (const category of categories) {
        const extremeCount =
          extremeByCategory[category.name as keyof typeof extremeByCategory]
            .length;

        // 극단적 응답이 0개인 경우에만 랜덤으로 2개 생성
        // 극단적 응답이 1개 이상이면 극단적 응답 개수만큼 질문 생성 (랜덤 추가 안함)
        if (extremeCount === 0) {
          const needCount = 2; // 극단적 응답이 없으면 무조건 2개
          const randomQuestions = await category.model.aggregate([
            { $sample: { size: needCount } },
          ]);

          console.log(
            `${category.korean} 카테고리: 극단적 응답 0개 → 랜덤 ${needCount}개 생성`
          );

          randomQuestions.forEach((question: any) => {
            randomQuestionsWithContent.push({
              questionId: String(question._id),
              category: category.name,
              content: String(question.content || "문항 내용 없음"),
              selected_answer: 3,
              reverse_scoring: Boolean(question.reverse_scoring),
              final_score: 3,
              isRandom: true,
            });
          });
        } else {
          console.log(
            `${category.korean} 카테고리: 극단적 응답 ${extremeCount}개 → 극단적 응답만 사용`
          );
        }
      }
    } catch (error) {
      console.error("랜덤 문항 조회 오류:", error);
    }

    // 카테고리별 응답 분류 (극단적 응답 + 랜덤 응답)
    const allQuestionsForAnalysis = [
      ...personalityQuestionsWithContent,
      ...randomQuestionsWithContent,
    ];

    // extremeByCategory는 원래 극단적 응답만 유지하고, 랜덤 응답은 별도로 추가
    // 각 카테고리에 랜덤 응답 추가 (극단적 응답을 덮어쓰지 않음)
    const randomByCategory = {
      cooperate: randomQuestionsWithContent.filter(
        (q) => q.category === "cooperate"
      ),
      responsibility: randomQuestionsWithContent.filter(
        (q) => q.category === "responsibility"
      ),
      leadership: randomQuestionsWithContent.filter(
        (q) => q.category === "leadership"
      ),
    };

    // 최종 분석용 카테고리별 데이터 (극단적 응답 + 랜덤 응답)
    const finalAnalysisData = {
      cooperate: [
        ...extremeByCategory.cooperate,
        ...randomByCategory.cooperate,
      ],
      responsibility: [
        ...extremeByCategory.responsibility,
        ...randomByCategory.responsibility,
      ],
      leadership: [
        ...extremeByCategory.leadership,
        ...randomByCategory.leadership,
      ],
    };

    // 카테고리별 일반적인 응답 분석 (극단적 응답이 없는 경우를 위해)
    const allPersonalityResponses =
      applicantData.personalityTest.questionDetails;
    const generalResponsesByCategory = {
      cooperate: allPersonalityResponses.filter(
        (q) => q.category === "cooperate"
      ),
      responsibility: allPersonalityResponses.filter(
        (q) => q.category === "responsibility"
      ),
      leadership: allPersonalityResponses.filter(
        (q) => q.category === "leadership"
      ),
    };

    // 5점 척도 라벨 매핑
    const getScaleLabel = (score: number): string => {
      const labels = {
        1: "전혀 그렇지 않다",
        2: "그렇지 않다",
        3: "보통이다",
        4: "그렇다",
        5: "매우 그렇다",
      };
      return labels[score as keyof typeof labels] || `${score}점`;
    };

    console.log("=== AI 프롬프트 생성 직전 데이터 확인 ===");
    console.log("최종 분석 대상 질문 수:", allQuestionsForAnalysis.length);
    console.log(
      "협업 질문:",
      finalAnalysisData.cooperate.length,
      "개 (극단적:",
      extremeByCategory.cooperate.length,
      "개, 랜덤:",
      randomByCategory.cooperate.length,
      "개)"
    );
    console.log(
      "책임감 질문:",
      finalAnalysisData.responsibility.length,
      "개 (극단적:",
      extremeByCategory.responsibility.length,
      "개, 랜덤:",
      randomByCategory.responsibility.length,
      "개)"
    );
    console.log(
      "리더십 질문:",
      finalAnalysisData.leadership.length,
      "개 (극단적:",
      extremeByCategory.leadership.length,
      "개, 랜덤:",
      randomByCategory.leadership.length,
      "개)"
    );

    console.log("협업 질문 상세:");
    finalAnalysisData.cooperate.forEach((q, idx) =>
      console.log(
        `  ${idx + 1}. "${q.content}" - ${q.selected_answer}점 (랜덤: ${
          q.isRandom || false
        })`
      )
    );
    console.log("책임감 질문 상세:");
    finalAnalysisData.responsibility.forEach((q, idx) =>
      console.log(
        `  ${idx + 1}. "${q.content}" - ${q.selected_answer}점 (랜덤: ${
          q.isRandom || false
        })`
      )
    );
    console.log("리더십 질문 상세:");
    finalAnalysisData.leadership.forEach((q, idx) =>
      console.log(
        `  ${idx + 1}. "${q.content}" - ${q.selected_answer}점 (랜덤: ${
          q.isRandom || false
        })`
      )
    );

    const prompt = `당신은 면접관을 위한 전문적인 질문 생성 전문가입니다. 다음 지원자의 상세한 평가 결과를 바탕으로 맞춤형 면접 질문을 생성해주세요.

=== 기술 테스트 상세 분석 ===

맞힌 문제 (심화 질문 대상):
${
  fastCorrectQuestions.length > 0
    ? fastCorrectQuestions
        .map((q) => `- ${q.category} 영역 (${q.timeSpent}초만에 해결)`)
        .join("\n")
    : "- 빠르게 해결한 문제 없음"
}

틀린 문제 (개념 확인 대상):
${
  incorrectQuestionsWithContent.length > 0
    ? incorrectQuestionsWithContent
        .map(
          (q) =>
            `- [${q.category}] "${q.questionContent}" (${Math.floor(
              q.timeSpent / 60
            )}분 ${q.timeSpent % 60}초 소요, ${
              q.questionType === "multiple-choice" ? "객관식" : "주관식"
            })`
        )
        .join("\n")
    : "- 틀린 문제 없음"
}

오래 걸린 문제:
${
  slowQuestions.length > 0
    ? slowQuestions
        .map(
          (q) =>
            `- ${q.category} 영역 (${Math.floor(q.timeSpent / 60)}분 ${
              q.timeSpent % 60
            }초 소요, ${q.isCorrect ? "정답" : "오답"})`
        )
        .join("\n")
    : "- 오래 걸린 문제 없음"
}

=== 인성 테스트 극단적 응답 상세 분석 ===

협업 관련:
${
  finalAnalysisData.cooperate.length > 0
    ? finalAnalysisData.cooperate
        .map((q) =>
          q.isRandom
            ? `- 랜덤 선택 문항: "${q.content}"\n  (극단적 응답이 없어 랜덤 선택)`
            : `- 극단적 응답 문항: "${
                q.content
              }"\n  선택 답변: "${getScaleLabel(
                q.selected_answer
              )}"\n  채점 방식: ${q.reverse_scoring ? "역채점" : "정채점"} 문항`
        )
        .join("\n\n")
    : `극단적 응답 없음 (총 ${
        generalResponsesByCategory.cooperate.length
      }개 문항 응답)\n평균 응답: ${(
        generalResponsesByCategory.cooperate.reduce(
          (sum, q) => sum + q.selected_answer,
          0
        ) / generalResponsesByCategory.cooperate.length
      ).toFixed(1)}점`
}

책임감 관련:
${
  finalAnalysisData.responsibility.length > 0
    ? finalAnalysisData.responsibility
        .map((q) =>
          q.isRandom
            ? `- 랜덤 선택 문항: "${q.content}"\n  (극단적 응답이 없어 랜덤 선택)`
            : `- 극단적 응답 문항: "${
                q.content
              }"\n  선택 답변: "${getScaleLabel(
                q.selected_answer
              )}"\n  채점 방식: ${q.reverse_scoring ? "역채점" : "정채점"} 문항`
        )
        .join("\n\n")
    : `극단적 응답 없음 (총 ${
        generalResponsesByCategory.responsibility.length
      }개 문항 응답)\n평균 응답: ${(
        generalResponsesByCategory.responsibility.reduce(
          (sum, q) => sum + q.selected_answer,
          0
        ) / generalResponsesByCategory.responsibility.length
      ).toFixed(1)}점`
}

리더십 관련:
${
  finalAnalysisData.leadership.length > 0
    ? finalAnalysisData.leadership
        .map((q) =>
          q.isRandom
            ? `- 랜덤 선택 문항: "${q.content}"\n  (극단적 응답이 없어 랜덤 선택)`
            : `- 극단적 응답 문항: "${
                q.content
              }"\n  선택 답변: "${getScaleLabel(
                q.selected_answer
              )}"\n  채점 방식: ${q.reverse_scoring ? "역채점" : "정채점"} 문항`
        )
        .join("\n\n")
    : `극단적 응답 없음 (총 ${
        generalResponsesByCategory.leadership.length
      }개 문항 응답)\n평균 응답: ${(
        generalResponsesByCategory.leadership.reduce(
          (sum, q) => sum + q.selected_answer,
          0
        ) / generalResponsesByCategory.leadership.length
      ).toFixed(1)}점`
}

=== 종합 점수 ===
- 기술 점수: ${applicantData.technicalTest.totalScore}/30점
- 인성 점수: ${applicantData.personalityTest.scores.total}점
- 협업: ${applicantData.personalityTest.scores.cooperate.score}점 (${
      applicantData.personalityTest.scores.cooperate.level
    })
- 책임감: ${applicantData.personalityTest.scores.responsibility.score}점 (${
      applicantData.personalityTest.scores.responsibility.level
    })
- 리더십: ${applicantData.personalityTest.scores.leadership.score}점 (${
      applicantData.personalityTest.scores.leadership.level
    })

=== 면접 질문 생성 가이드라인 ===

기술 질문 전략:
1. 맞힌 문제 → 더 깊은 수준의 심화 질문 (예: "Java GC를 맞혔다면 → G1GC와 ZGC의 차이점과 선택 기준")
2. 틀린 문제 → 실제 틀린 문제를 언급하며 기본 개념 확인 질문 생성
   - 반드시 실제 문제 내용을 질문에 포함
   - 질문 형식: "다음 문제를 틀리셨습니다: [실제 문제 내용]. 이 문제와 관련된 개념에 대해 설명해 주세요."
   - 예시: "다음 문제를 틀리셨습니다: 'XSS 공격의 정의는 무엇인가?'. XSS와 CSRF 공격의 차이점과 각각의 방어 방법에 대해 설명해 주세요."
3. 오래 걸린 문제 → 문제 해결 과정과 접근법 질문

**중요**: 모든 틀린 문제에 대해 개별 질문을 생성해야 합니다.

인성 질문 전략 (중요):
1. 극단적 응답이 있는 경우: 실제 문항 내용을 정확히 인용하여 질문 생성
   - 선택한 답변("전혀 그렇지 않다", "매우 그렇다" 등)을 반드시 질문에 포함
   - 질문 형식: "[문항 내용]"에 대해 "[선택 답변]"라고 답변하셨는데, 구체적인 경험이나 사례를 말씀해 주세요.
   - 예시: "'나는 팀 프로젝트에서 책임감을 가지고 리드한다.'에 대해 '매우 그렇다'라고 답변하셨는데, 구체적인 경험이나 사례를 말씀해 주세요."
   - 중요: 지원자가 선택한 답변을 반드시 질문에 명시해야 합니다.

2. 극단적 응답이 없는 경우 (랜덤 선택 문항): 선택된 랜덤 문항을 기반으로 질문 생성
   - 랜덤 선택된 문항 내용을 언급하되, 극단적 응답이 아님을 감안
   - 질문 형식: "[문항 내용]"와 관련해서 본인의 경험이나 사례를 구체적으로 말씀해 주세요.
   - 예시: "'나는 팀원들과의 의사소통에서 갈등을 잘 조율한다.'와 관련해서 본인의 경험이나 사례를 구체적으로 말씀해 주세요."

3. 질문 생성 규칙:
   - 모든 극단적 응답 문항에 대해 개별 질문 생성
   - 극단적 응답이 없는 경우 각 카테고리에서 랜덤 선택된 2개 문항 기반 질문 생성
   - 역채점 문항의 경우 해당 특성을 고려한 질문 생성
   - 모든 질문은 구체적인 경험 사례를 요구하는 형태로 작성
   - "~에 대해 어떻게 생각하시나요?" 같은 추상적 질문 지양

다음 JSON 구조로 면접 질문을 생성해주세요. 

**중요 규칙:**
1. 반드시 유효한 JSON만 반환하고 백틱이나 다른 텍스트는 포함하지 마세요
2. 모든 문자열은 한 줄로 작성하세요 (줄바꿈 금지)
3. 문자열 내부의 따옴표는 반드시 \\"로 이스케이프하세요
4. 한글 조사나 특수 문자 주변에 주의하세요
5. JSON 끝에 쉼표를 넣지 마세요

JSON 구조:

{
  "technical": [
    {
      "category": "카테고리명",
      "question": "구체적이고 맞춤형 기술 질문",
      "purpose": "이 질문의 목적과 평가 포인트",
      "type": "심화 또는 개념확인"
    }
  ],
  "personality": [
    {
      "category": "협업 또는 책임감 또는 리더십",
      "question": "실제 경험을 묻는 인성 질문",
      "purpose": "이 질문의 목적",
      "basedOn": "점수 기반 평가"
    }
  ],
  "followUp": [
    {
      "type": "기술적깊이 또는 학습능력 또는 성장의지",
      "question": "종합적 판단을 위한 꼬리 질문",
      "purpose": "이 질문의 목적"
    }
  ]
}

${(() => {
  // 인성 질문 개수 계산
  const cooperateCount = finalAnalysisData.cooperate.length;
  const responsibilityCount = finalAnalysisData.responsibility.length;
  const leadershipCount = finalAnalysisData.leadership.length;
  const totalPersonalityQuestions =
    cooperateCount + responsibilityCount + leadershipCount;

  // 기술 질문 개수 계산
  const technicalQuestionsCount =
    incorrectQuestionsWithContent.length + fastCorrectQuestions.length;

  return `
기술 질문 생성 요구사항:
- 틀린 문제 기반: ${incorrectQuestionsWithContent.length}개 질문 생성 (각 틀린 문제마다 개별 질문)
- 빠르게 맞힌 문제 기반: ${fastCorrectQuestions.length}개 심화 질문 생성
- 총 기술 질문: ${technicalQuestionsCount}개

인성 질문 생성 요구사항:
- 협업 관련: ${cooperateCount}개 질문 생성
- 책임감 관련: ${responsibilityCount}개 질문 생성  
- 리더십 관련: ${leadershipCount}개 질문 생성
- 총 인성 질문: ${totalPersonalityQuestions}개

꼬리 질문 3-4개를 생성해주세요.`;
})()}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            '당신은 효과적인 면접 질문을 설계하는 HR 전문가입니다. 반드시 유효한 JSON 형식으로만 응답합니다. 중요한 규칙: 1) 문자열 내부에 따옴표가 있으면 반드시 \\"로 이스케이프 2) 줄바꿈 금지, 모든 텍스트는 한 줄로 3) 백틱이나 마크다운 문법 절대 금지 4) JSON 끝에 쉼표 금지 5) 모든 문자열은 완전히 닫아야 함',
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 2000,
      temperature: 0.3,
    });

    const content = response.choices[0].message.content;
    if (!content) return null;

    console.log("=== AI 면접 질문 응답 원본 ===");
    console.log("응답 길이:", content.length);
    console.log("응답 내용 (처음 500자):", content.substring(0, 500));
    console.log(
      "응답 내용 (마지막 200자):",
      content.substring(content.length - 200)
    );

    // JSON 파싱을 위한 전처리
    let cleanContent = content.trim();

    // 백틱으로 감싸진 경우 제거
    if (cleanContent.startsWith("```json")) {
      cleanContent = cleanContent
        .replace(/^```json\s*/, "")
        .replace(/\s*```$/, "");
    } else if (cleanContent.startsWith("```")) {
      cleanContent = cleanContent.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    // 초강력 JSON 복구 함수
    const fixBrokenJSON = (jsonStr: string): string => {
      let fixed = jsonStr;

      // 1. 기본 정리
      fixed = cleanJSON(fixed);

      // 2. 문자열 내부의 따옴표 문제 해결
      fixed = fixed.replace(/([^\\])"([^",:}\]]*?)"([^:])/g, '$1\\"$2\\"$3');

      // 3. 한글 조사 주변 따옴표 문제 해결
      const koreanParticles = [
        "함",
        "위",
        "을",
        "를",
        "에",
        "와",
        "과",
        "의",
        "가",
        "이",
        "은",
        "는",
        "도",
        "만",
        "까지",
        "부터",
        "서",
        "로",
        "으로",
      ];
      koreanParticles.forEach((particle) => {
        fixed = fixed.replace(
          new RegExp(`"\\s*${particle}"`, "g"),
          `${particle}"`
        );
        fixed = fixed.replace(
          new RegExp(`${particle}\\s*"`, "g"),
          `${particle}"`
        );
      });

      // 4. 끊어진 문자열 복구 시도
      fixed = fixed.replace(/"\s*\+\s*"/g, "");
      fixed = fixed.replace(/"\s*,\s*"/g, '", "');

      // 5. JSON 구조 검증 및 복구
      if (!fixed.trim().startsWith("{")) {
        const match = fixed.match(/\{[\s\S]*\}/);
        if (match) fixed = match[0];
      }

      return fixed;
    };

    try {
      let parsedData;

      // 1차 파싱 시도: 기본 정리
      try {
        let cleanedContent = cleanJSON(cleanContent);
        parsedData = JSON.parse(cleanedContent);
        console.log("면접 질문 1차 파싱 성공");
      } catch (firstParseError) {
        console.warn(
          "1차 JSON 파싱 실패, 2차 강력 복구 시도:",
          firstParseError
        );

        // 2차 파싱 시도: 강력한 복구
        try {
          let fixedContent = fixBrokenJSON(cleanContent);
          parsedData = JSON.parse(fixedContent);
          console.log("면접 질문 2차 파싱 성공 (강력 복구)");
        } catch (secondParseError) {
          console.warn(
            "2차 JSON 파싱 실패, 3차 정규식 추출 시도:",
            secondParseError
          );

          // 3차 파싱 시도: 정규식으로 JSON 구조 추출
          try {
            const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              let extractedJSON = fixBrokenJSON(jsonMatch[0]);

              // 추가 복구 시도: 따옴표 밸런싱
              const quoteCount = (extractedJSON.match(/"/g) || []).length;
              if (quoteCount % 2 !== 0) {
                // 홀수 개의 따옴표가 있으면 마지막에 따옴표 추가
                extractedJSON += '"';
              }

              parsedData = JSON.parse(extractedJSON);
              console.log("면접 질문 3차 파싱 성공 (정규식 추출)");
            } else {
              throw new Error("유효한 JSON 구조를 찾을 수 없습니다");
            }
          } catch (thirdParseError) {
            console.warn(
              "3차 JSON 파싱 실패, 4차 수동 복구 시도:",
              thirdParseError
            );

            // 4차 파싱 시도: 수동 JSON 복구
            try {
              let manualFix = cleanContent;

              // 가장 흔한 오류 패턴들 수동 수정
              manualFix = manualFix
                .replace(/\\"/g, '"') // 이중 이스케이프 제거
                .replace(/,(\s*[}\]])/g, "$1") // 마지막 콤마 제거
                .replace(
                  /([{,]\s*)"([^"]*)"(\s*:\s*)"([^"]*)"(.*?)"/g,
                  '$1"$2":$4"$5'
                ) // 키-값 패턴 수정
                .replace(/"\s*:\s*([^",}\]]+?)([,}\]])/g, '": "$1"$2'); // 값 따옴표 추가

              // JSON 구조 재추출
              const finalMatch = manualFix.match(/\{[\s\S]*\}/);
              if (finalMatch) {
                parsedData = JSON.parse(finalMatch[0]);
                console.log("면접 질문 4차 파싱 성공 (수동 복구)");
              } else {
                throw new Error("수동 복구 실패");
              }
            } catch (fourthParseError) {
              console.error(
                "4차 JSON 파싱도 실패, 완전히 실패함:",
                fourthParseError
              );
              throw new Error("모든 JSON 파싱 시도 실패");
            }
          }
        }
      }

      // 데이터 구조 검증 및 기본값 설정
      const result = {
        technical: Array.isArray(parsedData.technical)
          ? parsedData.technical.map((item: any, index: number) => {
              // 틀린 문제 정보 매칭
              const relatedIncorrectQuestion =
                incorrectQuestionsWithContent[index];
              return {
                category: String(item.category || "기술"),
                question: String(item.question || "기술 관련 질문"),
                purpose: String(item.purpose || "기술 역량 확인"),
                type: String(item.type || "개념확인"),
                // 틀린 문제 상세 정보 추가
                incorrectQuestionDetails: relatedIncorrectQuestion
                  ? {
                      questionId: relatedIncorrectQuestion.questionId,
                      originalQuestion:
                        relatedIncorrectQuestion.questionContent,
                      questionType: relatedIncorrectQuestion.questionType,
                      correctAnswer: relatedIncorrectQuestion.correctAnswer,
                      timeSpent: relatedIncorrectQuestion.timeSpent,
                    }
                  : null,
              };
            })
          : [
              {
                category: "기술",
                question: "기술 관련 질문을 생성 중입니다.",
                purpose: "기술 역량 확인",
                type: "개념확인",
                incorrectQuestionDetails: null,
              },
            ],
        personality: Array.isArray(parsedData.personality)
          ? parsedData.personality.map((item: any) => ({
              category: String(item.category || "인성"),
              question: String(item.question || "인성 관련 질문"),
              purpose: String(item.purpose || "인성 평가"),
              basedOn: String(item.basedOn || "일반적 평가"),
            }))
          : [
              {
                category: "인성",
                question: "인성 관련 질문을 생성 중입니다.",
                purpose: "인성 평가",
                basedOn: "일반적 평가",
              },
            ],
        followUp: Array.isArray(parsedData.followUp)
          ? parsedData.followUp.map((item: any) => ({
              type: String(item.type || "추가 확인"),
              question: String(item.question || "추가 질문"),
              purpose: String(item.purpose || "심화 평가"),
            }))
          : [
              {
                type: "추가 확인",
                question: "추가 질문을 생성 중입니다.",
                purpose: "심화 평가",
              },
            ],
      };

      console.log("면접 질문 생성 완료:", JSON.stringify(result, null, 2));
      return result;
    } catch (parseError) {
      console.error("면접 질문 JSON 파싱 완전 실패:", parseError);
      console.error("받은 내용:", cleanContent);

      // 파싱 실패 시 기본 구조 반환
      const fallbackResult = {
        technical: [
          {
            category: "기술",
            question: "기술 관련 질문을 생성 중입니다.",
            purpose: "기술 역량 확인",
            type: "개념확인",
            incorrectQuestionDetails: null,
          },
        ],
        personality: [
          {
            category: "인성",
            question: "인성 관련 질문을 생성 중입니다.",
            purpose: "인성 평가",
            basedOn: "일반적 평가",
          },
        ],
        followUp: [
          {
            type: "추가 확인",
            question: "추가 질문을 생성 중입니다.",
            purpose: "심화 평가",
          },
        ],
      };

      console.log(
        "폴백 면접 질문 데이터 반환:",
        JSON.stringify(fallbackResult, null, 2)
      );
      return fallbackResult;
    }
  } catch (error) {
    console.error("면접 질문 생성 오류:", error);
    return null;
  }
}
