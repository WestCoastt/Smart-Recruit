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
console.log(
  "OpenAI API 키 첫 10자:",
  OPENAI_API_KEY ? OPENAI_API_KEY.substring(0, 10) : "없음"
);

let openai: OpenAI | null = null;

if (OPENAI_API_KEY && OPENAI_API_KEY.length > 5) {
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
  console.warn("현재 OPENAI_API_KEY 값:", OPENAI_API_KEY);
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

// 기존 cleanJSON 함수를 더 안전하게 수정
const cleanJSON = (jsonStr: string): string => {
  // 기본적인 정리만 수행
  let cleaned = jsonStr
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // 제어 문자 제거
    .replace(/\r\n/g, "\n") // 윈도우 줄바꿈 정규화
    .replace(/\r/g, "\n") // 맥 줄바꿈 정규화
    .replace(/,\s*}/g, "}") // 마지막 콤마 제거
    .replace(/,\s*]/g, "]") // 배열 마지막 콤마 제거
    .trim();

  return cleaned;
};

// 더 안전한 JSON 추출 함수 추가
const extractJSON = (text: string): string => {
  // 1. 먼저 ```json 코드 블록에서 추출 시도
  const codeBlockMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }

  // 2. 일반 코드 블록에서 추출 시도
  const generalCodeMatch = text.match(/```\s*([\s\S]*?)\s*```/);
  if (generalCodeMatch) {
    return generalCodeMatch[1].trim();
  }

  // 3. 중괄호로 둘러싸인 JSON 구조 추출
  const braceMatch = text.match(/\{[\s\S]*\}/);
  if (braceMatch) {
    return braceMatch[0];
  }

  // 4. 그대로 반환
  return text;
};

// 수동 파싱 함수 - JSON 파싱 실패 시 텍스트에서 주요 내용 추출
const attemptManualParsing = (text: string): any => {
  try {
    console.log("수동 파싱 시도 시작...");

    // 기본 구조 생성
    const result: any = {
      technicalAnalysis: {
        overallLevel: "중",
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
    };

    // 정규식을 사용해 주요 내용 추출 시도
    const patterns = {
      overallLevel: /"overallLevel":\s*"([^"]+)"/,
      detailedAssessment: /"detailedAssessment":\s*"([^"]+)"/,
      strengths: /"strengths":\s*"([^"]+)"/,
      weaknesses: /"weaknesses":\s*"([^"]+)"/,
      timeEfficiency: /"timeEfficiency":\s*"([^"]+)"/,
      cooperation: /"cooperation":\s*"([^"]+)"/,
      responsibility: /"responsibility":\s*"([^"]+)"/,
      leadership: /"leadership":\s*"([^"]+)"/,
      organizationFit: /"organizationFit":\s*"([^"]+)"/,
      growthPotential: /"growthPotential":\s*"([^"]+)"/,
      recommendation: /"recommendation":\s*"([^"]+)"/,
      comprehensiveEvaluation: /"comprehensiveEvaluation":\s*"([^"]+)"/,
      keyStrengths: /"keyStrengths":\s*"([^"]+)"/,
      developmentAreas: /"developmentAreas":\s*"([^"]+)"/,
      technicalQuestions: /"technicalQuestions":\s*"([^"]+)"/,
      personalityQuestions: /"personalityQuestions":\s*"([^"]+)"/,
    };

    let extractedCount = 0;

    // 각 패턴을 시도하여 내용 추출
    Object.entries(patterns).forEach(([key, pattern]) => {
      const match = text.match(pattern);
      if (match && match[1]) {
        const value = match[1].replace(/\\"/g, '"'); // 이스케이프된 따옴표 복원

        // 적절한 위치에 값 할당
        if (
          key === "overallLevel" ||
          key === "detailedAssessment" ||
          key === "strengths" ||
          key === "weaknesses" ||
          key === "timeEfficiency"
        ) {
          result.technicalAnalysis[key] = value;
        } else if (
          key === "cooperation" ||
          key === "responsibility" ||
          key === "leadership" ||
          key === "organizationFit" ||
          key === "growthPotential"
        ) {
          result.personalityAnalysis[key] = value;
        } else if (
          key === "recommendation" ||
          key === "comprehensiveEvaluation" ||
          key === "keyStrengths" ||
          key === "developmentAreas"
        ) {
          result.overallAssessment[key] = value;
        } else if (
          key === "technicalQuestions" ||
          key === "personalityQuestions"
        ) {
          result.interviewFocus[key] = value;
        }

        extractedCount++;
        console.log(`수동 파싱 성공: ${key} = ${value.substring(0, 50)}...`);
      }
    });

    console.log(`수동 파싱 완료: ${extractedCount}개 필드 추출`);

    // 최소 5개 이상의 필드가 추출되었다면 성공으로 간주
    if (extractedCount >= 5) {
      return result;
    } else {
      console.log("수동 파싱 실패: 추출된 필드가 너무 적음");
      return null;
    }
  } catch (error) {
    console.error("수동 파싱 중 오류:", error);
    return null;
  }
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
          detailedAssessment:
            "AI 분석 서비스가 현재 이용 불가한 상태입니다. 기술 테스트 결과를 바탕으로 수동 검토가 필요합니다.",
          strengths:
            "기본적인 기술 역량을 보유하고 있는 것으로 보이나, 구체적인 강점 분석을 위해서는 AI 서비스 복구 후 재평가가 필요합니다.",
          weaknesses:
            "상세한 약점 분석이 불가능한 상황입니다. 면접을 통한 직접적인 평가가 필요해 보입니다.",
          timeEfficiency:
            "시간 효율성에 대한 분석이 현재 불가능한 상태입니다. AI 서비스 복구 후 재분석을 권장합니다.",
        },
        personalityAnalysis: {
          cooperation:
            "협업 능력에 대한 상세 분석이 현재 불가능합니다. AI 서비스 복구 후 재평가가 필요합니다.",
          responsibility:
            "책임감에 대한 구체적 평가가 필요합니다. 면접 단계에서 직접 확인하는 것을 권장합니다.",
          leadership:
            "리더십 특성에 대한 추가 분석이 요구됩니다. AI 서비스 복구 후 재평가가 필요합니다.",
          organizationFit:
            "조직 적응도 예측을 위해서는 면접 단계에서의 추가 평가가 필요해 보입니다.",
          growthPotential:
            "성장 가능성에 대한 종합적 판단을 위해 AI 서비스 복구 후 재분석이 필요합니다.",
        },
        overallAssessment: {
          recommendation: "medium",
          comprehensiveEvaluation:
            "현재 AI 분석 시스템에 일시적 문제가 발생하여 완전한 종합 평가를 제공할 수 없습니다. 기본 데이터는 확인되었으나, 보다 정확한 평가를 위해서는 면접 단계에서의 직접 평가가 필요해 보입니다.",
          keyStrengths:
            "구체적인 강점 분석을 위해서는 AI 서비스 복구 후 재평가가 필요한 상황입니다.",
          developmentAreas:
            "개발이 필요한 영역에 대한 상세 분석이 현재 불가능하여, 면접을 통한 직접 확인이 필요해 보입니다.",
        },
        interviewFocus: {
          technicalQuestions:
            "기술적 역량을 종합적으로 확인할 수 있는 질문들을 준비하여 면접에서 직접 평가하는 것이 필요해 보입니다.",
          personalityQuestions:
            "인성적 특성과 조직 적합성을 파악할 수 있는 구체적인 질문들을 통해 면접에서 심화 평가가 필요합니다.",
        },
      };
    }

    console.log("실제 AI 리포트 생성을 시작합니다...");
    console.log("전달받은 데이터:", JSON.stringify(applicantData, null, 2));

    // 카테고리별 상세 분석을 위한 데이터 준비
    const categoryAnalysis = Object.entries(
      applicantData.technicalTest.categoryScores
    ).map(([category, score]) => {
      const correctProblems =
        applicantData.technicalTest.questionDetails.filter(
          (q) => q.category === category && q.isCorrect
        ).length;
      const wrongProblems = applicantData.technicalTest.questionDetails.filter(
        (q) => q.category === category && !q.isCorrect
      ).length;
      const avgTime =
        applicantData.technicalTest.questionDetails
          .filter((q) => q.category === category)
          .reduce((sum, q) => sum + q.timeSpent, 0) /
        (correctProblems + wrongProblems || 1);

      return {
        category,
        correct: correctProblems,
        wrong: wrongProblems,
        total: score.total,
        percentage: score.percentage,
        avgTime: Math.round(avgTime),
      };
    });

    const strongCategories = categoryAnalysis.filter((c) => c.percentage >= 70);
    const weakCategories = categoryAnalysis.filter((c) => c.percentage < 50);
    const moderateCategories = categoryAnalysis.filter(
      (c) => c.percentage >= 50 && c.percentage < 70
    );

    const prompt = `당신은 전문 HR 컨설턴트입니다. 다음 지원자의 평가 결과를 구체적인 근거를 바탕으로 분석하여 자연스러운 서술형 보고서를 작성해주세요.

지원자 정보:
- 이름: ${applicantData.name}
- 이메일: ${applicantData.email}

기술 테스트 상세 결과:
- 전체 성과: ${applicantData.technicalTest.totalScore}점/30점 (${(
      (applicantData.technicalTest.totalScore / 30) *
      100
    ).toFixed(1)}%)
- 총 소요시간: ${Math.floor(applicantData.technicalTest.totalTime / 60)}분 ${
      applicantData.technicalTest.totalTime % 60
    }초
- 문제당 평균 시간: ${Math.round(applicantData.technicalTest.totalTime / 30)}초

카테고리별 세부 분석:
${categoryAnalysis
  .map(
    (cat) =>
      `- ${cat.category}: ${cat.correct}개 정답, ${
        cat.wrong
      }개 오답 (정답률 ${cat.percentage.toFixed(1)}%, 평균 ${
        cat.avgTime
      }초 소요)`
  )
  .join("\n")}

강점 영역: ${strongCategories.map((c) => c.category).join(", ") || "없음"}
약점 영역: ${weakCategories.map((c) => c.category).join(", ") || "없음"}
보통 영역: ${moderateCategories.map((c) => c.category).join(", ") || "없음"}

인성 테스트 상세 결과:
- 협업 능력: ${applicantData.personalityTest.scores.cooperate.score}점 (${
      applicantData.personalityTest.scores.cooperate.level
    })
- 책임감: ${applicantData.personalityTest.scores.responsibility.score}점 (${
      applicantData.personalityTest.scores.responsibility.level
    })
- 리더십: ${applicantData.personalityTest.scores.leadership.score}점 (${
      applicantData.personalityTest.scores.leadership.level
    })
- 인성 총점: ${applicantData.personalityTest.scores.total}점

다음 JSON 구조로 구체적이고 자연스러운 서술형 리포트를 작성해주세요. 

**중요: 모든 분석 내용은 반드시 하나의 긴 문자열로 작성해야 합니다. 절대 배열이나 객체로 만들지 마세요.**

각 분석은 위의 구체적인 데이터를 근거로 하여 "~합니다", "~해 보입니다", "~필요해 보입니다" 등의 자연스러운 문체로 2-3문장 이상 길게 서술해주세요:

{
  "technicalAnalysis": {
    "overallLevel": "상|중|하",
    "detailedAssessment": "전반적인 기술 수준에 대한 구체적 근거 기반 서술형 평가를 하나의 긴 문자열로 작성 (정답률, 소요시간, 카테고리별 성과를 구체적으로 언급하며 2-3문장 이상)",
    "strengths": "강점 영역에 대한 구체적 분석을 하나의 긴 문자열로 작성 (어떤 카테고리에서 몇 개 정답을 맞혔는지, 시간 효율성은 어땠는지 등 구체적 근거 포함하여 자연스럽게 서술)",
    "weaknesses": "약점 영역에 대한 구체적 분석을 하나의 긴 문자열로 작성 (어떤 카테고리에서 어려움을 겪었는지, 시간 관리는 어땠는지 등 구체적 근거 포함하여 자연스럽게 서술)",
    "timeEfficiency": "시간 효율성에 대한 구체적 분석을 하나의 긴 문자열로 작성 (총 소요시간, 문제당 평균 시간, 카테고리별 시간 분배 등을 근거로 한 자연스러운 서술)"
  },
  "personalityAnalysis": {
    "cooperation": "협업 능력에 대한 구체적 분석을 하나의 긴 문자열로 작성 (점수와 레벨을 근거로 한 자연스러운 서술형 평가)",
    "responsibility": "책임감에 대한 구체적 분석을 하나의 긴 문자열로 작성 (점수와 레벨을 근거로 한 자연스러운 서술형 평가)",
    "leadership": "리더십에 대한 구체적 분석을 하나의 긴 문자열로 작성 (점수와 레벨을 근거로 한 자연스러운 서술형 평가)",
    "organizationFit": "조직 적응도에 대한 종합적 예측을 하나의 긴 문자열로 작성 (인성 테스트 결과를 종합하여 조직 내에서의 적응 가능성을 자연스럽게 서술)",
    "growthPotential": "성장 가능성에 대한 평가를 하나의 긴 문자열로 작성 (기술적 역량과 인성적 특성을 종합하여 향후 발전 가능성을 자연스럽게 서술)"
  },
  "overallAssessment": {
    "recommendation": "high|medium|low",
    "comprehensiveEvaluation": "종합 평가를 하나의 긴 문자열로 작성 (기술 테스트와 인성 테스트 결과를 모두 고려한 전체적인 평가를 구체적 근거와 함께 자연스럽게 길게 서술)",
    "keyStrengths": "핵심 강점을 하나의 긴 문자열로 작성 (가장 두드러진 강점들을 구체적 근거와 함께 자연스럽게 서술)",
    "developmentAreas": "개발 필요 영역을 하나의 긴 문자열로 작성 (개선이 필요한 부분들을 구체적 근거와 함께 자연스럽게 서술)"
  },
  "interviewFocus": {
    "technicalQuestions": "기술 면접에서 확인해야 할 포인트들을 하나의 긴 문자열로 작성 (약점 영역이나 애매한 부분에 대해 구체적으로 질문할 내용을 자연스럽게 서술)",
    "personalityQuestions": "인성 면접에서 확인해야 할 포인트들을 하나의 긴 문자열로 작성 (인성 테스트 결과를 바탕으로 더 깊이 확인할 내용을 자연스럽게 서술)"
  }
}`;

    console.log("=== OpenAI API 호출 시작 ===");
    console.log("프롬프트 길이:", prompt.length);
    console.log("카테고리 분석 결과:", categoryAnalysis);

    try {
      console.log("OpenAI 클라이언트 상태 확인:", !!openai);
      console.log("API 요청 전 상태 확인 완료");

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              '당신은 전문적이고 객관적인 HR 평가 전문가입니다. 반드시 유효한 JSON 형식으로만 응답합니다. 중요한 규칙: 1) 모든 분석 내용은 반드시 하나의 긴 문자열로 작성 (배열이나 객체 절대 금지) 2) 문자열 내부에 따옴표가 있으면 반드시 \\"로 이스케이프 3) 줄바꿈 금지, 모든 텍스트는 한 줄로 4) 백틱이나 마크다운 문법 절대 금지 5) JSON 끝에 쉼표 금지 6) 모든 문자열은 완전히 닫아야 함',
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 2000,
        temperature: 0.3,
      });

      console.log("=== OpenAI API 호출 완료 ===");
      console.log("응답 상태:", response.choices[0].finish_reason);

      const content = response.choices[0].message.content;
      if (!content) {
        console.error("OpenAI 응답 내용이 비어있습니다.");
        throw new Error("OpenAI 응답이 비어있음");
      }

      console.log("=== AI 리포트 응답 원본 ===");
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
        cleanContent = cleanContent
          .replace(/^```\s*/, "")
          .replace(/\s*```$/, "");
      }

      try {
        let parsedData;

        // 1차 파싱 시도: 응답에서 JSON 추출
        try {
          const extractedJSON = extractJSON(cleanContent);
          const cleanedJSON = cleanJSON(extractedJSON);
          parsedData = JSON.parse(cleanedJSON);
          console.log("AI 리포트 1차 파싱 성공");
        } catch (firstParseError) {
          console.warn(
            "AI 리포트 1차 JSON 파싱 실패, 2차 복구 시도:",
            firstParseError
          );

          // 2차 파싱 시도: 더 관대한 JSON 파싱
          try {
            // 응답에서 JSON 부분만 추출
            const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              // 기본적인 정리만 수행
              let simpleClean = jsonMatch[0]
                .replace(/,\s*}/g, "}") // 마지막 콤마 제거
                .replace(/,\s*]/g, "]") // 배열 마지막 콤마 제거
                .trim();

              parsedData = JSON.parse(simpleClean);
              console.log("AI 리포트 2차 파싱 성공 (간단한 정리)");
            } else {
              throw new Error("유효한 JSON 구조를 찾을 수 없습니다");
            }
          } catch (secondParseError) {
            console.error("AI 리포트 2차 JSON 파싱도 실패:", secondParseError);

            // 3차 시도: 매우 관대한 파싱 (JSON5 스타일)
            try {
              // 응답 내용을 그대로 로그로 출력
              console.log("=== 파싱 실패한 원본 응답 ===");
              console.log("응답 길이:", cleanContent.length);
              console.log("응답 내용:", cleanContent);
              console.log("=== 원본 응답 끝 ===");

              // 4차 시도: 수동 텍스트 파싱으로 주요 내용 추출
              const manualParsedData = attemptManualParsing(cleanContent);
              if (manualParsedData) {
                console.log("AI 리포트 4차 파싱 성공 (수동 파싱)");
                parsedData = manualParsedData;
              } else {
                throw new Error("JSON 파싱 완전 실패 - 수동 분석 필요");
              }
            } catch (thirdParseError) {
              console.error("AI 리포트 3차 JSON 파싱도 실패:", thirdParseError);
              throw new Error("모든 JSON 파싱 시도 실패");
            }
          }
        }

        console.log(
          "AI 리포트 파싱 성공:",
          JSON.stringify(parsedData, null, 2)
        );

        // 데이터 구조 정규화: 배열을 문자열로 변환
        if (parsedData.technicalAnalysis) {
          if (Array.isArray(parsedData.technicalAnalysis.strengths)) {
            parsedData.technicalAnalysis.strengths =
              parsedData.technicalAnalysis.strengths.join(" ");
            console.log("technicalAnalysis.strengths 배열을 문자열로 변환");
          }
          if (Array.isArray(parsedData.technicalAnalysis.weaknesses)) {
            parsedData.technicalAnalysis.weaknesses =
              parsedData.technicalAnalysis.weaknesses.join(" ");
            console.log("technicalAnalysis.weaknesses 배열을 문자열로 변환");
          }
        }

        if (parsedData.overallAssessment) {
          if (Array.isArray(parsedData.overallAssessment.keyStrengths)) {
            parsedData.overallAssessment.keyStrengths =
              parsedData.overallAssessment.keyStrengths.join(" ");
            console.log("overallAssessment.keyStrengths 배열을 문자열로 변환");
          }
          if (Array.isArray(parsedData.overallAssessment.developmentAreas)) {
            parsedData.overallAssessment.developmentAreas =
              parsedData.overallAssessment.developmentAreas.join(" ");
            console.log(
              "overallAssessment.developmentAreas 배열을 문자열로 변환"
            );
          }
        }

        if (parsedData.interviewFocus) {
          if (Array.isArray(parsedData.interviewFocus.technicalQuestions)) {
            parsedData.interviewFocus.technicalQuestions =
              parsedData.interviewFocus.technicalQuestions.join(" ");
            console.log(
              "interviewFocus.technicalQuestions 배열을 문자열로 변환"
            );
          }
          if (Array.isArray(parsedData.interviewFocus.personalityQuestions)) {
            parsedData.interviewFocus.personalityQuestions =
              parsedData.interviewFocus.personalityQuestions.join(" ");
            console.log(
              "interviewFocus.personalityQuestions 배열을 문자열로 변환"
            );
          }
        }

        // 최종 데이터 타입 확인
        console.log("=== 최종 데이터 타입 확인 ===");
        if (parsedData.technicalAnalysis) {
          console.log(
            "technicalAnalysis.strengths 타입:",
            typeof parsedData.technicalAnalysis.strengths
          );
          console.log(
            "technicalAnalysis.weaknesses 타입:",
            typeof parsedData.technicalAnalysis.weaknesses
          );
        }
        if (parsedData.overallAssessment) {
          console.log(
            "overallAssessment.keyStrengths 타입:",
            typeof parsedData.overallAssessment.keyStrengths
          );
          console.log(
            "overallAssessment.developmentAreas 타입:",
            typeof parsedData.overallAssessment.developmentAreas
          );
        }
        if (parsedData.interviewFocus) {
          console.log(
            "interviewFocus.technicalQuestions 타입:",
            typeof parsedData.interviewFocus.technicalQuestions
          );
          console.log(
            "interviewFocus.personalityQuestions 타입:",
            typeof parsedData.interviewFocus.personalityQuestions
          );
        }

        return parsedData;
      } catch (parseError) {
        console.error("AI 리포트 JSON 파싱 완전 실패:", parseError);
        console.error("받은 내용:", cleanContent);
        throw parseError;
      }
    } catch (apiError) {
      console.error("=== OpenAI API 호출 실패 ===");
      console.error("오류 타입:", typeof apiError);
      console.error("오류 메시지:", (apiError as any).message);
      console.error("오류 스택:", (apiError as any).stack);
      if ((apiError as any).response) {
        console.error("API 응답 상태:", (apiError as any).response.status);
        console.error("API 응답 데이터:", (apiError as any).response.data);
      }
      throw apiError;
    }
  } catch (error) {
    console.error("AI 리포트 생성 중 전체 오류:", error);

    // 파싱 실패 시 기본 구조 반환
    return {
      technicalAnalysis: {
        overallLevel: "중",
        detailedAssessment:
          "AI 분석 중 오류가 발생하여 상세한 기술 역량 평가를 제공할 수 없습니다. 수동 검토가 필요해 보입니다.",
        strengths:
          "기본적인 기술 역량을 보유하고 있는 것으로 보이나, 구체적인 강점 분석을 위해서는 추가 검토가 필요합니다.",
        weaknesses:
          "상세한 약점 분석이 불가능한 상황입니다. 면접을 통한 직접적인 평가가 필요해 보입니다.",
        timeEfficiency: "시간 효율성에 대한 분석이 현재 불가능한 상태입니다.",
      },
      personalityAnalysis: {
        cooperation: "협업 능력에 대한 상세 분석이 현재 불가능합니다.",
        responsibility: "책임감에 대한 구체적 평가가 필요합니다.",
        leadership: "리더십 특성에 대한 추가 분석이 요구됩니다.",
        organizationFit:
          "조직 적응도 예측을 위해서는 면접 단계에서의 추가 평가가 필요해 보입니다.",
        growthPotential:
          "성장 가능성에 대한 종합적 판단을 위해 추가 정보가 필요합니다.",
      },
      overallAssessment: {
        recommendation: "medium",
        comprehensiveEvaluation:
          "현재 AI 분석 시스템에 일시적 오류가 발생하여 완전한 종합 평가를 제공할 수 없습니다. 기본 데이터는 확인되었으나, 보다 정확한 평가를 위해서는 면접 단계에서의 직접 평가가 필요해 보입니다.",
        keyStrengths:
          "구체적인 강점 분석을 위해서는 시스템 복구 후 재평가가 필요한 상황입니다.",
        developmentAreas:
          "개발이 필요한 영역에 대한 상세 분석이 현재 불가능하여, 면접을 통한 직접 확인이 필요해 보입니다.",
      },
      interviewFocus: {
        technicalQuestions:
          "기술적 역량을 종합적으로 확인할 수 있는 질문들을 준비하여 면접에서 직접 평가하는 것이 필요해 보입니다.",
        personalityQuestions:
          "인성적 특성과 조직 적합성을 파악할 수 있는 구체적인 질문들을 통해 면접에서 심화 평가가 필요합니다.",
      },
    };
  }
}

// 템플릿 기반 질문 생성 시스템
interface QuestionTemplate {
  category: string;
  questionTemplate: string;
  purpose: string;
  type?: string;
  basedOn?: string;
  triggers: {
    condition: (data: ApplicantData) => boolean;
    variables: (data: ApplicantData) => { [key: string]: string };
  };
}

// 기술 질문 템플릿들
const technicalQuestionTemplates: QuestionTemplate[] = [
  // 틀린 문제 관련
  {
    category: "Database",
    questionTemplate:
      "데이터베이스 관련 문제에서 어려움을 겪으신 것 같습니다. {{concept}}에 대해 실무에서 어떻게 활용해보셨나요?",
    purpose: "데이터베이스 실무 경험 확인",
    type: "개념확인",
    triggers: {
      condition: (data) =>
        data.technicalTest.questionDetails.some(
          (q) => !q.isCorrect && q.category === "Database"
        ),
      variables: (data) => ({
        concept: "인덱스 최적화와 쿼리 성능",
      }),
    },
  },
  {
    category: "Java",
    questionTemplate:
      "Java 문제에서 실수가 있었습니다. {{javaFeature}}를 사용할 때 주의해야 할 점은 무엇인가요?",
    purpose: "Java 심화 개념 이해도 확인",
    type: "개념확인",
    triggers: {
      condition: (data) =>
        data.technicalTest.questionDetails.some(
          (q) => !q.isCorrect && q.category === "Java"
        ),
      variables: (data) => ({
        javaFeature: "final 키워드와 불변성",
      }),
    },
  },
  {
    category: "Network",
    questionTemplate:
      "네트워크 관련 문제를 틀리셨네요. {{networkTopic}}에 대한 실무 경험이나 학습 경험을 공유해주세요.",
    purpose: "네트워크 기초 지식 확인",
    type: "개념확인",
    triggers: {
      condition: (data) =>
        data.technicalTest.questionDetails.some(
          (q) => !q.isCorrect && q.category === "Network"
        ),
      variables: (data) => ({
        networkTopic: "HTTPS와 보안 프로토콜",
      }),
    },
  },
  {
    category: "OS",
    questionTemplate:
      "운영체제 문제에서 어려움이 있었습니다. {{osFeature}}에 대해 설명해주세요.",
    purpose: "운영체제 개념 이해도 확인",
    type: "개념확인",
    triggers: {
      condition: (data) =>
        data.technicalTest.questionDetails.some(
          (q) => !q.isCorrect && q.category === "OS"
        ),
      variables: (data) => ({
        osFeature: "CPU 스케줄링 알고리즘",
      }),
    },
  },
  {
    category: "Cloud",
    questionTemplate:
      "클라우드 관련 문제를 틀리셨습니다. {{cloudConcept}}를 실제 프로젝트에서 어떻게 적용하셨나요?",
    purpose: "클라우드 실무 경험 확인",
    type: "개념확인",
    triggers: {
      condition: (data) =>
        data.technicalTest.questionDetails.some(
          (q) => !q.isCorrect && q.category === "Cloud"
        ),
      variables: (data) => ({
        cloudConcept: "Auto Scaling과 Load Balancing",
      }),
    },
  },
  // 빠르게 푼 문제 관련 (심화 질문)
  {
    category: "Java",
    questionTemplate:
      "Java 문제를 {{time}}초만에 해결하셨네요. G1GC와 ZGC의 차이점과 실무에서의 선택 기준을 설명해주세요.",
    purpose: "Java 메모리 관리 심화 지식 확인",
    type: "심화",
    triggers: {
      condition: (data) =>
        data.technicalTest.questionDetails.some(
          (q) => q.isCorrect && q.timeSpent <= 3 && q.category === "Java"
        ),
      variables: (data) => {
        const fastJava = data.technicalTest.questionDetails.find(
          (q) => q.isCorrect && q.timeSpent <= 3 && q.category === "Java"
        );
        return { time: fastJava?.timeSpent.toString() || "2" };
      },
    },
  },
  {
    category: "Database",
    questionTemplate:
      "데이터베이스 문제를 {{time}}초만에 풀었습니다. 대용량 데이터 처리 시 정규화와 비정규화의 선택 기준을 설명해주세요.",
    purpose: "데이터베이스 설계 심화 지식 확인",
    type: "심화",
    triggers: {
      condition: (data) =>
        data.technicalTest.questionDetails.some(
          (q) => q.isCorrect && q.timeSpent <= 3 && q.category === "Database"
        ),
      variables: (data) => {
        const fastDB = data.technicalTest.questionDetails.find(
          (q) => q.isCorrect && q.timeSpent <= 3 && q.category === "Database"
        );
        return { time: fastDB?.timeSpent.toString() || "2" };
      },
    },
  },
];

// 인성 질문 템플릿들
const personalityQuestionTemplates: QuestionTemplate[] = [
  // 협업 관련
  {
    category: "협업",
    questionTemplate:
      "팀 내에서 기술적 논쟁을 이성적으로 해결하는 것에 대해 '{{answer}}'라고 답변하셨는데, 구체적인 경험을 공유해주세요.",
    purpose: "협업 시 갈등 해결 능력 확인",
    basedOn: "점수 기반 평가",
    triggers: {
      condition: (data) =>
        data.personalityTest.questionDetails.some(
          (q) =>
            q.category === "cooperate" &&
            (q.selected_answer === 1 || q.selected_answer === 5)
        ),
      variables: (data) => {
        const extreme = data.personalityTest.questionDetails.find(
          (q) =>
            q.category === "cooperate" &&
            (q.selected_answer === 1 || q.selected_answer === 5)
        );
        return {
          answer:
            extreme?.selected_answer === 1 ? "전혀 그렇지 않다" : "매우 그렇다",
        };
      },
    },
  },
  {
    category: "협업",
    questionTemplate:
      "다양한 의견을 통합하여 최적의 해결책을 찾는 것에 대해 소극적으로 답변하셨습니다. 실제 프로젝트에서는 어떻게 접근하시나요?",
    purpose: "의견 조율 및 리더십 확인",
    basedOn: "점수 기반 평가",
    triggers: {
      condition: (data) => data.personalityTest.scores.cooperate.score < 60,
      variables: () => ({}),
    },
  },
  // 책임감 관련
  {
    category: "책임감",
    questionTemplate:
      "코드 테스트를 철저히 수행하는 것에 대해 '{{answer}}'라고 답변하셨는데, 실제 개발 과정에서 테스트는 어떻게 진행하시나요?",
    purpose: "테스트 중요성 인식 및 실무 경험 확인",
    basedOn: "점수 기반 평가",
    triggers: {
      condition: (data) =>
        data.personalityTest.questionDetails.some(
          (q) => q.category === "responsibility" && q.selected_answer === 1
        ),
      variables: (data) => ({ answer: "전혀 그렇지 않다" }),
    },
  },
  {
    category: "책임감",
    questionTemplate:
      "성능 최적화를 위해 추가 노력을 기울인다고 답변하셨습니다. 최근 성능 개선 경험이 있다면 구체적으로 설명해주세요.",
    purpose: "성능 최적화 실무 경험 확인",
    basedOn: "점수 기반 평가",
    triggers: {
      condition: (data) =>
        data.personalityTest.questionDetails.some(
          (q) => q.category === "responsibility" && q.selected_answer === 5
        ),
      variables: () => ({}),
    },
  },
  // 리더십 관련
  {
    category: "리더십",
    questionTemplate:
      "팀 프로젝트에서 기술적 로드맵 제시에 대해 적극적으로 답변하셨습니다. 실제로 리드했던 프로젝트 경험을 말씀해주세요.",
    purpose: "리더십 경험 및 기술적 비전 확인",
    basedOn: "점수 기반 평가",
    triggers: {
      condition: (data) =>
        data.personalityTest.questionDetails.some(
          (q) => q.category === "leadership" && q.selected_answer === 5
        ),
      variables: () => ({}),
    },
  },
  {
    category: "리더십",
    questionTemplate:
      "기술적 방향 제시보다는 수동적으로 따르는 편이라고 답변하셨는데, 본인만의 기술적 판단 기준이 있다면 무엇인가요?",
    purpose: "기술적 판단력 및 성장 가능성 확인",
    basedOn: "점수 기반 평가",
    triggers: {
      condition: (data) => data.personalityTest.scores.leadership.score < 60,
      variables: () => ({}),
    },
  },
];

// 후속 질문 템플릿들
const followUpQuestionTemplates: QuestionTemplate[] = [
  {
    category: "기술적깊이",
    questionTemplate:
      "기술적 역량이 {{level}} 수준으로 평가되었습니다. 가장 자신 있는 기술 영역에서 깊이 있는 경험을 공유해주세요.",
    purpose: "기술적 깊이 및 전문성 확인",
    type: "기술적깊이",
    triggers: {
      condition: () => true,
      variables: (data) => ({
        level:
          data.technicalTest.totalScore >= 80
            ? "우수한"
            : data.technicalTest.totalScore >= 60
            ? "보통"
            : "개선이 필요한",
      }),
    },
  },
  {
    category: "학습능력",
    questionTemplate:
      "최근 6개월간 새로 학습한 기술이나 개념이 있다면, 학습 동기와 적용 경험을 설명해주세요.",
    purpose: "지속적 학습 의지 및 적용 능력 확인",
    type: "학습능력",
    triggers: {
      condition: () => true,
      variables: () => ({}),
    },
  },
  {
    category: "성장계획",
    questionTemplate:
      "향후 {{period}} 안에 달성하고 싶은 기술적 목표와 구체적인 계획을 말씀해주세요.",
    purpose: "성장 의지 및 목표 설정 능력 확인",
    type: "성장의지",
    triggers: {
      condition: () => true,
      variables: (data) => ({
        period: data.technicalTest.totalScore >= 70 ? "1년" : "2년",
      }),
    },
  },
];

// 템플릿 처리 함수
const processTemplate = (
  template: string,
  variables: { [key: string]: string }
): string => {
  let processed = template;
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
    processed = processed.replace(regex, value);
  });
  return processed;
};

// 새로운 면접 질문 생성 함수
export async function generateInterviewQuestions(applicantData: ApplicantData) {
  try {
    console.log("템플릿 기반 면접 질문 생성 시작");

    const result = {
      technical: [] as any[],
      personality: [] as any[],
      followUp: [] as any[],
    };

    // 기술 질문 생성
    console.log("기술 질문 생성 중...");
    for (const template of technicalQuestionTemplates) {
      if (template.triggers.condition(applicantData)) {
        const variables = template.triggers.variables(applicantData);
        const question = processTemplate(template.questionTemplate, variables);

        result.technical.push({
          category: template.category,
          question: question,
          purpose: template.purpose,
          type: template.type || "개념확인",
        });
      }
    }

    // 인성 질문 생성
    console.log("인성 질문 생성 중...");
    for (const template of personalityQuestionTemplates) {
      if (template.triggers.condition(applicantData)) {
        const variables = template.triggers.variables(applicantData);
        const question = processTemplate(template.questionTemplate, variables);

        result.personality.push({
          category: template.category,
          question: question,
          purpose: template.purpose,
          basedOn: template.basedOn || "일반적 평가",
        });
      }
    }

    // 후속 질문 생성
    console.log("후속 질문 생성 중...");
    for (const template of followUpQuestionTemplates) {
      if (template.triggers.condition(applicantData)) {
        const variables = template.triggers.variables(applicantData);
        const question = processTemplate(template.questionTemplate, variables);

        result.followUp.push({
          type: template.type || "추가확인",
          question: question,
          purpose: template.purpose,
        });
      }
    }

    // 최소 질문 수 보장
    if (result.technical.length === 0) {
      result.technical.push({
        category: "기술",
        question:
          "주요 개발 기술과 프로젝트 경험에 대해 구체적으로 설명해주세요.",
        purpose: "기술 역량 종합 확인",
        type: "개념확인",
      });
    }

    if (result.personality.length === 0) {
      result.personality.push({
        category: "협업",
        question: "팀 프로젝트에서 어려웠던 상황과 해결 방법을 공유해주세요.",
        purpose: "협업 능력 확인",
        basedOn: "일반적 평가",
      });
    }

    if (result.followUp.length === 0) {
      result.followUp.push({
        type: "종합평가",
        question: "마지막으로 본인의 강점과 개발자로서의 목표를 말씀해주세요.",
        purpose: "종합적 역량 확인",
      });
    }

    console.log("템플릿 기반 면접 질문 생성 완료:", {
      technical: result.technical.length,
      personality: result.personality.length,
      followUp: result.followUp.length,
    });

    return result;
  } catch (error) {
    console.error("템플릿 기반 질문 생성 중 오류:", error);

    // 최종 폴백 - 기본 질문들
    return {
      technical: [
        {
          category: "기술",
          question: "가장 자신 있는 프로그래밍 언어와 그 이유를 설명해주세요.",
          purpose: "기술 역량 확인",
          type: "개념확인",
        },
        {
          category: "기술",
          question:
            "최근 진행한 프로젝트에서 기술적으로 도전적이었던 부분을 설명해주세요.",
          purpose: "문제 해결 능력 확인",
          type: "경험확인",
        },
      ],
      personality: [
        {
          category: "협업",
          question: "팀워크가 중요한 상황에서의 경험을 공유해주세요.",
          purpose: "협업 능력 확인",
          basedOn: "일반적 평가",
        },
        {
          category: "책임감",
          question: "업무에 대한 책임감을 보여준 사례를 말씀해주세요.",
          purpose: "책임감 확인",
          basedOn: "일반적 평가",
        },
      ],
      followUp: [
        {
          type: "성장계획",
          question: "개발자로서의 장기적인 목표와 계획을 말씀해주세요.",
          purpose: "성장 가능성 확인",
        },
      ],
    };
  }
}
