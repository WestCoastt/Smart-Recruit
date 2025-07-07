// 템플릿 기반 질문 생성 시스템 - 실제 문제 내용 기반 개선
import {
  MultipleChoiceQuestion,
  ShortAnswerQuestion,
} from "../models/Question";

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

interface WrongQuestionInfo {
  id: string;
  question: string;
  category: string;
  correctAnswer: string | string[];
  explanation?: string;
  type: "multiple-choice" | "short-answer";
}

// 실제 틀린 문제 정보 조회 함수
const getWrongQuestionDetails = async (
  applicantData: ApplicantData
): Promise<WrongQuestionInfo[]> => {
  try {
    const wrongQuestions = applicantData.technicalTest.questionDetails.filter(
      (q) => !q.isCorrect
    );
    const questionIds = wrongQuestions.map((q) => q.questionId);

    if (questionIds.length === 0) return [];

    // 객관식과 주관식 문제 모두 조회
    const [multipleChoiceQuestions, shortAnswerQuestions] = await Promise.all([
      MultipleChoiceQuestion.find({ _id: { $in: questionIds } }),
      ShortAnswerQuestion.find({ _id: { $in: questionIds } }),
    ]);

    const questionInfos: WrongQuestionInfo[] = [];

    // 객관식 문제 정보 추가
    multipleChoiceQuestions.forEach((q) => {
      questionInfos.push({
        id: (q._id as any).toString(),
        question: q.question,
        category: q.category,
        correctAnswer: q.answer,
        explanation: q.explanation,
        type: "multiple-choice",
      });
    });

    // 주관식 문제 정보 추가
    shortAnswerQuestions.forEach((q) => {
      questionInfos.push({
        id: (q._id as any).toString(),
        question: q.question,
        category: q.category,
        correctAnswer: q.answer,
        type: "short-answer",
      });
    });

    console.log(`틀린 문제 정보 조회 완료: ${questionInfos.length}개`);
    return questionInfos;
  } catch (error) {
    console.error("틀린 문제 정보 조회 중 오류:", error);
    return [];
  }
};

// 문제 내용에서 핵심 키워드 추출 함수
const extractKeywords = (
  question: string,
  correctAnswer: string | string[]
): string[] => {
  const keywords: string[] = [];
  const questionLower = question.toLowerCase();
  const answerStr = Array.isArray(correctAnswer)
    ? correctAnswer.join(" ")
    : correctAnswer;
  const answerLower = answerStr.toLowerCase();

  // 데이터베이스 관련 키워드
  if (
    questionLower.includes("트랜잭션") ||
    answerLower.includes("rollback") ||
    answerLower.includes("commit")
  ) {
    keywords.push("트랜잭션 관리");
  }
  if (questionLower.includes("인덱스") || answerLower.includes("index")) {
    keywords.push("인덱스");
  }
  if (questionLower.includes("조인") || answerLower.includes("join")) {
    keywords.push("조인");
  }
  if (
    questionLower.includes("정규화") ||
    answerLower.includes("normalization")
  ) {
    keywords.push("정규화");
  }

  // Java 관련 키워드
  if (
    questionLower.includes("예외") ||
    answerLower.includes("try") ||
    answerLower.includes("catch")
  ) {
    keywords.push("예외 처리");
  }
  if (
    questionLower.includes("synchronized") ||
    answerLower.includes("thread")
  ) {
    keywords.push("스레드 동기화");
  }
  if (questionLower.includes("final") || answerLower.includes("immutable")) {
    keywords.push("불변성");
  }
  if (questionLower.includes("상속") || answerLower.includes("extends")) {
    keywords.push("상속");
  }

  // 네트워크 관련 키워드
  if (answerLower.includes("tcp") || answerLower.includes("udp")) {
    keywords.push("네트워크 프로토콜");
  }
  if (questionLower.includes("http") || answerLower.includes("https")) {
    keywords.push("웹 프로토콜");
  }

  // OS 관련 키워드
  if (questionLower.includes("프로세스") || answerLower.includes("process")) {
    keywords.push("프로세스 관리");
  }
  if (questionLower.includes("메모리") || answerLower.includes("memory")) {
    keywords.push("메모리 관리");
  }

  // Security 관련 키워드
  if (
    questionLower.includes("암호화") ||
    answerLower.includes("encrypt") ||
    answerLower.includes("cipher")
  ) {
    keywords.push("암호화");
  }
  if (
    questionLower.includes("인증") ||
    answerLower.includes("auth") ||
    answerLower.includes("login")
  ) {
    keywords.push("인증");
  }
  if (
    questionLower.includes("해시") ||
    answerLower.includes("hash") ||
    answerLower.includes("digest")
  ) {
    keywords.push("해시");
  }
  if (
    questionLower.includes("보안") ||
    answerLower.includes("security") ||
    answerLower.includes("secure")
  ) {
    keywords.push("보안");
  }

  return keywords;
};

// 정답에서 실제 내용 추출 함수 (보기 알파벳 제거)
const extractActualAnswer = (correctAnswer: string | string[]): string => {
  const answerStr = Array.isArray(correctAnswer)
    ? correctAnswer[0]
    : correctAnswer;

  console.log(`[DEBUG] 원본 정답: "${answerStr}"`);

  // 보기 형태 (A. 내용, B. 내용 등)인 경우 실제 내용만 추출
  if (typeof answerStr === "string") {
    let cleanAnswer = answerStr;

    // 단계별로 정리
    // 1. A., B., C., D. 패턴 제거
    cleanAnswer = cleanAnswer.replace(/^[A-Z][\.\)\:\-]\s*/, "");
    // 2. (A), (B), (C), (D) 패턴 제거
    cleanAnswer = cleanAnswer.replace(/^\([A-Z]\)\s*/, "");
    // 3. A 공백, B 공백 등 패턴 제거
    cleanAnswer = cleanAnswer.replace(/^[A-Z]\s+/, "");
    // 4. 단순히 A, B, C, D만 있는 경우 (길이가 1인 경우)
    if (cleanAnswer.length === 1 && /^[A-Z]$/.test(cleanAnswer)) {
      console.log(
        `[DEBUG] 단순 알파벳 발견: "${cleanAnswer}" - 원본 그대로 사용`
      );
      cleanAnswer = answerStr; // 원본 그대로 사용하여 문제 상황 확인
    }

    cleanAnswer = cleanAnswer.trim();

    // 정리된 답변이 원본과 다르고 의미가 있으면 정리된 버전 반환
    if (cleanAnswer !== answerStr && cleanAnswer.length > 0) {
      console.log(
        `[DEBUG] 보기 알파벳 제거 성공: "${answerStr}" -> "${cleanAnswer}"`
      );
      return cleanAnswer;
    } else {
      console.log(`[DEBUG] 보기 알파벳 제거 불가 또는 불필요: "${answerStr}"`);
    }
  }

  return answerStr;
};

// 질문 템플릿 풀 - 다양한 질문 생성을 위한 템플릿들
const questionTemplates = {
  database: {
    transaction: [
      `데이터베이스 트랜잭션에서 ROLLBACK과 COMMIT의 차이점과 실무에서 언제 각각을 사용하는지 설명해주세요.`,
      `트랜잭션 격리 수준(Isolation Level)과 각 수준에서 발생할 수 있는 문제점들을 설명해주세요.`,
      `데이터베이스 트랜잭션 관리에서 데드락(Deadlock)을 방지하는 방법과 경험을 공유해주세요.`,
    ],
    index: [
      `데이터베이스 인덱스 설계 시 고려해야 할 요소들과 성능에 미치는 영향을 설명해주세요.`,
      `복합 인덱스와 단일 인덱스의 차이점과 각각의 적절한 사용 시나리오를 설명해주세요.`,
      `인덱스가 SELECT 성능은 향상시키지만 INSERT/UPDATE/DELETE 성능에 미치는 영향을 설명해주세요.`,
    ],
    normalization: [
      `데이터베이스 정규화의 단계별 과정과 각 단계의 목적에 대해 설명해주세요.`,
      `정규화와 반정규화의 장단점과 실무에서 반정규화를 선택하는 기준을 설명해주세요.`,
      `제3정규형과 BCNF(Boyce-Codd Normal Form)의 차이점을 설명해주세요.`,
    ],
    join: [
      `SQL JOIN의 종류별 차이점과 각각의 사용 시나리오를 설명해주세요.`,
      `INNER JOIN과 OUTER JOIN의 성능 차이와 최적화 방법을 설명해주세요.`,
      `대용량 테이블 JOIN 시 성능 최적화 경험을 공유해주세요.`,
    ],
    key: [
      `데이터베이스에서 기본키, 외래키, 복합키의 역할과 설계 시 고려사항을 설명해주세요.`,
      `외래키 제약조건이 데이터 무결성에 미치는 영향과 성능 고려사항을 설명해주세요.`,
      `자연키와 대리키의 차이점과 각각의 장단점을 설명해주세요.`,
    ],
  },
  java: {
    exception: [
      `Java에서 예외 처리 전략과 try-catch-finally 블록의 올바른 사용법에 대해 설명해주세요.`,
      `Checked Exception과 Unchecked Exception의 차이점과 각각의 사용 시나리오를 설명해주세요.`,
      `사용자 정의 예외 클래스를 만드는 이유와 설계 원칙을 설명해주세요.`,
    ],
    synchronized: [
      `Java에서 멀티스레드 환경에서의 동기화 방법들과 synchronized 키워드의 사용법을 설명해주세요.`,
      `synchronized 메서드와 synchronized 블록의 차이점과 성능 고려사항을 설명해주세요.`,
      `Java의 Lock 인터페이스와 synchronized의 차이점을 설명해주세요.`,
    ],
    final: [
      `Java에서 final 키워드의 다양한 사용법(클래스, 메서드, 변수)과 각각의 효과에 대해 설명해주세요.`,
      `final 변수와 불변 객체의 차이점과 불변 객체 설계 원칙을 설명해주세요.`,
      `final 클래스의 장단점과 상속 대신 컴포지션을 사용하는 이유를 설명해주세요.`,
    ],
    inheritance: [
      `Java에서 상속과 다형성의 개념과 실무에서의 활용 방법을 설명해주세요.`,
      `상속과 컴포지션의 차이점과 각각의 적절한 사용 시나리오를 설명해주세요.`,
      `메서드 오버라이딩과 오버로딩의 차이점과 주의사항을 설명해주세요.`,
    ],
    interface: [
      `Java에서 인터페이스와 추상클래스의 차이점과 사용 시나리오를 설명해주세요.`,
      `Java 8의 default 메서드와 static 메서드가 인터페이스에 미친 영향을 설명해주세요.`,
      `함수형 인터페이스와 람다 표현식의 관계를 설명해주세요.`,
    ],
    collection: [
      `Java 컬렉션 프레임워크의 주요 클래스들과 각각의 특징을 설명해주세요.`,
      `ArrayList와 LinkedList의 차이점과 각각의 적절한 사용 시나리오를 설명해주세요.`,
      `HashMap의 내부 구조와 해시 충돌 해결 방법을 설명해주세요.`,
    ],
  },
  security: {
    encryption: [
      `웹 애플리케이션에서 데이터 암호화를 어떻게 구현하셨나요? 사용한 암호화 알고리즘과 그 이유를 설명해주세요.`,
      `대칭키 암호화와 비대칭키 암호화의 차이점과 각각의 사용 시나리오를 설명해주세요.`,
      `HTTPS 통신에서 SSL/TLS 핸드셰이크 과정과 보안 요소들을 설명해주세요.`,
    ],
    authentication: [
      `사용자 인증 시스템을 구현할 때 고려해야 할 보안 요소들과 실제 적용 경험을 공유해주세요.`,
      `JWT 토큰 기반 인증과 세션 기반 인증의 차이점과 각각의 장단점을 설명해주세요.`,
      `다중 인증(MFA)의 중요성과 구현 방법을 설명해주세요.`,
    ],
    hash: [
      `패스워드 해싱과 솔트(Salt) 사용의 중요성과 실제 구현 방법을 설명해주세요.`,
      `bcrypt, scrypt, Argon2 등 패스워드 해싱 알고리즘의 차이점을 설명해주세요.`,
      `해시 함수의 특성과 무결성 검증에서의 활용 방법을 설명해주세요.`,
    ],
  },
};

// 랜덤 질문 선택 함수
const getRandomQuestion = (templates: string[]): string => {
  const randomIndex = Math.floor(Math.random() * templates.length);
  return templates[randomIndex];
};

// 실제 틀린 문제 기반 질문 생성 함수
const generateSpecificQuestions = (wrongQuestions: WrongQuestionInfo[]) => {
  const questions: any[] = [];

  wrongQuestions.forEach((wrongQ, index) => {
    if (index >= 3) return; // 최대 3개까지만

    const keywords = extractKeywords(wrongQ.question, wrongQ.correctAnswer);
    const actualAnswer = extractActualAnswer(wrongQ.correctAnswer);

    // 문제 유형에 따른 구체적 질문 생성
    if (wrongQ.category === "Database") {
      let selectedQuestion = "";
      let purpose = "";

      if (
        wrongQ.question.includes("트랜잭션") ||
        actualAnswer.toLowerCase().includes("rollback")
      ) {
        selectedQuestion = getRandomQuestion(
          questionTemplates.database.transaction
        );
        purpose = "트랜잭션 관리 이해도 확인";
      } else if (wrongQ.question.includes("인덱스")) {
        selectedQuestion = getRandomQuestion(questionTemplates.database.index);
        purpose = "인덱스 설계 이해도 확인";
      } else if (
        wrongQ.question.includes("정규화") ||
        wrongQ.question.includes("normalization")
      ) {
        selectedQuestion = getRandomQuestion(
          questionTemplates.database.normalization
        );
        purpose = "데이터베이스 정규화 이해도 확인";
      } else if (
        wrongQ.question.includes("조인") ||
        wrongQ.question.includes("join")
      ) {
        selectedQuestion = getRandomQuestion(questionTemplates.database.join);
        purpose = "SQL JOIN 이해도 확인";
      } else if (
        wrongQ.question.includes("키") ||
        wrongQ.question.includes("key")
      ) {
        selectedQuestion = getRandomQuestion(questionTemplates.database.key);
        purpose = "데이터베이스 키 설계 이해도 확인";
      } else {
        // 단순 알파벳이거나 기타 경우
        if (actualAnswer.length === 1 && /^[A-Z]$/.test(actualAnswer)) {
          console.log(
            `[DEBUG] Database 카테고리에서 단순 알파벳 발견: ${actualAnswer}, 랜덤 질문 선택`
          );
          // 랜덤하게 다양한 데이터베이스 질문 중 선택
          const allDbQuestions = [
            ...questionTemplates.database.transaction,
            ...questionTemplates.database.index,
            ...questionTemplates.database.normalization,
            ...questionTemplates.database.join,
            ...questionTemplates.database.key,
          ];
          selectedQuestion = getRandomQuestion(allDbQuestions);
          purpose = "데이터베이스 종합 이해도 확인";
        } else {
          selectedQuestion = `'${actualAnswer}' 개념에 대해 실무에서 어떻게 활용하고 계신가요? 관련된 경험을 공유해주세요.`;
          purpose = "데이터베이스 실무 경험 확인";
        }
      }

      questions.push({
        category: "Database",
        question: selectedQuestion,
        purpose: purpose,
        type: "개념확인",
        basedOn: `틀린 문제: ${wrongQ.question.substring(0, 50)}...`,
      });
    } else if (wrongQ.category === "Java") {
      let selectedQuestion = "";
      let purpose = "";

      if (
        wrongQ.question.includes("예외") ||
        actualAnswer.toLowerCase().includes("try")
      ) {
        selectedQuestion = getRandomQuestion(questionTemplates.java.exception);
        purpose = "Java 예외 처리 이해도 확인";
      } else if (wrongQ.question.includes("synchronized")) {
        selectedQuestion = getRandomQuestion(
          questionTemplates.java.synchronized
        );
        purpose = "Java 동기화 이해도 확인";
      } else if (wrongQ.question.includes("final")) {
        selectedQuestion = getRandomQuestion(questionTemplates.java.final);
        purpose = "Java final 키워드 이해도 확인";
      } else if (
        wrongQ.question.includes("상속") ||
        wrongQ.question.includes("extends")
      ) {
        selectedQuestion = getRandomQuestion(
          questionTemplates.java.inheritance
        );
        purpose = "Java 상속 개념 이해도 확인";
      } else if (
        wrongQ.question.includes("인터페이스") ||
        wrongQ.question.includes("interface")
      ) {
        selectedQuestion = getRandomQuestion(questionTemplates.java.interface);
        purpose = "Java 인터페이스 이해도 확인";
      } else if (
        wrongQ.question.includes("컬렉션") ||
        wrongQ.question.includes("collection")
      ) {
        selectedQuestion = getRandomQuestion(questionTemplates.java.collection);
        purpose = "Java 컬렉션 이해도 확인";
      } else {
        // 단순 알파벳이거나 기타 경우
        if (actualAnswer.length === 1 && /^[A-Z]$/.test(actualAnswer)) {
          console.log(
            `[DEBUG] Java 카테고리에서 단순 알파벳 발견: ${actualAnswer}, 랜덤 질문 선택`
          );
          // 랜덤하게 다양한 Java 질문 중 선택
          const allJavaQuestions = [
            ...questionTemplates.java.exception,
            ...questionTemplates.java.synchronized,
            ...questionTemplates.java.final,
            ...questionTemplates.java.inheritance,
            ...questionTemplates.java.interface,
            ...questionTemplates.java.collection,
          ];
          selectedQuestion = getRandomQuestion(allJavaQuestions);
          purpose = "Java 종합 이해도 확인";
        } else {
          selectedQuestion = `'${actualAnswer}' 개념을 프로젝트에서 실제로 어떻게 적용해보셨나요?`;
          purpose = "Java 실무 적용 경험 확인";
        }
      }

      questions.push({
        category: "Java",
        question: selectedQuestion,
        purpose: purpose,
        type: "개념확인",
        basedOn: `틀린 문제: ${wrongQ.question.substring(0, 50)}...`,
      });
    } else if (wrongQ.category === "Network") {
      if (
        actualAnswer.toLowerCase().includes("tcp") ||
        actualAnswer.toLowerCase().includes("udp")
      ) {
        questions.push({
          category: "Network",
          question: `TCP와 UDP의 차이점과 각각 어떤 상황에서 사용하는 것이 적합한지 실무 경험을 바탕으로 설명해주세요.`,
          purpose: "네트워크 프로토콜 이해도 확인",
          type: "개념확인",
          basedOn: `틀린 문제: ${wrongQ.question.substring(0, 50)}...`,
        });
      } else {
        // 단순 알파벳인 경우 문제 내용에서 키워드 추출하여 질문 생성
        if (actualAnswer.length === 1 && /^[A-Z]$/.test(actualAnswer)) {
          console.log(
            `[DEBUG] Network 카테고리에서 단순 알파벳 발견: ${actualAnswer}, 문제 내용 분석`
          );

          questions.push({
            category: "Network",
            question: `네트워크 설계나 문제 해결에서 가장 어려웠던 경험과 해결 과정을 공유해주세요.`,
            purpose: "네트워크 문제 해결 경험 확인",
            type: "경험확인",
            basedOn: `틀린 문제: ${wrongQ.question.substring(0, 50)}...`,
          });
        } else {
          questions.push({
            category: "Network",
            question: `'${actualAnswer}' 개념과 관련된 네트워크 이슈를 해결해본 경험이 있나요?`,
            purpose: "네트워크 문제 해결 경험 확인",
            type: "경험확인",
            basedOn: `틀린 문제: ${wrongQ.question.substring(0, 50)}...`,
          });
        }
      }
    } else if (wrongQ.category === "Security") {
      let selectedQuestion = "";
      let purpose = "";

      if (
        wrongQ.question.includes("암호화") ||
        actualAnswer.toLowerCase().includes("encrypt")
      ) {
        selectedQuestion = getRandomQuestion(
          questionTemplates.security.encryption
        );
        purpose = "보안 암호화 구현 경험 확인";
      } else if (
        wrongQ.question.includes("인증") ||
        actualAnswer.toLowerCase().includes("auth")
      ) {
        selectedQuestion = getRandomQuestion(
          questionTemplates.security.authentication
        );
        purpose = "보안 인증 시스템 이해도 확인";
      } else if (
        wrongQ.question.includes("해시") ||
        actualAnswer.toLowerCase().includes("hash")
      ) {
        selectedQuestion = getRandomQuestion(questionTemplates.security.hash);
        purpose = "보안 해싱 이해도 확인";
      } else {
        // 단순 알파벳이거나 기타 경우
        if (actualAnswer.length === 1 && /^[A-Z]$/.test(actualAnswer)) {
          console.log(
            `[DEBUG] Security 카테고리에서 단순 알파벳 발견: ${actualAnswer}, 랜덤 질문 선택`
          );

          // 랜덤하게 다양한 Security 질문 중 선택
          const allSecurityQuestions = [
            ...questionTemplates.security.encryption,
            ...questionTemplates.security.authentication,
            ...questionTemplates.security.hash,
          ];
          selectedQuestion = getRandomQuestion(allSecurityQuestions);
          purpose = "보안 종합 이해도 확인";
        } else {
          selectedQuestion = `보안 분야에서 '${actualAnswer}' 개념이 왜 중요한지 설명하고, 실무에서 이를 적용한 경험을 공유해주세요.`;
          purpose = "보안 개념 이해도 확인";
        }
      }

      questions.push({
        category: "Security",
        question: selectedQuestion,
        purpose: purpose,
        type: "개념확인",
        basedOn: `틀린 문제: ${wrongQ.question.substring(0, 50)}...`,
      });
    } else {
      // 기타 카테고리
      if (actualAnswer.length === 1 && /^[A-Z]$/.test(actualAnswer)) {
        console.log(
          `[DEBUG] ${wrongQ.category} 카테고리에서 단순 알파벳 발견: ${actualAnswer}, 문제 내용 분석`
        );

        questions.push({
          category: wrongQ.category,
          question: `${wrongQ.category} 영역에서 가장 중요하다고 생각하는 개념과 실무 적용 경험을 공유해주세요.`,
          purpose: `${wrongQ.category} 개념 이해도 확인`,
          type: "개념확인",
          basedOn: `틀린 문제: ${wrongQ.question.substring(0, 50)}...`,
        });
      } else {
        questions.push({
          category: wrongQ.category,
          question: `${wrongQ.category} 영역에서 '${actualAnswer}' 개념에 대해 더 자세히 설명해주시고, 실무에서의 활용 경험을 공유해주세요.`,
          purpose: `${wrongQ.category} 개념 이해도 확인`,
          type: "개념확인",
          basedOn: `틀린 문제: ${wrongQ.question.substring(0, 50)}...`,
        });
      }
    }
  });

  return questions;
};

// 인성 질문 템플릿들
const personalityQuestionTemplates = [
  {
    category: "협업",
    questionTemplate:
      "팀 내에서 기술적 논쟁을 이성적으로 해결하는 것에 대해 소극적으로 답변하셨는데, 구체적인 경험을 공유해주세요.",
    purpose: "협업 시 갈등 해결 능력 확인",
    basedOn: "점수 기반 평가",
    triggers: {
      condition: (data: ApplicantData) =>
        data.personalityTest.questionDetails.some(
          (q) => q.category === "cooperate" && q.selected_answer === 1
        ),
      variables: () => ({}),
    },
  },
  {
    category: "협업",
    questionTemplate:
      "팀워크를 매우 중시한다고 답변해주셨습니다. 팀 프로젝트에서 본인의 역할과 기여도를 구체적으로 설명해주세요.",
    purpose: "협업 경험 및 기여도 확인",
    basedOn: "점수 기반 평가",
    triggers: {
      condition: (data: ApplicantData) =>
        data.personalityTest.scores.cooperate.score >= 80,
      variables: () => ({}),
    },
  },
  {
    category: "책임감",
    questionTemplate:
      "코드 테스트를 철저히 수행하는 것에 대해 '전혀 그렇지 않다'라고 답변하셨는데, 실제 개발 과정에서 품질 관리는 어떻게 하시나요?",
    purpose: "코드 품질 관리 방식 확인",
    basedOn: "점수 기반 평가",
    triggers: {
      condition: (data: ApplicantData) =>
        data.personalityTest.questionDetails.some(
          (q) => q.category === "responsibility" && q.selected_answer === 1
        ),
      variables: () => ({}),
    },
  },
  {
    category: "책임감",
    questionTemplate:
      "책임감이 매우 높다고 평가되었습니다. 프로젝트에서 책임감을 발휘한 구체적인 사례를 말씀해주세요.",
    purpose: "책임감 발휘 경험 확인",
    basedOn: "점수 기반 평가",
    triggers: {
      condition: (data: ApplicantData) =>
        data.personalityTest.scores.responsibility.score >= 80,
      variables: () => ({}),
    },
  },
  {
    category: "리더십",
    questionTemplate:
      "리더십 점수가 다소 낮게 나왔습니다. 팀을 이끄는 것에 대한 본인의 생각과 경험을 공유해주세요.",
    purpose: "리더십 역량 및 개선 의지 확인",
    basedOn: "점수 기반 평가",
    triggers: {
      condition: (data: ApplicantData) =>
        data.personalityTest.scores.leadership.score < 60,
      variables: () => ({}),
    },
  },
  {
    category: "리더십",
    questionTemplate:
      "리더십 역량이 뛰어나다고 평가되었습니다. 팀을 이끌어본 경험과 리더십 스타일을 설명해주세요.",
    purpose: "리더십 경험 및 스타일 확인",
    basedOn: "점수 기반 평가",
    triggers: {
      condition: (data: ApplicantData) =>
        data.personalityTest.scores.leadership.score >= 80,
      variables: () => ({}),
    },
  },
];

// 후속 질문 템플릿들
const followUpQuestionTemplates = [
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
      "향후 1-2년 안에 달성하고 싶은 기술적 목표와 구체적인 계획을 말씀해주세요.",
    purpose: "성장 의지 및 목표 설정 능력 확인",
    type: "성장의지",
    triggers: {
      condition: () => true,
      variables: () => ({}),
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
    console.log("실제 틀린 문제 내용 기반 면접 질문 생성 시작");
    console.log("지원자 데이터:", {
      name: applicantData.name,
      technicalScore: applicantData.technicalTest.totalScore,
      personalityScore: applicantData.personalityTest.scores.total,
    });

    // 실제 틀린 문제 정보 조회
    const wrongQuestions = await getWrongQuestionDetails(applicantData);
    console.log(`틀린 문제 ${wrongQuestions.length}개 조회 완료`);

    if (wrongQuestions.length > 0) {
      console.log("틀린 문제 상세 정보:");
      wrongQuestions.forEach((q, index) => {
        console.log(`${index + 1}. [${q.category}] ${q.question}`);
        console.log(`   정답: ${q.correctAnswer}`);
      });
    }

    const result = {
      technical: [] as any[],
      personality: [] as any[],
      followUp: [] as any[],
    };

    // 실제 틀린 문제 기반 기술 질문 생성
    if (wrongQuestions.length > 0) {
      const specificQuestions = generateSpecificQuestions(wrongQuestions);
      result.technical.push(...specificQuestions);

      console.log("실제 틀린 문제 기반 질문 생성 완료:");
      specificQuestions.forEach((q) => {
        console.log(`- ${q.category}: ${q.question.substring(0, 50)}...`);
        console.log(`  (기반: ${q.basedOn})`);
      });
    }

    // 인성 질문 생성
    console.log("인성 질문 생성 중...");
    for (const template of personalityQuestionTemplates) {
      if (template.triggers.condition(applicantData)) {
        const variables = template.triggers.variables();
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
      if (template.triggers.condition()) {
        const variables = template.triggers.variables();
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

    console.log("실제 문제 내용 기반 면접 질문 생성 완료:", {
      technical: result.technical.length,
      personality: result.personality.length,
      followUp: result.followUp.length,
    });

    return result;
  } catch (error) {
    console.error("면접 질문 생성 중 오류:", error);

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
