import React, { useState } from "react";
import type { ApplicantDetail } from "../../types";

interface InterviewTabProps {
  applicant: ApplicantDetail;
  onRefreshApplicant: () => Promise<void>;
}

const InterviewTab: React.FC<InterviewTabProps> = ({
  applicant,
  onRefreshApplicant,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegenerateQuestions = async (type: string) => {
    if (!applicant._id) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/applicants/${applicant._id}/interview-questions/regenerate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ type }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "면접 질문 재생성에 실패했습니다.");
      }

      await onRefreshApplicant();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "면접 질문 재생성 중 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!applicant.aiReport) {
    return <div>면접 질문 데이터가 없습니다.</div>;
  }

  // 틀린 문제들을 카테고리별로 정리하는 함수
  const getWrongQuestionsByCategory = () => {
    if (!applicant.technicalTest?.results) return {};

    return applicant.technicalTest.results.reduce(
      (
        acc: Record<
          string,
          Array<{
            question: string;
            answer: string | string[];
            options?: string[];
            type: "multiple-choice" | "short-answer" | "unknown";
            timeSpent: number;
          }>
        >,
        result
      ) => {
        if (!result.isCorrect && result.questionInfo) {
          if (!acc[result.questionInfo.category]) {
            acc[result.questionInfo.category] = [];
          }
          acc[result.questionInfo.category].push({
            question: result.questionInfo.question,
            answer: result.questionInfo.correctAnswer,
            options: result.questionInfo.options,
            type: result.questionInfo.type,
            timeSpent: result.timeSpent,
          });
        }
        return acc;
      },
      {}
    );
  };

  // 맞힌 문제들을 카테고리별로 정리하는 함수
  const getCorrectQuestionsByCategory = () => {
    if (!applicant.technicalTest?.results) return {};

    return applicant.technicalTest.results.reduce(
      (
        acc: Record<
          string,
          Array<{
            question: string;
            answer: string | string[];
            options?: string[];
            type: "multiple-choice" | "short-answer" | "unknown";
            timeSpent: number;
          }>
        >,
        result
      ) => {
        if (result.isCorrect && result.questionInfo) {
          if (!acc[result.questionInfo.category]) {
            acc[result.questionInfo.category] = [];
          }
          acc[result.questionInfo.category].push({
            question: result.questionInfo.question,
            answer: result.questionInfo.correctAnswer,
            options: result.questionInfo.options,
            type: result.questionInfo.type,
            timeSpent: result.timeSpent,
          });
        }
        return acc;
      },
      {}
    );
  };

  const wrongQuestionsByCategory = getWrongQuestionsByCategory();
  const correctQuestionsByCategory = getCorrectQuestionsByCategory();

  // 정답을 문자열로 변환하는 함수
  const formatAnswer = (
    answer: string | string[],
    options?: string[],
    type?: string
  ): string => {
    if (type === "multiple-choice" && options) {
      if (Array.isArray(answer)) {
        return answer
          .map((ans) => {
            const index = ans.toUpperCase();
            return `${index}. ${options[ans.toUpperCase().charCodeAt(0) - 65]}`;
          })
          .join(" 또는 ");
      } else {
        const index = answer.toUpperCase();
        return `${index}. ${options[index.charCodeAt(0) - 65].replace(
          /^[A-Z]\.\s*/,
          ""
        )}`;
      }
    }

    if (Array.isArray(answer)) {
      return answer.join(" 또는 ");
    }
    return answer;
  };

  // 소요시간을 포맷팅하는 함수
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}분 ${remainingSeconds}초`;
    }
    return `${remainingSeconds}초`;
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      {/* 그라데이션 헤더 */}
      <div className="bg-gradient-to-r from-blue-500 to-green-500 p-6 rounded-xl text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
              <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
            </svg>
            <div>
              <h2 className="text-2xl font-bold">면접 질문 가이드</h2>
              <p className="mt-1 text-blue-100">
                AI가 생성한 맞춤형 면접 질문들
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 기술 질문 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between bg-gradient-to-r from-blue-500 to-indigo-600 p-4 rounded-lg text-white mb-6">
          <div className="flex items-center gap-3">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
              />
            </svg>
            <h3 className="text-lg font-medium">기술 면접 질문</h3>
          </div>
          <button
            onClick={() => handleRegenerateQuestions("technical")}
            disabled={isLoading}
            className="bg-white/20 hover:bg-white/30 disabled:bg-white/10 px-4 py-2 rounded-lg text-white font-medium transition-colors disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                <span>재생성 중...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span>질문 재생성</span>
              </div>
            )}
          </button>
        </div>
        <div className="space-y-4">
          {applicant.aiReport.interviewQuestions?.technical?.map(
            (question, index) => {
              const relatedQuestions =
                question.type === "심화"
                  ? correctQuestionsByCategory[question.category] || []
                  : wrongQuestionsByCategory[question.category] || [];

              return (
                <div
                  key={index}
                  className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
                      {question.category}
                    </span>
                    {question.type && (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-800">
                        {question.type}
                      </span>
                    )}
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    {question.question}
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    {question.purpose}
                  </p>

                  {relatedQuestions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <h5 className="text-sm font-medium text-gray-900 mb-2">
                        {question.type === "심화"
                          ? "관련된 맞힌 문제들:"
                          : "관련된 틀린 문제들:"}
                      </h5>
                      <div className="space-y-2">
                        {relatedQuestions.map((relatedQ, idx) => (
                          <div
                            key={idx}
                            className={`p-3 rounded-md ${
                              question.type === "심화"
                                ? "bg-green-50"
                                : "bg-red-50"
                            }`}
                          >
                            <p
                              className={`text-sm ${
                                question.type === "심화"
                                  ? "text-green-800"
                                  : "text-red-800"
                              }`}
                            >
                              {relatedQ.question}
                            </p>
                            <div className="flex items-center justify-between mt-1">
                              <p
                                className={`text-xs ${
                                  question.type === "심화"
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                💡 정답:{" "}
                                {formatAnswer(
                                  relatedQ.answer,
                                  relatedQ.options,
                                  relatedQ.type
                                )}
                              </p>
                              <p
                                className={`text-xs ${
                                  question.type === "심화"
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                ⏱️ 소요시간: {formatTime(relatedQ.timeSpent)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* 인성 질문 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between bg-gradient-to-r from-green-500 to-teal-600 p-4 rounded-lg text-white mb-6">
          <div className="flex items-center gap-3">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="text-lg font-medium">인성 면접 질문</h3>
          </div>
          <button
            onClick={() => handleRegenerateQuestions("personality")}
            disabled={isLoading}
            className="bg-white/20 hover:bg-white/30 disabled:bg-white/10 px-4 py-2 rounded-lg text-white font-medium transition-colors disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                <span>재생성 중...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span>질문 재생성</span>
              </div>
            )}
          </button>
        </div>
        <div className="space-y-4">
          {applicant.aiReport.interviewQuestions?.personality?.map(
            (question, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded bg-emerald-100 text-emerald-800">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mr-1"></div>
                    {question.category}
                  </span>
                  {question.basedOn && (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-800">
                      {question.basedOn}
                    </span>
                  )}
                </div>
                <h4 className="font-medium text-gray-900 mb-2">
                  {question.question}
                </h4>
                <p className="text-sm text-gray-600">{question.purpose}</p>
              </div>
            )
          )}
        </div>
      </div>

      {/* 후속 질문 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="bg-gradient-to-r from-purple-500 to-violet-600 p-4 rounded-lg text-white mb-6">
          <div className="flex items-center gap-3">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-lg font-medium">후속 질문</h3>
          </div>
        </div>
        <div className="space-y-4">
          {applicant.aiReport.interviewQuestions?.followUp?.map(
            (question, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded bg-purple-100 text-purple-800">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-1"></div>
                    {question.type}
                  </span>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">
                  {question.question}
                </h4>
                <p className="text-sm text-gray-600">{question.purpose}</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewTab;
