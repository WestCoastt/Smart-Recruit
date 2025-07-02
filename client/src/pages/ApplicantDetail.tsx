import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

interface ApplicantDetail {
  _id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  technicalTest?: {
    score: number;
    maxScore: number;
    totalTime: number;
    totalQuestions?: number;
    results: Array<{
      questionId: string;
      userAnswer: string;
      correctAnswer: string | string[];
      isCorrect: boolean;
      timeSpent: number;
      questionInfo?: {
        id: string;
        category: string;
        question: string;
        type: "multiple-choice" | "short-answer" | "unknown";
        options?: string[];
        correctAnswer: string | string[];
        explanation?: string;
      };
    }>;
    allQuestions?: Array<{
      index: number;
      questionId: string;
      questionInfo: {
        id: string;
        category: string;
        question: string;
        type: "multiple-choice" | "short-answer" | "unknown";
        options?: string[];
        correctAnswer: string | string[];
        explanation?: string;
      };
    }>;
    submittedAt: string;
  };
  personalityTest?: {
    totalTime: number;
    submittedAt: string;
    scores: {
      cooperate: { score: number; level: string };
      responsibility: { score: number; level: string };
      leadership: { score: number; level: string };
      total: number;
    };
  };
  aiReport?: {
    report: {
      technicalAnalysis: {
        overallLevel: string;
        strengths: string[];
        weaknesses: string[];
        timeEfficiency: string;
      };
      personalityAnalysis: {
        cooperation: string;
        responsibility: string;
        leadership: string;
        organizationFit: string;
        growthPotential: string;
      };
      overallAssessment: {
        recommendation: "high" | "medium" | "low";
        mainStrengths: string[];
        improvementAreas: string[];
      };
    };
    interviewQuestions: {
      technical: Array<{
        category: string;
        question: string;
        purpose: string;
        type?: string;
      }>;
      personality: Array<{
        category: string;
        question: string;
        purpose: string;
        basedOn?: string;
      }>;
      followUp: Array<{
        type: string;
        question: string;
        purpose: string;
      }>;
    };
    generatedAt: string;
    modelUsed: string;
  };
}

const ApplicantDetail: React.FC = () => {
  const { applicantId } = useParams<{ applicantId: string }>();
  const navigate = useNavigate();
  const [applicant, setApplicant] = useState<ApplicantDetail | null>(null);
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

      const data = await response.json();

      if (data.success) {
        console.log("지원자 데이터:", data.data);
        console.log("기술 테스트 데이터:", data.data.technicalTest);
        if (data.data.technicalTest) {
          console.log(
            "totalQuestions:",
            data.data.technicalTest.totalQuestions
          );
          console.log(
            "results.length:",
            data.data.technicalTest.results?.length
          );
          console.log("maxScore:", data.data.technicalTest.maxScore);
          console.log("questionTimes:", data.data.technicalTest.questionTimes);
        }
        setApplicant(data.data);
      } else {
        setError(data.message || "지원자 정보를 불러오는데 실패했습니다.");
      }
    } catch (error) {
      console.error("지원자 상세 정보 조회 오류:", error);
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

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case "high":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRecommendationText = (recommendation: string) => {
    switch (recommendation) {
      case "high":
        return "적극 추천";
      case "medium":
        return "보통";
      case "low":
        return "신중 검토";
      default:
        return "미평가";
    }
  };

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
                className="text-indigo-600 hover:text-indigo-800"
              >
                ← 지원자 목록
              </button>
              <h1 className="text-3xl font-bold text-gray-900">
                {applicant.name}
              </h1>
              {applicant.aiReport && (
                <span
                  className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getRecommendationColor(
                    applicant.aiReport.report.overallAssessment.recommendation
                  )}`}
                >
                  {getRecommendationText(
                    applicant.aiReport.report.overallAssessment.recommendation
                  )}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* 기본 정보 */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-6 py-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                기본 정보
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <dt className="text-sm font-medium text-gray-500">이름</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {applicant.name}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">이메일</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {applicant.email}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">연락처</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {applicant.phone}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">등록일</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {formatDate(applicant.createdAt)}
                  </dd>
                </div>
                {applicant.technicalTest && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      기술 테스트 완료
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formatDate(applicant.technicalTest.submittedAt)}
                    </dd>
                  </div>
                )}
                {applicant.personalityTest && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      인성 테스트 완료
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formatDate(applicant.personalityTest.submittedAt)}
                    </dd>
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
              {/* 점수 개요 탭 */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 기술 테스트 점수 */}
                    {applicant.technicalTest && (
                      <div className="bg-blue-50 p-6 rounded-lg">
                        <h3 className="text-lg font-medium text-blue-900 mb-4">
                          기술 테스트
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-blue-700">점수</span>
                            <span className="font-semibold text-blue-900">
                              {applicant.technicalTest.score} / 30
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-700">정답률</span>
                            <span className="font-semibold text-blue-900">
                              {(
                                (applicant.technicalTest.score / 30) *
                                100
                              ).toFixed(1)}
                              %
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-700">소요시간</span>
                            <span className="font-semibold text-blue-900">
                              {formatTime(applicant.technicalTest.totalTime)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 인성 테스트 점수 */}
                    {applicant.personalityTest && (
                      <div className="bg-green-50 p-6 rounded-lg">
                        <h3 className="text-lg font-medium text-green-900 mb-4">
                          인성 테스트
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-green-700">총점</span>
                            <span className="font-semibold text-green-900">
                              {applicant.personalityTest.scores.total}점
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-green-700">협업</span>
                            <span className="font-semibold text-green-900">
                              {applicant.personalityTest.scores.cooperate.score}
                              점 (
                              {applicant.personalityTest.scores.cooperate.level}
                              )
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-green-700">책임감</span>
                            <span className="font-semibold text-green-900">
                              {
                                applicant.personalityTest.scores.responsibility
                                  .score
                              }
                              점 (
                              {
                                applicant.personalityTest.scores.responsibility
                                  .level
                              }
                              )
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-green-700">리더십</span>
                            <span className="font-semibold text-green-900">
                              {
                                applicant.personalityTest.scores.leadership
                                  .score
                              }
                              점 (
                              {
                                applicant.personalityTest.scores.leadership
                                  .level
                              }
                              )
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-green-700">소요시간</span>
                            <span className="font-semibold text-green-900">
                              {formatTime(applicant.personalityTest.totalTime)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 점수 분석 차트 탭 */}
              {activeTab === "charts" && (
                <div className="space-y-8">
                  {/* 인성 레이더 차트 */}
                  {applicant.personalityTest && (
                    <div className="bg-green-50 p-6 rounded-lg">
                      <h3 className="text-lg font-medium text-green-900 mb-6">
                        인성 분석 차트
                      </h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                        <div className="space-y-4">
                          {getPersonalityChartData().map((item, index) => (
                            <div
                              key={index}
                              className="bg-white p-4 rounded-lg border border-green-200"
                            >
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-medium text-green-900">
                                  {item.subject}
                                </span>
                                <span className="text-sm text-green-700">
                                  {item.level}
                                </span>
                              </div>
                              <div className="w-full bg-green-200 rounded-full h-2">
                                <div
                                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${item.score}%` }}
                                ></div>
                              </div>
                              <div className="text-right text-sm text-green-600 mt-1">
                                {Math.round(item.score)}%
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 기술 테스트 분석 */}
                  {applicant.technicalTest && (
                    <div className="bg-blue-50 p-6 rounded-lg">
                      <h3 className="text-lg font-medium text-blue-900 mb-6">
                        기술 테스트 분석
                      </h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* 정답/오답 분포 */}
                        <div>
                          <h4 className="font-medium text-blue-900 mb-4">
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
                                  {getScoreDistributionData().map(
                                    (entry, index) => (
                                      <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color}
                                      />
                                    )
                                  )}
                                </Pie>
                                <Tooltip />
                                <Legend />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* 문제별 소요시간 */}
                        <div>
                          <h4 className="font-medium text-blue-900 mb-4">
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
                                      fill={
                                        entry.correct ? "#10B981" : "#EF4444"
                                      }
                                    />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>

                      {/* 통계 요약 */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        <div className="bg-white p-4 rounded-lg border border-blue-200">
                          <div className="text-2xl font-bold text-blue-900">
                            {applicant.technicalTest.score}
                          </div>
                          <div className="text-sm text-blue-700">총 점수</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-blue-200">
                          <div className="text-2xl font-bold text-blue-900">
                            {(
                              (applicant.technicalTest.score / 30) *
                              100
                            ).toFixed(1)}
                            %
                          </div>
                          <div className="text-sm text-blue-700">정답률</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-blue-200">
                          <div className="text-2xl font-bold text-blue-900">
                            {formatTime(applicant.technicalTest.totalTime)}
                          </div>
                          <div className="text-sm text-blue-700">
                            총 소요시간
                          </div>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-blue-200">
                          <div className="text-2xl font-bold text-blue-900">
                            {(
                              applicant.technicalTest.totalTime /
                              applicant.technicalTest.results.length
                            ).toFixed(1)}
                            초
                          </div>
                          <div className="text-sm text-blue-700">
                            평균 문제당 시간
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 기술 테스트 탭 */}
              {activeTab === "technical" && applicant.technicalTest && (
                <div className="space-y-6">
                  {/* 통계 요약 */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <dt className="text-sm font-medium text-gray-600">
                          총 문제
                        </dt>
                        <dd className="mt-1 text-2xl font-semibold text-gray-900">
                          30문제
                        </dd>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <dt className="text-sm font-medium text-green-600">
                          정답 수
                        </dt>
                        <dd className="mt-1 text-2xl font-semibold text-green-600">
                          {
                            applicant.technicalTest.results.filter(
                              (r) => r.isCorrect
                            ).length
                          }
                          문제
                        </dd>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg">
                        <dt className="text-sm font-medium text-red-600">
                          오답 수
                        </dt>
                        <dd className="mt-1 text-2xl font-semibold text-red-600">
                          {
                            applicant.technicalTest.results.filter(
                              (r) => !r.isCorrect
                            ).length
                          }
                          문제
                        </dd>
                      </div>
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <dt className="text-sm font-medium text-yellow-600">
                          미응답 수
                        </dt>
                        <dd className="mt-1 text-2xl font-semibold text-yellow-600">
                          {30 - applicant.technicalTest.results.length}문제
                        </dd>
                      </div>
                    </div>
                  </div>

                  {/* 전체 문제 목록 (아코디언) */}
                  <div className="space-y-2">
                    {getAllQuestions().map((questionItem) => {
                      const isExpanded = expandedQuestions.has(
                        questionItem.index
                      );
                      const isSubmitted = questionItem.status === "submitted";
                      const isCorrect = isSubmitted
                        ? questionItem.result?.isCorrect
                        : false;

                      // 아코디언 헤더 배경색
                      let headerBgColor = "bg-gray-50 border-gray-200";
                      if (isSubmitted) {
                        headerBgColor = isCorrect
                          ? "bg-green-50 border-green-200"
                          : "bg-red-50 border-red-200";
                      } else {
                        headerBgColor = "bg-yellow-50 border-yellow-200";
                      }

                      return (
                        <div
                          key={questionItem.index}
                          className={`border rounded-lg ${headerBgColor}`}
                        >
                          {/* 아코디언 헤더 */}
                          <button
                            onClick={() => toggleQuestion(questionItem.index)}
                            className="w-full px-6 py-4 text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset"
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex-1 mr-4">
                                <div className="flex items-center space-x-3 mb-2">
                                  <span className="text-lg font-semibold text-gray-900">
                                    문제 {questionItem.index}
                                  </span>

                                  {/* 카테고리 배지 */}
                                  {questionItem.questionInfo?.category && (
                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                      {questionItem.questionInfo.category}
                                    </span>
                                  )}

                                  {/* 상태 배지 */}
                                  <span
                                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                      !isSubmitted
                                        ? "bg-yellow-100 text-yellow-800"
                                        : isCorrect
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {!isSubmitted
                                      ? "미제출"
                                      : isCorrect
                                      ? "정답"
                                      : "오답"}
                                  </span>
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
                                  <div className="text-sm text-gray-500">
                                    소요시간:{" "}
                                    <span className="font-medium">
                                      {questionItem.result?.timeSpent}초
                                    </span>
                                  </div>
                                )}

                                {/* 펼치기/접기 아이콘 */}
                                <svg
                                  className={`w-5 h-5 text-gray-500 transform transition-transform ${
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
                                                  questionItem.result
                                                    ?.userAnswer === option;
                                                const isCorrectChoice =
                                                  questionItem.questionInfo
                                                    ?.correctAnswer === option;

                                                let optionClass =
                                                  "p-3 rounded border ";
                                                if (isSubmitted) {
                                                  if (
                                                    isUserChoice &&
                                                    isCorrectChoice
                                                  ) {
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
                                          questionItem.questionInfo
                                            ?.correctAnswer
                                        )
                                          ? questionItem.questionInfo?.correctAnswer?.join?.(
                                              ", "
                                            )
                                          : questionItem.questionInfo
                                              ?.correctAnswer}
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
              )}

              {/* 인성 테스트 탭 */}
              {activeTab === "personality" && applicant.personalityTest && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-blue-50 p-6 rounded-lg">
                      <h3 className="text-lg font-medium text-blue-900 mb-2">
                        협업
                      </h3>
                      <div className="text-3xl font-bold text-blue-900">
                        {applicant.personalityTest.scores.cooperate.score}점
                      </div>
                      <div className="text-sm text-blue-700 mt-1">
                        {applicant.personalityTest.scores.cooperate.level}
                      </div>
                    </div>
                    <div className="bg-green-50 p-6 rounded-lg">
                      <h3 className="text-lg font-medium text-green-900 mb-2">
                        책임감
                      </h3>
                      <div className="text-3xl font-bold text-green-900">
                        {applicant.personalityTest.scores.responsibility.score}
                        점
                      </div>
                      <div className="text-sm text-green-700 mt-1">
                        {applicant.personalityTest.scores.responsibility.level}
                      </div>
                    </div>
                    <div className="bg-purple-50 p-6 rounded-lg">
                      <h3 className="text-lg font-medium text-purple-900 mb-2">
                        리더십
                      </h3>
                      <div className="text-3xl font-bold text-purple-900">
                        {applicant.personalityTest.scores.leadership.score}점
                      </div>
                      <div className="text-sm text-purple-700 mt-1">
                        {applicant.personalityTest.scores.leadership.level}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* AI 리포트 탭 */}
              {activeTab === "ai-report" && applicant.aiReport && (
                <div className="space-y-6">
                  {/* 전체 평가 */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      전체 평가
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          주요 강점
                        </h4>
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                          {applicant.aiReport.report.overallAssessment.mainStrengths.map(
                            (strength, index) => (
                              <li key={index}>{strength}</li>
                            )
                          )}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          개선 영역
                        </h4>
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                          {applicant.aiReport.report.overallAssessment.improvementAreas.map(
                            (area, index) => (
                              <li key={index}>{area}</li>
                            )
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* 기술 분석 */}
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium text-blue-900 mb-4">
                      기술 역량 분석
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-blue-900 mb-2">
                          전체 수준
                        </h4>
                        <p className="text-sm text-blue-800">
                          {
                            applicant.aiReport.report.technicalAnalysis
                              .overallLevel
                          }
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-blue-900 mb-2">
                          시간 효율성
                        </h4>
                        <p className="text-sm text-blue-800">
                          {
                            applicant.aiReport.report.technicalAnalysis
                              .timeEfficiency
                          }
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-blue-900 mb-2">강점</h4>
                        <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
                          {applicant.aiReport.report.technicalAnalysis.strengths.map(
                            (strength, index) => (
                              <li key={index}>{strength}</li>
                            )
                          )}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-blue-900 mb-2">약점</h4>
                        <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
                          {applicant.aiReport.report.technicalAnalysis.weaknesses.map(
                            (weakness, index) => (
                              <li key={index}>{weakness}</li>
                            )
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* 인성 분석 */}
                  <div className="bg-green-50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium text-green-900 mb-4">
                      인성 분석
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-green-900 mb-2">
                          협업
                        </h4>
                        <p className="text-sm text-green-800">
                          {
                            applicant.aiReport.report.personalityAnalysis
                              .cooperation
                          }
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-green-900 mb-2">
                          책임감
                        </h4>
                        <p className="text-sm text-green-800">
                          {
                            applicant.aiReport.report.personalityAnalysis
                              .responsibility
                          }
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-green-900 mb-2">
                          리더십
                        </h4>
                        <p className="text-sm text-green-800">
                          {
                            applicant.aiReport.report.personalityAnalysis
                              .leadership
                          }
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-green-900 mb-2">
                          조직 적합성
                        </h4>
                        <p className="text-sm text-green-800">
                          {
                            applicant.aiReport.report.personalityAnalysis
                              .organizationFit
                          }
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <h4 className="font-medium text-green-900 mb-2">
                          성장 잠재력
                        </h4>
                        <p className="text-sm text-green-800">
                          {
                            applicant.aiReport.report.personalityAnalysis
                              .growthPotential
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 면접 질문 탭 */}
              {activeTab === "interview" && applicant.aiReport && (
                <div className="space-y-6">
                  {/* 기술 질문 */}
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium text-blue-900 mb-4">
                      기술 면접 질문
                    </h3>
                    <div className="space-y-4">
                      {applicant.aiReport.interviewQuestions.technical.map(
                        (question, index) => (
                          <div
                            key={index}
                            className="bg-white p-4 rounded-lg border border-blue-200"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
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
                            <p className="text-sm text-gray-600">
                              {question.purpose}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* 인성 질문 */}
                  <div className="bg-green-50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium text-green-900 mb-4">
                      인성 면접 질문
                    </h3>
                    <div className="space-y-4">
                      {applicant.aiReport.interviewQuestions.personality.map(
                        (question, index) => (
                          <div
                            key={index}
                            className="bg-white p-4 rounded-lg border border-green-200"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-800">
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
                            <p className="text-sm text-gray-600">
                              {question.purpose}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* 후속 질문 */}
                  <div className="bg-purple-50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium text-purple-900 mb-4">
                      후속 질문
                    </h3>
                    <div className="space-y-4">
                      {applicant.aiReport.interviewQuestions.followUp.map(
                        (question, index) => (
                          <div
                            key={index}
                            className="bg-white p-4 rounded-lg border border-purple-200"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded bg-purple-100 text-purple-800">
                                {question.type}
                              </span>
                            </div>
                            <h4 className="font-medium text-gray-900 mb-2">
                              {question.question}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {question.purpose}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ApplicantDetail;
