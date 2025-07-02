// 템플릿 기반 질문 생성 시스템 - AI API 파싱 오류 완전 해결
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
  {
    category: "Network",
    questionTemplate:
      "네트워크 문제를 {{time}}초만에 해결하셨습니다. TCP와 UDP의 차이점과 실무 적용 사례를 설명해주세요.",
    purpose: "네트워크 프로토콜 심화 지식 확인",
    type: "심화",
    triggers: {
      condition: (data) =>
        data.technicalTest.questionDetails.some(
          (q) => q.isCorrect && q.timeSpent <= 3 && q.category === "Network"
        ),
      variables: (data) => {
        const fastNetwork = data.technicalTest.questionDetails.find(
          (q) => q.isCorrect && q.timeSpent <= 3 && q.category === "Network"
        );
        return { time: fastNetwork?.timeSpent.toString() || "2" };
      },
    },
  },
];

// 인성 질문 템플릿들
const personalityQuestionTemplates: QuestionTemplate[] = [
  // 협업 관련 - 낮은 점수
  {
    category: "협업",
    questionTemplate:
      "팀 내에서 기술적 논쟁을 이성적으로 해결하는 것에 대해 소극적으로 답변하셨는데, 구체적인 경험을 공유해주세요.",
    purpose: "협업 시 갈등 해결 능력 확인",
    basedOn: "점수 기반 평가",
    triggers: {
      condition: (data) =>
        data.personalityTest.questionDetails.some(
          (q) => q.category === "cooperate" && q.selected_answer === 1
        ),
      variables: () => ({}),
    },
  },
  {
    category: "협업",
    questionTemplate:
      "다양한 의견을 통합하여 최적의 해결책을 찾는 것에 대해 '전혀 그렇지 않다'라고 답변하셨습니다. 실제 프로젝트에서는 어떻게 접근하시나요?",
    purpose: "의견 조율 및 통합 능력 확인",
    basedOn: "점수 기반 평가",
    triggers: {
      condition: (data) =>
        data.personalityTest.questionDetails.some(
          (q) => q.category === "cooperate" && q.selected_answer === 1
        ),
      variables: () => ({}),
    },
  },
  // 협업 관련 - 높은 점수
  {
    category: "협업",
    questionTemplate:
      "팀워크를 매우 중시한다고 답변해주셨습니다. 팀 프로젝트에서 본인의 역할과 기여도를 구체적으로 설명해주세요.",
    purpose: "협업 경험 및 기여도 확인",
    basedOn: "점수 기반 평가",
    triggers: {
      condition: (data) => data.personalityTest.scores.cooperate.score >= 80,
      variables: () => ({}),
    },
  },
  // 책임감 관련 - 낮은 점수
  {
    category: "책임감",
    questionTemplate:
      "코드 테스트를 철저히 수행하는 것에 대해 '전혀 그렇지 않다'라고 답변하셨는데, 실제 개발 과정에서 품질 관리는 어떻게 하시나요?",
    purpose: "코드 품질 관리 방식 확인",
    basedOn: "점수 기반 평가",
    triggers: {
      condition: (data) =>
        data.personalityTest.questionDetails.some(
          (q) => q.category === "responsibility" && q.selected_answer === 1
        ),
      variables: () => ({}),
    },
  },
  // 책임감 관련 - 높은 점수
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
  {
    category: "책임감",
    questionTemplate:
      "팀의 목표를 위해 개인 작업을 조정한다고 하셨는데, 구체적인 사례를 들어 설명해주세요.",
    purpose: "팀 목표 우선순위 및 조율 능력 확인",
    basedOn: "점수 기반 평가",
    triggers: {
      condition: (data) =>
        data.personalityTest.questionDetails.some(
          (q) => q.category === "responsibility" && q.selected_answer === 5
        ),
      variables: () => ({}),
    },
  },
  // 리더십 관련 - 낮은 점수
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
  // 리더십 관련 - 높은 점수
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

// 메인 질문 생성 함수
export async function generateInterviewQuestions(applicantData: ApplicantData) {
  try {
    console.log("템플릿 기반 면접 질문 생성 시작");
    console.log("지원자 데이터:", {
      name: applicantData.name,
      technicalScore: applicantData.technicalTest.totalScore,
      personalityScore: applicantData.personalityTest.scores.total,
    });

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

        console.log(
          `기술 질문 추가: ${template.category} - ${question.substring(
            0,
            50
          )}...`
        );
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

        console.log(
          `인성 질문 추가: ${template.category} - ${question.substring(
            0,
            50
          )}...`
        );
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

        console.log(
          `후속 질문 추가: ${template.type} - ${question.substring(0, 50)}...`
        );
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
      console.log("기본 기술 질문 추가");
    }

    if (result.personality.length === 0) {
      result.personality.push({
        category: "협업",
        question: "팀 프로젝트에서 어려웠던 상황과 해결 방법을 공유해주세요.",
        purpose: "협업 능력 확인",
        basedOn: "일반적 평가",
      });
      console.log("기본 인성 질문 추가");
    }

    if (result.followUp.length === 0) {
      result.followUp.push({
        type: "종합평가",
        question: "마지막으로 본인의 강점과 개발자로서의 목표를 말씀해주세요.",
        purpose: "종합적 역량 확인",
      });
      console.log("기본 후속 질문 추가");
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
