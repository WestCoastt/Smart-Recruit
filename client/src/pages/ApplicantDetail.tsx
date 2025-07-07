import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { ApplicantDetail as ApplicantDetailType } from "../types";
import {
  OverviewTab,
  ChartsTab,
  TechnicalTab,
  PersonalityTab,
  AIReportTab,
  InterviewTab,
} from "../components/ApplicantDetailTabs";

const ApplicantDetail: React.FC = () => {
  const { applicantId } = useParams<{ applicantId: string }>();
  const navigate = useNavigate();
  const [applicant, setApplicant] = useState<ApplicantDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(
    new Set()
  );

  const toggleQuestion = (questionIndex: number) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(questionIndex)) {
      newExpanded.delete(questionIndex);
    } else {
      newExpanded.add(questionIndex);
    }
    setExpandedQuestions(newExpanded);
  };

  useEffect(() => {
    fetchApplicantDetail();
  }, [applicantId]);

  const fetchApplicantDetail = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");

      if (!token) {
        navigate("/admin/login");
        return;
      }

      const response = await fetch(`/api/admin/applicants/${applicantId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminInfo");
        navigate("/admin/login");
        return;
      }

      if (response.status === 403) {
        const data = await response.json();
        setError(
          data.message ||
            "부정행위가 감지된 지원자의 상세 정보는 조회할 수 없습니다."
        );
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setApplicant(data.data);
      } else {
        setError("지원자 정보를 불러오는데 실패했습니다.");
      }
    } catch {
      setError("서버 연결에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}분 ${remainingSeconds}초`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !applicant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">오류 발생</h1>
          <p className="text-gray-600 mb-4">
            {error || "지원자 정보를 찾을 수 없습니다."}
          </p>
          <button
            onClick={() => navigate("/admin/applicants")}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            지원자 목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/admin/applicants")}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="지원자 목록으로 돌아가기"
              >
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  localStorage.removeItem("adminToken");
                  localStorage.removeItem("adminInfo");
                  navigate("/admin/login");
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors duration-200"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* 기본 정보 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-4">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {applicant.name}
                  </h2>
                  <p className="text-sm text-gray-500">지원자 기본 정보</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="group">
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-blue-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        이메일
                      </dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {applicant.email}
                      </dd>
                    </div>
                  </div>
                </div>

                <div className="group">
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-green-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        연락처
                      </dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {applicant.phone}
                      </dd>
                    </div>
                  </div>
                </div>

                <div className="group">
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-purple-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        등록일
                      </dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {formatDate(applicant.createdAt)}
                      </dd>
                    </div>
                  </div>
                </div>

                {applicant.technicalTest && (
                  <div className="group">
                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-orange-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                          기술 테스트 완료
                        </dt>
                        <dd className="text-sm font-medium text-gray-900">
                          {formatDate(applicant.technicalTest.submittedAt)}
                        </dd>
                      </div>
                    </div>
                  </div>
                )}

                {applicant.personalityTest && (
                  <div className="group">
                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-pink-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                          인성 테스트 완료
                        </dt>
                        <dd className="text-sm font-medium text-gray-900">
                          {formatDate(applicant.personalityTest.submittedAt)}
                        </dd>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 탭 네비게이션 */}
          <div className="bg-white shadow rounded-lg">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`py-4 px-6 text-sm font-medium ${
                    activeTab === "overview"
                      ? "border-b-2 border-indigo-500 text-indigo-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  점수 개요
                </button>
                <button
                  onClick={() => setActiveTab("charts")}
                  className={`py-4 px-6 text-sm font-medium ${
                    activeTab === "charts"
                      ? "border-b-2 border-indigo-500 text-indigo-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  점수 분석
                </button>
                <button
                  onClick={() => setActiveTab("technical")}
                  className={`py-4 px-6 text-sm font-medium ${
                    activeTab === "technical"
                      ? "border-b-2 border-indigo-500 text-indigo-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  기술 테스트
                </button>
                <button
                  onClick={() => setActiveTab("personality")}
                  className={`py-4 px-6 text-sm font-medium ${
                    activeTab === "personality"
                      ? "border-b-2 border-indigo-500 text-indigo-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  인성 테스트
                </button>
                {applicant.aiReport && (
                  <button
                    onClick={() => setActiveTab("ai-report")}
                    className={`py-4 px-6 text-sm font-medium ${
                      activeTab === "ai-report"
                        ? "border-b-2 border-indigo-500 text-indigo-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    AI 리포트
                  </button>
                )}
                {applicant.aiReport && (
                  <button
                    onClick={() => setActiveTab("interview")}
                    className={`py-4 px-6 text-sm font-medium ${
                      activeTab === "interview"
                        ? "border-b-2 border-indigo-500 text-indigo-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    면접 질문
                  </button>
                )}
              </nav>
            </div>

            <div className="p-6">
              {/* 탭 컨텐츠 */}
              {activeTab === "overview" && (
                <OverviewTab applicant={applicant} formatTime={formatTime} />
              )}

              {activeTab === "charts" && (
                <ChartsTab applicant={applicant} formatTime={formatTime} />
              )}

              {activeTab === "technical" && (
                <TechnicalTab
                  applicant={applicant}
                  expandedQuestions={expandedQuestions}
                  toggleQuestion={toggleQuestion}
                />
              )}

              {activeTab === "personality" && (
                <PersonalityTab
                  applicant={applicant}
                  expandedQuestions={expandedQuestions}
                  toggleQuestion={toggleQuestion}
                />
              )}

              {activeTab === "ai-report" && applicant.aiReport && (
                <AIReportTab
                  applicant={applicant}
                  onRefreshApplicant={fetchApplicantDetail}
                />
              )}

              {activeTab === "interview" && applicant.aiReport && (
                <InterviewTab
                  applicant={applicant}
                  onRefreshApplicant={fetchApplicantDetail}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ApplicantDetail;
