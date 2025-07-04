import React from "react";
import type { ApplicantDetail } from "../../types";

interface PersonalityTabProps {
  applicant: ApplicantDetail;
  expandedQuestions: Set<number>;
  toggleQuestion: (questionIndex: number) => void;
}

const PersonalityTab: React.FC<PersonalityTabProps> = ({
  applicant,
  expandedQuestions,
  toggleQuestion,
}) => {
  const getAnswerLabel = (answer: number) => {
    // 숫자가 아닌 경우 처리
    if (typeof answer !== "number") {
      return "데이터 오류";
    }

    // 1-5 범위가 아닌 경우 처리
    if (answer < 1 || answer > 5) {
      return `잘못된 값 (${answer})`;
    }

    const labels = [
      "전혀 그렇지 않다",
      "그렇지 않다",
      "보통이다",
      "그렇다",
      "매우 그렇다",
    ];
    return labels[answer - 1] || "알 수 없음";
  };

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      cooperate: "협업",
      responsibility: "책임감",
      leadership: "리더십",
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      cooperate: "bg-blue-100 text-blue-800",
      responsibility: "bg-emerald-100 text-emerald-800",
      leadership: "bg-purple-100 text-purple-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  if (!applicant.personalityTest) {
    return <div>인성 테스트 데이터가 없습니다.</div>;
  }

  return (
    <div className="space-y-6">
      {/* 그라데이션 헤더 */}
      <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-6 rounded-xl text-white">
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
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <div>
            <h2 className="text-2xl font-bold">인성 테스트</h2>
            <p className="mt-1 text-emerald-100">
              지원자의 인성 평가 및 답변 상세 분석
            </p>
          </div>
        </div>
      </div>

      {/* 점수 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <h3 className="text-lg font-medium text-slate-900">협업</h3>
          </div>
          <div className="text-3xl font-bold text-slate-900">
            {applicant.personalityTest.scores.cooperate.score}점
          </div>
          <div className="text-sm text-slate-600 mt-1">
            {applicant.personalityTest.scores.cooperate.level}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
            <h3 className="text-lg font-medium text-slate-900">책임감</h3>
          </div>
          <div className="text-3xl font-bold text-slate-900">
            {applicant.personalityTest.scores.responsibility.score}점
          </div>
          <div className="text-sm text-slate-600 mt-1">
            {applicant.personalityTest.scores.responsibility.level}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <h3 className="text-lg font-medium text-slate-900">리더십</h3>
          </div>
          <div className="text-3xl font-bold text-slate-900">
            {applicant.personalityTest.scores.leadership.score}점
          </div>
          <div className="text-sm text-slate-600 mt-1">
            {applicant.personalityTest.scores.leadership.level}
          </div>
        </div>
      </div>

      {/* 질문 리스트 */}
      {applicant.personalityTest?.questionDetails &&
        applicant.personalityTest.questionDetails.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-slate-600 rounded-full"></div>
              <h3 className="text-lg font-medium text-slate-900">
                질문 리스트
              </h3>
            </div>

            <div className="space-y-3">
              {applicant.personalityTest.questionDetails?.map(
                (detail, index) => {
                  return (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <button
                        onClick={() => toggleQuestion(index)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <span className="text-sm font-medium text-gray-600">
                              {index + 1}번
                            </span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                                detail.category
                              )}`}
                            >
                              {getCategoryLabel(detail.category)}
                            </span>
                            {detail.reverse_scoring && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                                역채점
                              </span>
                            )}
                            {detail.questionInfo && (
                              <span className="text-sm text-gray-700 truncate flex-1 ml-2">
                                {detail.questionInfo.content.length > 50
                                  ? detail.questionInfo.content.substring(
                                      0,
                                      50
                                    ) + "..."
                                  : detail.questionInfo.content}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-sm text-gray-500">
                              {detail.final_score}점
                            </span>
                            <svg
                              className={`w-4 h-4 text-gray-400 transition-transform ${
                                expandedQuestions.has(index) ? "rotate-180" : ""
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

                      {expandedQuestions.has(index) && (
                        <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
                          <div className="pt-4 space-y-3">
                            {detail.questionInfo ? (
                              <>
                                {/* 질문 내용 */}
                                <div className="bg-white rounded-lg p-3 border border-gray-200">
                                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                                    질문 내용
                                  </h4>
                                  <p className="text-sm text-gray-700 leading-relaxed">
                                    {detail.questionInfo.content}
                                  </p>
                                </div>

                                {/* 답변과 점수 */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                                    <h4 className="text-sm font-medium text-gray-900 mb-1">
                                      선택한 답변
                                    </h4>
                                    <p className="text-sm text-emerald-700 font-medium">
                                      {getAnswerLabel(detail.selected_answer)}
                                    </p>
                                  </div>

                                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm font-medium text-gray-900">
                                        최종 점수
                                      </span>
                                      <span className="text-lg font-bold text-purple-600">
                                        {detail.final_score}점
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                                <span className="text-sm text-yellow-700">
                                  질문 정보를 불러올 수 없습니다
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          </div>
        )}
    </div>
  );
};

export default PersonalityTab;
