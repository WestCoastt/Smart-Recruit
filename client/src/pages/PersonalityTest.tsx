import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getPersonalityTestQuestions } from "../utils/api";
import type { PersonalityQuestion, PersonalityTestData } from "../types";

interface PersonalityTestProps {
  applicantId: string;
}

const PersonalityTest: React.FC<PersonalityTestProps> = ({ applicantId }) => {
  const navigate = useNavigate();

  // 상태 관리
  const [questions, setQuestions] = useState<PersonalityQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: number }>({});
  const [timeRemaining, setTimeRemaining] = useState(15 * 60); // 15분 (초 단위)
  const [testStartTime] = useState(Date.now());
  const [isLoading, setIsLoading] = useState(true);
  const [isTestEnded, setIsTestEnded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // 현재 문항
  const currentQuestion = questions[currentQuestionIndex];

  // 5점 척도 옵션
  const scaleOptions = [
    { value: 1, label: "전혀 그렇지 않다" },
    { value: 2, label: "그렇지 않다" },
    { value: 3, label: "보통이다" },
    { value: 4, label: "그렇다" },
    { value: 5, label: "매우 그렇다" },
  ];

  // 테스트 종료 함수
  const endTest = useCallback(
    (reason: string) => {
      if (isTestEnded) return;
      setIsTestEnded(true);
      alert(`평가가 종료되었습니다.\n사유: ${reason}`);
      navigate("/", { replace: true });
    },
    [isTestEnded, navigate]
  );

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

  // 문항 로드
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const response = await getPersonalityTestQuestions();
        if (response.success && response.data) {
          const testData = response.data as PersonalityTestData;
          setQuestions(testData.questions);
        } else {
          throw new Error("문항을 불러올 수 없습니다.");
        }
      } catch {
        alert("문항을 불러오는 중 오류가 발생했습니다.");
        navigate(`/personality-instructions/${applicantId}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadQuestions();
  }, [applicantId, navigate]);

  // 시간 포맷팅
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  // 답변 저장
  const handleAnswerChange = (value: number) => {
    if (currentQuestion) {
      setAnswers((prev) => ({
        ...prev,
        [currentQuestion._id]: value,
      }));
    }
  };

  // 다음 문항으로 이동
  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  // 이전 문항으로 이동
  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  // 특정 문항으로 이동
  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  // 테스트 제출
  const handleSubmit = async () => {
    if (!applicantId) return;

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch(
        `/api/personality-test/${applicantId}/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            answers,
            totalTime: Math.round((Date.now() - testStartTime) / 1000), // Convert to seconds
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "제출에 실패했습니다.");
      }

      navigate(`/evaluation-complete/${applicantId}`);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "제출 중 오류가 발생했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">문항을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-600">문항을 불러올 수 없습니다.</p>
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
            <h1 className="text-xl font-bold text-gray-900">인성 테스트</h1>
            <div className="flex items-center space-x-6">
              <div className="text-sm text-gray-600">
                문항 {currentQuestionIndex + 1} / {questions.length}
              </div>
              <div
                className={`text-lg font-mono ${
                  timeRemaining < 300 ? "text-red-600" : "text-indigo-600"
                }`}
              >
                ⏰ {formatTime(timeRemaining)}
              </div>
              {/* 헤더 제출 버튼 */}
              <button
                onClick={handleSubmit}
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
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
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
          {/* 문항 네비게이션 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4 sticky top-4">
              <h3 className="font-semibold text-gray-900 mb-4">문항 목록</h3>
              <div className="grid grid-cols-5 gap-2 max-h-80 overflow-y-auto">
                {questions.map((question, index) => (
                  <button
                    key={question._id}
                    onClick={() => goToQuestion(index)}
                    className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                      index === currentQuestionIndex
                        ? "bg-indigo-600 text-white"
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
                  <div className="w-3 h-3 bg-indigo-600 rounded mr-2"></div>
                  현재 문항
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

          {/* 문항 영역 */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow p-6">
              {/* 문항 정보 */}
              <div className="flex items-center justify-end mb-6">
                <div className="text-sm text-gray-500">
                  문항 {currentQuestionIndex + 1} / {questions.length}
                </div>
              </div>

              {/* 문항 내용 */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-8 leading-relaxed bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
                  {currentQuestion.content}
                </h2>

                {/* 5점 척도 답변 영역 */}
                <div className="space-y-4">
                  <div className="text-center text-sm text-gray-500 mb-4">
                    해당 문항에 대한 귀하의 생각과 가장 가까운 항목을
                    선택해주세요
                  </div>

                  {/* 가로 배치된 5점 척도 */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    {scaleOptions.map((option) => (
                      <label
                        key={option.value}
                        className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors text-center"
                      >
                        <input
                          type="radio"
                          name={`question-${currentQuestion._id}`}
                          value={option.value}
                          checked={
                            answers[currentQuestion._id] === option.value
                          }
                          onChange={() => handleAnswerChange(option.value)}
                          className="mb-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700 leading-tight">
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* 네비게이션 버튼 */}
              <div className="flex justify-between items-center">
                <button
                  onClick={goToPreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  이전 문항
                </button>

                <div className="flex space-x-4">
                  {currentQuestionIndex < questions.length - 1 ? (
                    <button
                      onClick={goToNextQuestion}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      다음 문항
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
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

      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          {error}
        </div>
      )}
    </div>
  );
};

export default PersonalityTest;
