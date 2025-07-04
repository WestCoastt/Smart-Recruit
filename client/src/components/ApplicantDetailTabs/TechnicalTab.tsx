import React from "react";
import type { ApplicantDetail } from "../../types";

interface TechnicalTabProps {
  applicant: ApplicantDetail;
  expandedQuestions: Set<number>;
  toggleQuestion: (questionIndex: number) => void;
}

const TechnicalTab: React.FC<TechnicalTabProps> = ({
  applicant,
  expandedQuestions,
  toggleQuestion,
}) => {
  // 전체 30문제 목록 생성 (백엔드에서 받은 전체 문제 정보 사용)
  const getAllQuestions = () => {
    if (!applicant?.technicalTest) return [];

    const { results, allQuestions: backendAllQuestions } =
      applicant.technicalTest;

    // 백엔드에서 전체 문제 정보를 받은 경우
    if (backendAllQuestions && backendAllQuestions.length > 0) {
      return backendAllQuestions.map((questionItem) => {
        // 해당 문제의 제출 결과 찾기
        const result = results.find(
          (r) => r.questionId === questionItem.questionId
        );

        return {
          index: questionItem.index,
          questionInfo: questionItem.questionInfo,
          result: result || null,
          status: result ? ("submitted" as const) : ("not_submitted" as const),
        };
      });
    }

    // 백엔드에서 전체 문제 정보를 받지 못한 경우 (이전 방식)
    const totalQuestions = 30;
    const allQuestions = [];

    // 제출된 문제들을 먼저 추가
    for (let i = 0; i < results.length; i++) {
      allQuestions.push({
        index: i + 1,
        questionInfo: results[i].questionInfo,
        result: results[i],
        status: "submitted" as const,
      });
    }

    // 미제출 문제들 추가
    for (let i = results.length; i < totalQuestions; i++) {
      allQuestions.push({
        index: i + 1,
        questionInfo: null,
        result: null,
        status: "not_submitted" as const,
      });
    }

    return allQuestions;
  };

  if (!applicant.technicalTest) {
    return <div>기술 테스트 데이터가 없습니다.</div>;
  }

  return (
    <div className="space-y-6">
      {/* 그라데이션 헤더 */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-xl text-white">
        <div className="flex items-center space-x-3">
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          <div>
            <h2 className="text-2xl font-bold">기술 테스트</h2>
            <p className="mt-1 text-blue-100">문제별 상세 분석 및 답변 검토</p>
          </div>
        </div>
      </div>

      {/* 기술 테스트 탭 */}

      <div className="space-y-6">
        {/* 통계 요약 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            테스트 결과 요약
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">총 문제</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">30</p>
                </div>
                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-slate-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path
                      fillRule="evenodd"
                      d="M4 5a2 2 0 012-2v1a2 2 0 002 2h4a2 2 0 002-2V3a2 2 0 012 2v6.5a1.5 1.5 0 01-1.5 1.5h-1a1.5 1.5 0 01-1.5-1.5v-1a1.5 1.5 0 00-1.5-1.5h-1a1.5 1.5 0 00-1.5 1.5v1A1.5 1.5 0 015.5 13h-1A1.5 1.5 0 013 11.5V5z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-emerald-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-600">
                    정답 수
                  </p>
                  <p className="text-3xl font-bold text-emerald-900 mt-1">
                    {
                      applicant.technicalTest.results.filter((r) => r.isCorrect)
                        .length
                    }
                  </p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-emerald-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-rose-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-rose-600">오답 수</p>
                  <p className="text-3xl font-bold text-rose-900 mt-1">
                    {
                      applicant.technicalTest.results.filter(
                        (r) => !r.isCorrect
                      ).length
                    }
                  </p>
                </div>
                <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-rose-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-amber-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-600">
                    미응답 수
                  </p>
                  <p className="text-3xl font-bold text-amber-900 mt-1">
                    {30 - applicant.technicalTest.results.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-amber-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 전체 문제 목록 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              문제별 상세 결과
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              각 문제를 클릭하면 상세 내용을 확인할 수 있습니다.
            </p>
          </div>
          <div className="divide-y divide-gray-200">
            {getAllQuestions().map((questionItem) => {
              const isExpanded = expandedQuestions.has(questionItem.index);
              const isSubmitted = questionItem.status === "submitted";
              const isCorrect = isSubmitted
                ? questionItem.result?.isCorrect
                : false;

              return (
                <div
                  key={questionItem.index}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* 문제 헤더 */}
                  <button
                    onClick={() => toggleQuestion(questionItem.index)}
                    className="w-full px-6 py-4 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1 mr-4">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="flex items-center space-x-2">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold ${
                                !isSubmitted
                                  ? "bg-amber-100 text-amber-800"
                                  : isCorrect
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-rose-100 text-rose-800"
                              }`}
                            >
                              {questionItem.index}
                            </div>
                            <span className="text-lg font-semibold text-gray-900">
                              문제 {questionItem.index}
                            </span>
                          </div>

                          {/* 카테고리 배지 */}
                          {questionItem.questionInfo?.category && (
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                              {questionItem.questionInfo.category}
                            </span>
                          )}

                          {/* 상태 배지 */}
                          <div className="flex items-center space-x-1">
                            {!isSubmitted ? (
                              <div className="flex items-center space-x-1">
                                <svg
                                  className="w-4 h-4 text-amber-600"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                <span className="text-xs font-medium text-amber-800">
                                  미제출
                                </span>
                              </div>
                            ) : isCorrect ? (
                              <div className="flex items-center space-x-1">
                                <svg
                                  className="w-4 h-4 text-emerald-600"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                <span className="text-xs font-medium text-emerald-800">
                                  정답
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-1">
                                <svg
                                  className="w-4 h-4 text-rose-600"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                <span className="text-xs font-medium text-rose-800">
                                  오답
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 문제 내용 미리보기 */}
                        {questionItem.questionInfo?.question && (
                          <p
                            className="text-sm text-gray-600 pr-4"
                            style={{
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              lineHeight: "1.4em",
                              maxHeight: "2.8em",
                            }}
                          >
                            {questionItem.questionInfo.question}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center space-x-4">
                        {/* 소요시간 */}
                        {isSubmitted && (
                          <div className="text-right">
                            <div className="text-xs text-gray-500">
                              소요시간
                            </div>
                            <div className="text-sm font-medium text-gray-900">
                              {questionItem.result?.timeSpent}초
                            </div>
                          </div>
                        )}

                        {/* 펼치기/접기 아이콘 */}
                        <svg
                          className={`w-5 h-5 text-gray-400 transform transition-transform ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                  </button>

                  {/* 아코디언 내용 */}
                  {isExpanded && (
                    <div className="px-6 pb-6 border-t border-gray-200">
                      {questionItem.questionInfo &&
                      questionItem.questionInfo.question ? (
                        <div className="pt-4 space-y-4">
                          {/* 문제 내용 */}
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">
                              문제
                            </h4>
                            <p className="text-gray-900 leading-relaxed mb-4">
                              {questionItem.questionInfo?.question}
                            </p>

                            {/* 객관식 선택지 */}
                            {questionItem.questionInfo?.type ===
                              "multiple-choice" &&
                              questionItem.questionInfo?.options && (
                                <div className="mb-4">
                                  <h5 className="text-sm font-medium text-gray-700 mb-2">
                                    선택지
                                  </h5>
                                  <div className="space-y-2">
                                    {questionItem.questionInfo?.options?.map(
                                      (option, optIndex) => {
                                        const isUserChoice =
                                          questionItem.result?.userAnswer ===
                                          option;
                                        const isCorrectChoice =
                                          questionItem.questionInfo
                                            ?.correctAnswer === option;

                                        let optionClass = "p-3 rounded border ";
                                        if (isSubmitted) {
                                          if (isUserChoice && isCorrectChoice) {
                                            optionClass +=
                                              "bg-green-100 border-green-300 text-green-900";
                                          } else if (
                                            isUserChoice &&
                                            !isCorrectChoice
                                          ) {
                                            optionClass +=
                                              "bg-red-100 border-red-300 text-red-900";
                                          } else if (
                                            !isUserChoice &&
                                            isCorrectChoice
                                          ) {
                                            optionClass +=
                                              "bg-blue-100 border-blue-300 text-blue-900";
                                          } else {
                                            optionClass +=
                                              "bg-gray-50 border-gray-200 text-gray-700";
                                          }
                                        } else {
                                          // 미제출 문제의 경우 정답만 강조
                                          if (isCorrectChoice) {
                                            optionClass +=
                                              "bg-blue-100 border-blue-300 text-blue-900";
                                          } else {
                                            optionClass +=
                                              "bg-gray-50 border-gray-200 text-gray-700";
                                          }
                                        }

                                        return (
                                          <div
                                            key={optIndex}
                                            className={optionClass}
                                          >
                                            <div className="flex items-center justify-between">
                                              <span>{option}</span>
                                              <div className="flex space-x-2">
                                                {isSubmitted &&
                                                  isUserChoice && (
                                                    <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded">
                                                      지원자 선택
                                                    </span>
                                                  )}
                                                {isCorrectChoice && (
                                                  <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                                                    정답
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      }
                                    )}
                                  </div>
                                </div>
                              )}
                          </div>

                          {/* 답변 비교 (제출된 문제만) */}
                          {isSubmitted && questionItem.result && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h5 className="text-sm font-medium text-gray-700 mb-2">
                                  지원자 답변
                                </h5>
                                <div className="p-3 rounded border bg-white border-gray-200">
                                  {questionItem.result.userAnswer ||
                                    "답변 없음"}
                                </div>
                              </div>
                              <div>
                                <h5 className="text-sm font-medium text-gray-700 mb-2">
                                  정답
                                </h5>
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded text-blue-900">
                                  {Array.isArray(
                                    questionItem.result.correctAnswer
                                  )
                                    ? questionItem.result.correctAnswer.join(
                                        ", "
                                      )
                                    : questionItem.result.correctAnswer}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 미제출 문제의 정답 표시 */}
                          {!isSubmitted && (
                            <div>
                              <h5 className="text-sm font-medium text-gray-700 mb-2">
                                정답
                              </h5>
                              <div className="p-3 bg-blue-50 border border-blue-200 rounded text-blue-900">
                                {Array.isArray(
                                  questionItem.questionInfo?.correctAnswer
                                )
                                  ? questionItem.questionInfo?.correctAnswer?.join?.(
                                      ", "
                                    )
                                  : questionItem.questionInfo?.correctAnswer}
                              </div>
                            </div>
                          )}

                          {/* 해설 */}
                          {questionItem.questionInfo?.explanation && (
                            <div>
                              <h5 className="text-sm font-medium text-gray-700 mb-2">
                                해설
                              </h5>
                              <div className="p-3 bg-gray-50 border border-gray-200 rounded text-gray-700">
                                {questionItem.questionInfo?.explanation}
                              </div>
                            </div>
                          )}

                          {/* 미제출 알림 */}
                          {!isSubmitted && (
                            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                              <div className="flex items-center">
                                <svg
                                  className="w-5 h-5 text-yellow-600 mr-2"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                <div>
                                  <p className="text-sm font-medium text-yellow-800">
                                    미제출 문제
                                  </p>
                                  <p className="text-sm text-yellow-700">
                                    지원자가 건너뛰어 답변을 하지 못한
                                    문제입니다.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="pt-4">
                          <div className="text-center py-8 text-gray-500">
                            <div className="text-sm">
                              문제 정보를 불러올 수 없습니다.
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicalTab;
