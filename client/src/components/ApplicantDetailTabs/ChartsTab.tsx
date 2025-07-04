import React from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import type { ApplicantDetail } from "../../types";

interface ChartsTabProps {
  applicant: ApplicantDetail;
  formatTime: (seconds: number) => string;
}

const ChartsTab: React.FC<ChartsTabProps> = ({ applicant, formatTime }) => {
  // 차트 데이터 생성 함수들
  const getPersonalityChartData = () => {
    if (!applicant?.personalityTest) return [];

    const { scores } = applicant.personalityTest;
    return [
      {
        subject: "협업",
        score: (scores.cooperate.score / 200) * 100, // 200점 만점을 100%로 변환
        fullMark: 100,
        level: scores.cooperate.level,
      },
      {
        subject: "책임감",
        score: (scores.responsibility.score / 200) * 100,
        fullMark: 100,
        level: scores.responsibility.level,
      },
      {
        subject: "리더십",
        score: (scores.leadership.score / 200) * 100,
        fullMark: 100,
        level: scores.leadership.level,
      },
    ];
  };

  const getScoreDistributionData = () => {
    if (!applicant?.technicalTest) return [];

    const { results } = applicant.technicalTest;
    const totalProblems = 30; // 임시로 30문제 고정
    const correct = results.filter((r) => r.isCorrect).length;
    const incorrect = results.filter(
      (r) => !r.isCorrect && r.userAnswer && r.userAnswer.trim() !== ""
    ).length;
    const unanswered = totalProblems - results.length;

    const data = [
      { name: "정답", value: correct, color: "#10B981" },
      { name: "오답", value: incorrect, color: "#EF4444" },
    ];

    if (unanswered > 0) {
      data.push({ name: "미응답", value: unanswered, color: "#F59E0B" });
    }

    return data;
  };

  const getTimeAnalysisData = () => {
    if (!applicant?.technicalTest) return [];

    const { results } = applicant.technicalTest;
    return results.slice(0, 10).map((result, index) => ({
      question: `문제 ${index + 1}`,
      time: result.timeSpent,
      correct: result.isCorrect,
    }));
  };

  return (
    <div className="space-y-6">
      {/* 그라데이션 헤더 */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6 rounded-xl text-white">
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
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <div>
            <h2 className="text-2xl font-bold">점수 분석</h2>
            <p className="mt-1 text-purple-100">
              차트로 확인하는 상세 분석 결과
            </p>
          </div>
        </div>
      </div>

      {/* 기술 테스트 분석 */}
      {applicant.technicalTest && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-blue-50 px-6 py-4 border-b border-blue-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                  <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-blue-900">
                기술 테스트 분석
              </h3>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* 정답/오답 분포 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-4 text-center">
                  정답/오답 분포
                </h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getScoreDistributionData()}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {getScoreDistributionData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              {/* 문제별 소요시간 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-4 text-center">
                  문제별 소요시간 (상위 10문제)
                </h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getTimeAnalysisData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="question"
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis />
                      <Tooltip
                        formatter={(value: number) => [
                          `${value}초`,
                          "소요시간",
                        ]}
                      />
                      <Bar dataKey="time" fill="#3B82F6">
                        {getTimeAnalysisData().map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.correct ? "#10B981" : "#EF4444"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 통계 요약 */}
      {applicant.technicalTest && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-900">
                  {applicant.technicalTest.score}
                </div>
                <div className="text-sm text-blue-700">총 점수</div>
              </div>
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
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
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-emerald-900">
                  {((applicant.technicalTest.score / 30) * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-emerald-700">정답률</div>
              </div>
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-900">
                  {formatTime(applicant.technicalTest.totalTime)}
                </div>
                <div className="text-sm text-purple-700">총 소요시간</div>
              </div>
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-900">
                  {(
                    applicant.technicalTest.totalTime /
                    applicant.technicalTest.results.length
                  ).toFixed(1)}
                  초
                </div>
                <div className="text-sm text-orange-700">평균 문제당 시간</div>
              </div>
              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 인성 레이더 차트 */}
      {applicant.personalityTest && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-emerald-50 px-6 py-4 border-b border-emerald-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-emerald-900">
                인성 분석 차트
              </h3>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-4 text-center">
                  레이더 차트
                </h4>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={getPersonalityChartData()}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis
                        angle={90}
                        domain={[0, 100]}
                        tick={false}
                      />
                      <Radar
                        name="점수"
                        dataKey="score"
                        stroke="#059669"
                        fill="#10B981"
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                      <Tooltip
                        formatter={(value: number, name: string) => [
                          `${Math.round(value)}%`,
                          name,
                        ]}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-700 mb-4">
                  세부 점수
                </h4>
                {getPersonalityChartData().map((item, index) => (
                  <div
                    key={index}
                    className="bg-white p-4 rounded-lg border border-gray-200 hover:border-emerald-300 transition-colors"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                        <span className="font-medium text-gray-900">
                          {item.subject}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-gray-900">
                          {Math.round(item.score)}%
                        </span>
                        <span className="text-xs text-emerald-700 ml-2">
                          ({item.level})
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${item.score}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartsTab;
