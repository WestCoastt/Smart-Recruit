import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getTechnicalTestQuestions,
  getStoredApplicantData,
  submitTechnicalTest,
} from "../utils/api";
import type {
  Question,
  TechnicalTestData,
  MultipleChoiceQuestion,
} from "../types";

interface TechnicalTestProps {
  applicantId: string;
}

const TechnicalTest: React.FC<TechnicalTestProps> = ({ applicantId }) => {
  const navigate = useNavigate();

  // 상태 관리
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [questionStartTimes, setQuestionStartTimes] = useState<{
    [key: string]: number;
  }>({});
  const [questionTimes, setQuestionTimes] = useState<{ [key: string]: number }>(
    {}
  );
  const [timeRemaining, setTimeRemaining] = useState(30 * 60); // 30분 (초 단위)
  const [testStartTime] = useState(Date.now());
  const [isLoading, setIsLoading] = useState(true);
  const [isTestEnded, setIsTestEnded] = useState(false);
  const [violationCount, setViolationCount] = useState(0);
  const [isShowingAlert, setIsShowingAlert] = useState(false); // alert/confirm 창 표시 중인지 추적
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 현재 문제
  const currentQuestion = questions[currentQuestionIndex];

  // 테스트 종료 함수
  const endTest = useCallback(
    async (reason: string) => {
      if (isTestEnded) return;

      setIsTestEnded(true);
      setIsShowingAlert(true); // alert 표시 시작

      // 부정행위인 경우 서버에 기록
      if (reason.includes("부정행위")) {
        try {
          await fetch(`/api/applicants/${applicantId}/cheating`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              reason: reason,
              testType: "technical",
            }),
          });
        } catch (error) {
          console.error("부정행위 기록 실패:", error);
        }
      }

      alert(`평가가 종료되었습니다.\n사유: ${reason}`);
      setIsShowingAlert(false); // alert 표시 종료

      // 메인 페이지로 이동
      navigate("/", { replace: true });
    },
    [isTestEnded, navigate, applicantId]
  );

  // 화면 이탈 감지
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !isTestEnded && !isShowingAlert) {
        setViolationCount((prev) => {
          const newCount = prev + 1;
          if (newCount >= 1) {
            endTest("화면 이탈 감지 (부정행위)");
          }
          return newCount;
        });
      }
    };

    const handleBlur = () => {
      // alert/confirm 창이 표시 중이거나 테스트가 종료되었으면 무시
      if (!isTestEnded && !isShowingAlert) {
        setViolationCount((prev) => {
          const newCount = prev + 1;
          if (newCount >= 1) {
            endTest("다른 애플리케이션으로 전환 감지 (부정행위)");
          }
          return newCount;
        });
      }
    };

    // 브라우저 뒤로가기 방지
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isTestEnded) {
        e.preventDefault();
        e.returnValue = "평가가 진행 중입니다. 페이지를 나가시겠습니까?";
        return e.returnValue;
      }
    };

    const handlePopState = () => {
      if (!isTestEnded) {
        setIsShowingAlert(true); // confirm 표시 시작
        const confirmLeave = window.confirm(
          "평가가 종료됩니다. 정말로 페이지를 나가시겠습니까?\n\n페이지 나가기: 확인\n페이지에 계속 있기: 취소"
        );

        // confirm 창이 닫힌 후 약간의 지연을 두어 blur 이벤트 처리
        setTimeout(() => {
          setIsShowingAlert(false); // confirm 표시 종료
        }, 100);

        if (confirmLeave) {
          endTest("사용자가 페이지를 나감");
        } else {
          // 히스토리를 다시 푸시하여 페이지에 머물기
          window.history.pushState(null, "", window.location.href);
        }
      }
    };

    // 이벤트 리스너 등록
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    // 히스토리 스택에 현재 상태 추가 (뒤로가기 방지용)
    window.history.pushState(null, "", window.location.href);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isTestEnded, endTest, isShowingAlert]);

  // 타이머
  useEffect(() => {
    if (isTestEnded) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          endTest("제한 시간 초과");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTestEnded, endTest]);

  // 문제 로드
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const response = await getTechnicalTestQuestions();
        if (response.success && response.data) {
          const testData = response.data as TechnicalTestData;
          setQuestions(testData.questions);
        } else {
          throw new Error("문제를 불러올 수 없습니다.");
        }
      } catch (error) {
        console.error("문제 로드 실패:", error);
        alert("문제를 불러오는 중 오류가 발생했습니다.");
        navigate(`/instructions/${applicantId}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadQuestions();
  }, [applicantId, navigate]);

  // 문제별 소요시간 추적
  useEffect(() => {
    if (currentQuestion && !questionStartTimes[currentQuestion._id]) {
      setQuestionStartTimes((prev) => ({
        ...prev,
        [currentQuestion._id]: Date.now(),
      }));
    }
  }, [currentQuestion, questionStartTimes]);

  // 문제 변경 시 이전 문제의 소요시간 계산
  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex > 0) {
      const prevQuestion = questions[currentQuestionIndex - 1];
      const startTime = questionStartTimes[prevQuestion._id];
      if (startTime && !questionTimes[prevQuestion._id]) {
        const timeSpent = Math.round((Date.now() - startTime) / 1000);
        setQuestionTimes((prev) => ({
          ...prev,
          [prevQuestion._id]: timeSpent,
        }));
      }
    }
  }, [currentQuestionIndex, questions, questionStartTimes, questionTimes]);

  // 시간 포맷팅
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  // 답변 저장
  const handleAnswerChange = (value: string) => {
    if (currentQuestion) {
      setAnswers((prev) => ({
        ...prev,
        [currentQuestion._id]: value,
      }));
    }
  };

  // 다음 문제로 이동
  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  // 이전 문제로 이동
  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  // 특정 문제로 이동
  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  // 테스트 제출
  const submitTest = async () => {
    if (isSubmitting) return;

    setIsShowingAlert(true); // alert/confirm 표시 시작

    const unansweredQuestions = questions
      .filter((q) => !answers[q._id])
      .map((q) => questions.indexOf(q) + 1);

    if (unansweredQuestions.length > 0) {
      const confirmSubmit = window.confirm(
        `다음 문제가 미완료입니다: ${unansweredQuestions.join(
          ", "
        )}번\n\n그래도 제출하시겠습니까?`
      );
      if (!confirmSubmit) {
        // confirm 창이 닫힌 후 약간의 지연을 두어 blur 이벤트 처리
        setTimeout(() => {
          setIsShowingAlert(false); // alert/confirm 표시 종료
        }, 100);
        return;
      }
    }

    const confirmFinalSubmit = window.confirm(
      "정말로 제출하시겠습니까?\n제출 후에는 수정할 수 없습니다."
    );

    if (confirmFinalSubmit) {
      setIsSubmitting(true);

      try {
        // 현재 문제의 소요시간도 계산
        const finalQuestionTimes = { ...questionTimes };
        if (currentQuestion && questionStartTimes[currentQuestion._id]) {
          const currentTimeSpent = Math.round(
            (Date.now() - questionStartTimes[currentQuestion._id]) / 1000
          );
          finalQuestionTimes[currentQuestion._id] = currentTimeSpent;
        }

        // 전체 소요시간 계산 (초 단위)
        const totalTime = Math.round((Date.now() - testStartTime) / 1000);

        // 디버깅을 위한 로그
        console.log("=== 기술 테스트 제출 데이터 ===");
        console.log("applicantId:", applicantId);
        console.log("answers:", answers);
        console.log("finalQuestionTimes:", finalQuestionTimes);
        console.log("totalTime:", totalTime);
        console.log("answers 키 개수:", Object.keys(answers).length);
        console.log(
          "questionTimes 키 개수:",
          Object.keys(finalQuestionTimes).length
        );

        // 서버로 제출
        const response = await submitTechnicalTest(
          applicantId,
          answers,
          finalQuestionTimes,
          totalTime
        );

        if (response.success) {
          // 채점 결과는 표시하지 않고 바로 인성 테스트 안내 페이지로 이동
          navigate(`/personality-instructions/${applicantId}`, {
            replace: true,
          });
        } else {
          throw new Error(response.message || "제출에 실패했습니다.");
        }
      } catch (error) {
        console.error("테스트 제출 오류:", error);
        alert("테스트 제출 중 오류가 발생했습니다. 다시 시도해주세요.");
      } finally {
        setIsSubmitting(false);
        setTimeout(() => {
          setIsShowingAlert(false);
        }, 100);
      }
    } else {
      // confirm 창이 닫힌 후 약간의 지연을 두어 blur 이벤트 처리
      setTimeout(() => {
        setIsShowingAlert(false); // alert/confirm 표시 종료
      }, 100);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">문제를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-600">문제를 불러올 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900">
              기술 역량 테스트
            </h1>
            <div className="flex items-center space-x-6">
              <div className="text-sm text-gray-600">
                문제 {currentQuestionIndex + 1} / {questions.length}
              </div>
              <div
                className={`text-lg font-mono ${
                  timeRemaining < 300 ? "text-red-600" : "text-blue-600"
                }`}
              >
                ⏰ {formatTime(timeRemaining)}
              </div>
              {/* 헤더 제출 버튼 */}
              <button
                onClick={submitTest}
                disabled={isSubmitting}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
              >
                {isSubmitting ? "제출 중..." : "제출"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 진행률 바 */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${
                  ((currentQuestionIndex + 1) / questions.length) * 100
                }%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 문제 네비게이션 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4 sticky top-4">
              <h3 className="font-semibold text-gray-900 mb-4">문제 목록</h3>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((question, index) => (
                  <button
                    key={question._id}
                    onClick={() => goToQuestion(index)}
                    className={`w-10 h-10 rounded text-sm font-medium transition-colors ${
                      index === currentQuestionIndex
                        ? "bg-blue-600 text-white"
                        : answers[question._id]
                        ? "bg-green-100 text-green-800 border border-green-300"
                        : "bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              <div className="mt-4 text-xs text-gray-500">
                <div className="flex items-center mb-1">
                  <div className="w-3 h-3 bg-green-100 border border-green-300 rounded mr-2"></div>
                  완료
                </div>
                <div className="flex items-center mb-1">
                  <div className="w-3 h-3 bg-blue-600 rounded mr-2"></div>
                  현재 문제
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded mr-2"></div>
                  미완료
                </div>
              </div>

              {/* 사이드바 제출 버튼 */}
              <div className="mt-6">
                <div className="mt-2 text-xs text-gray-500 text-center">
                  완료: {Object.keys(answers).length}/{questions.length}
                </div>
              </div>
            </div>
          </div>

          {/* 문제 영역 */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow p-6">
              {/* 문제 정보 */}
              <div className="flex items-center justify-between mb-6">
                <div className="text-sm text-gray-500">
                  문제 {currentQuestionIndex + 1} / {questions.length}
                </div>
              </div>

              {/* 문제 내용 */}
              <div className="mb-8">
                <h2 className="text-lg font-medium text-gray-900 mb-6 leading-relaxed">
                  {currentQuestion.question}
                </h2>

                {/* 답변 영역 */}
                {currentQuestion.type === "multiple-choice" ? (
                  // 객관식
                  <div className="space-y-3">
                    {(currentQuestion as MultipleChoiceQuestion).options?.map(
                      (option: string, index: number) => (
                        <label
                          key={index}
                          className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <input
                            type="radio"
                            name={`question-${currentQuestion._id}`}
                            value={option}
                            checked={answers[currentQuestion._id] === option}
                            onChange={(e) => handleAnswerChange(e.target.value)}
                            className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-gray-700">{option}</span>
                        </label>
                      )
                    )}
                  </div>
                ) : (
                  // 주관식
                  <div>
                    <textarea
                      value={answers[currentQuestion._id] || ""}
                      onChange={(e) => handleAnswerChange(e.target.value)}
                      placeholder="답변을 입력해주세요..."
                      className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    />
                  </div>
                )}
              </div>

              {/* 네비게이션 버튼 */}
              <div className="flex justify-between items-center">
                <button
                  onClick={goToPreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  이전 문제
                </button>

                <div className="flex space-x-4">
                  {currentQuestionIndex < questions.length - 1 ? (
                    <button
                      onClick={goToNextQuestion}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      다음 문제
                    </button>
                  ) : (
                    <button
                      onClick={submitTest}
                      disabled={isSubmitting}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSubmitting ? "제출 중..." : "테스트 완료"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 경고 메시지 (화면 이탈 시) */}
      {violationCount > 0 && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          ⚠️ 화면 이탈이 감지되었습니다. 추가 위반 시 평가가 종료됩니다.
        </div>
      )}
    </div>
  );
};

export default TechnicalTest;
