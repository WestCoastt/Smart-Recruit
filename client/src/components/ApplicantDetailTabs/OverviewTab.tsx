import React from "react";
import type { ApplicantDetail } from "../../types";

interface OverviewTabProps {
  applicant: ApplicantDetail;
  formatTime: (seconds: number) => string;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ applicant, formatTime }) => {
  return (
    <div className="space-y-6">
      {/* 그라데이션 헤더 */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded-xl text-white">
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
            <h2 className="text-2xl font-bold">점수 개요</h2>
            <p className="mt-1 text-blue-100">
              지원자의 전체 테스트 결과를 확인하세요
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 기술 테스트 점수 */}
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
                    기술 테스트
                  </h3>
                </div>
              </div>
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {applicant.technicalTest.score}
                    <span className="text-2xl text-gray-500">/ 30</span>
                  </div>
                  <div className="text-lg text-blue-700 font-medium">
                    {((applicant.technicalTest.score / 30) * 100).toFixed(1)}%
                    정답률
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <svg
                          className="w-4 h-4 text-blue-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-sm font-medium text-blue-900">
                          획득 점수
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-blue-900">
                        {applicant.technicalTest.score}점
                      </span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            (applicant.technicalTest.score / 30) * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <svg
                          className="w-4 h-4 text-gray-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-sm font-medium text-gray-700">
                          소요시간
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatTime(applicant.technicalTest.totalTime)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 인성 테스트 점수 */}
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
                    인성 테스트
                  </h3>
                </div>
              </div>
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-emerald-600 mb-2">
                    {applicant.personalityTest.scores.total}
                    <span className="text-lg text-gray-500">점</span>
                  </div>
                  <div className="text-lg text-emerald-700 font-medium">
                    종합 점수
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <svg
                          className="w-4 h-4 text-blue-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                        <span className="text-sm font-medium text-blue-900">
                          협업
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-blue-900">
                          {applicant.personalityTest.scores.cooperate.score}점
                        </span>
                        <span className="text-xs text-blue-700 ml-2">
                          ({applicant.personalityTest.scores.cooperate.level})
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            (applicant.personalityTest.scores.cooperate.score /
                              200) *
                              100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <svg
                          className="w-4 h-4 text-purple-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-sm font-medium text-purple-900">
                          책임감
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-purple-900">
                          {
                            applicant.personalityTest.scores.responsibility
                              .score
                          }
                          점
                        </span>
                        <span className="text-xs text-purple-700 ml-2">
                          (
                          {
                            applicant.personalityTest.scores.responsibility
                              .level
                          }
                          )
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-purple-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            (applicant.personalityTest.scores.responsibility
                              .score /
                              200) *
                              100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <svg
                          className="w-4 h-4 text-orange-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-sm font-medium text-orange-900">
                          리더십
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-orange-900">
                          {applicant.personalityTest.scores.leadership.score}점
                        </span>
                        <span className="text-xs text-orange-700 ml-2">
                          ({applicant.personalityTest.scores.leadership.level})
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-orange-200 rounded-full h-2">
                      <div
                        className="bg-orange-600 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            (applicant.personalityTest.scores.leadership.score /
                              200) *
                              100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <svg
                          className="w-4 h-4 text-gray-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-sm font-medium text-gray-700">
                          소요시간
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatTime(applicant.personalityTest.totalTime)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
