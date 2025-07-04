import React, { useState } from "react";
import type { ApplicantDetail } from "../../types";

interface AIReportTabProps {
  applicant: ApplicantDetail;
  onRefreshApplicant: () => Promise<void>;
}

// Helper functions for recommendation display
const getRecommendationColor = (recommendation: string) => {
  switch (recommendation) {
    case "high":
      return "bg-green-100 text-green-800 border border-green-200";
    case "medium":
      return "bg-yellow-100 text-yellow-800 border border-yellow-200";
    case "low":
      return "bg-red-100 text-red-800 border border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border border-gray-200";
  }
};

const getRecommendationText = (recommendation: string) => {
  switch (recommendation) {
    case "high":
      return "적극 추천";
    case "medium":
      return "보통";
    case "low":
      return "재검토 필요";
    default:
      return "평가 중";
  }
};

const AIReportTab: React.FC<AIReportTabProps> = ({
  applicant,
  onRefreshApplicant,
}) => {
  const [regeneratingAI, setRegeneratingAI] = useState(false);

  const regenerateAIReport = async () => {
    if (regeneratingAI) return;

    try {
      setRegeneratingAI(true);
      const token = localStorage.getItem("adminToken");

      if (!token) {
        alert("인증 토큰이 없습니다. 다시 로그인해주세요.");
        return;
      }

      const response = await fetch(
        `/api/admin/applicants/${applicant._id}/regenerate-ai-report`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          await onRefreshApplicant();
          alert("AI 리포트가 성공적으로 재생성되었습니다.");
        } else {
          alert("AI 리포트 재생성 중 오류가 발생했습니다.");
        }
      } else {
        alert("AI 리포트 재생성 요청이 실패했습니다.");
      }
    } catch (error) {
      console.error("AI 리포트 재생성 오류:", error);
      alert("AI 리포트 재생성 중 네트워크 오류가 발생했습니다.");
    } finally {
      setRegeneratingAI(false);
    }
  };

  if (!applicant.aiReport) {
    return <div>AI 리포트 데이터가 없습니다.</div>;
  }

  // 실제 데이터 구조에 맞게 접근
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const report = applicant.aiReport?.report as any;

  return (
    <div className="space-y-6">
      {/* 그라데이션 헤더 */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6 rounded-xl text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
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
              <h2 className="text-2xl font-bold">AI 분석 리포트</h2>
              <p className="mt-1 text-purple-100">
                AI가 분석한 지원자의 종합 평가
              </p>
            </div>
          </div>

          {/* 재생성 버튼 */}
          <button
            onClick={regenerateAIReport}
            disabled={regeneratingAI}
            className="bg-white/20 hover:bg-white/30 disabled:bg-white/10 px-4 py-2 rounded-lg text-white font-medium transition-colors disabled:cursor-not-allowed"
          >
            {regeneratingAI ? (
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
                <span>리포트 재생성</span>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* 추천도 표시 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">추천도</h3>
          <div
            className={`px-4 py-2 rounded-full text-sm font-medium ${getRecommendationColor(
              report?.overallAssessment?.recommendation || "medium"
            )}`}
          >
            {getRecommendationText(
              report?.overallAssessment?.recommendation || "medium"
            )}
          </div>
        </div>
      </div>

      {/* 종합 평가 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="bg-gradient-to-r from-gray-500 to-slate-600 p-4 rounded-lg text-white mb-6">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path
                fillRule="evenodd"
                d="M4 5a2 2 0 012-2v1a2 2 0 002 2h4a2 2 0 002-2V3a2 2 0 012 2v6.5a1.5 1.5 0 01-1.5 1.5h-1a1.5 1.5 0 01-1.5-1.5v-1a1.5 1.5 0 00-1.5-1.5h-1a1.5 1.5 0 00-1.5 1.5v1A1.5 1.5 0 015.5 13h-1A1.5 1.5 0 013 11.5V5z"
                clipRule="evenodd"
              />
            </svg>
            <h3 className="text-lg font-medium">종합 평가</h3>
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <h4 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
              전체 평가
            </h4>
            <p className="text-base font-medium text-gray-900">
              {report?.overallAssessment?.comprehensiveEvaluation ||
                "분석 정보가 없습니다."}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-800">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                핵심 강점
              </span>
            </div>
            <p className="text-base font-medium text-gray-900">
              {report?.overallAssessment?.keyStrengths ||
                "분석 정보가 없습니다."}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded bg-amber-100 text-amber-800">
                <div className="w-2 h-2 bg-amber-500 rounded-full mr-1"></div>
                개발 필요 영역
              </span>
            </div>
            <p className="text-base font-medium text-gray-900">
              {report?.overallAssessment?.developmentAreas ||
                "분석 정보가 없습니다."}
            </p>
          </div>
        </div>
      </div>

      {/* 기술 역량 분석 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 rounded-lg text-white mb-6">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
              <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
            </svg>
            <div>
              <h3 className="text-lg font-medium">기술 역량 분석</h3>
              <span className="text-sm text-blue-100">
                전반적 수준:{" "}
                {report?.technicalAnalysis?.overallLevel || "평가 중"}
              </span>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <h4 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
              상세 평가
            </h4>
            <p className="text-base font-medium text-gray-900">
              {report?.technicalAnalysis?.detailedAssessment ||
                "분석 정보가 없습니다."}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-800">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                강점 분석
              </span>
            </div>
            <p className="text-base font-medium text-gray-900">
              {report?.technicalAnalysis?.strengths || "분석 정보가 없습니다."}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded bg-red-100 text-red-800">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                약점 분석
              </span>
            </div>
            <p className="text-base font-medium text-gray-900">
              {report?.technicalAnalysis?.weaknesses || "분석 정보가 없습니다."}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded bg-indigo-100 text-indigo-800">
                <div className="w-2 h-2 bg-indigo-500 rounded-full mr-1"></div>
                시간 효율성 분석
              </span>
            </div>
            <p className="text-base font-medium text-gray-900">
              {report?.technicalAnalysis?.timeEfficiency ||
                "분석 정보가 없습니다."}
            </p>
          </div>
        </div>
      </div>

      {/* 인성 분석 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-4 rounded-lg text-white mb-6">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
            </svg>
            <h3 className="text-lg font-medium">인성 분석</h3>
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
                협업 능력
              </span>
            </div>
            <p className="text-base font-medium text-gray-900">
              {report?.personalityAnalysis?.cooperation ||
                "분석 정보가 없습니다."}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded bg-purple-100 text-purple-800">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-1"></div>
                책임감
              </span>
            </div>
            <p className="text-base font-medium text-gray-900">
              {report?.personalityAnalysis?.responsibility ||
                "분석 정보가 없습니다."}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded bg-orange-100 text-orange-800">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-1"></div>
                리더십
              </span>
            </div>
            <p className="text-base font-medium text-gray-900">
              {report?.personalityAnalysis?.leadership ||
                "분석 정보가 없습니다."}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded bg-pink-100 text-pink-800">
                <div className="w-2 h-2 bg-pink-500 rounded-full mr-1"></div>
                성장 가능성
              </span>
            </div>
            <p className="text-base font-medium text-gray-900">
              {report?.personalityAnalysis?.growthPotential ||
                "분석 정보가 없습니다."}
            </p>
          </div>
        </div>
      </div>

      {/* 면접 포인트 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-4 rounded-lg text-white mb-6">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
            <h3 className="text-lg font-medium">면접 확인 포인트</h3>
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
                기술 면접 포인트
              </span>
            </div>
            <p className="text-base font-medium text-gray-900">
              {report?.interviewFocus?.technicalQuestions ||
                "분석 정보가 없습니다."}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-800">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                인성 면접 포인트
              </span>
            </div>
            <p className="text-base font-medium text-gray-900">
              {report?.interviewFocus?.personalityQuestions ||
                "분석 정보가 없습니다."}
            </p>
          </div>
        </div>
      </div>

      {/* 조직 적합성 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
          <h3 className="text-lg font-medium text-slate-900">조직 적합성</h3>
        </div>
        <p className="text-base font-medium text-gray-900">
          {report?.personalityAnalysis?.organizationFit ||
            "분석 정보가 없습니다."}
        </p>
      </div>
    </div>
  );
};

export default AIReportTab;
