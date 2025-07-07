import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useParams,
  useNavigate,
} from "react-router-dom";
import ApplicantForm from "./pages/ApplicantForm";
import Instructions from "./pages/Instructions";
import TechnicalTest from "./pages/TechnicalTest";
import PersonalityInstructions from "./pages/PersonalityInstructions";
import PersonalityTest from "./pages/PersonalityTest";
import EvaluationComplete from "./pages/EvaluationComplete";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import ApplicantList from "./pages/ApplicantList";
import ApplicantDetail from "./pages/ApplicantDetail";
import type { ApplicantInfo, TechnicalTestData } from "./types";
import {
  setStoredApplicantData,
  validateApplicantId,
  getTechnicalTestQuestions,
} from "./utils/api";

// 메인 애플리케이션 컴포넌트
const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<ApplicantFormWrapper />} />
          <Route
            path="/instructions/:applicantId"
            element={<InstructionsWrapper />}
          />
          <Route path="/test/:applicantId" element={<TechnicalTestWrapper />} />
          <Route
            path="/personality-instructions/:applicantId"
            element={<PersonalityInstructionsWrapper />}
          />
          <Route
            path="/personality-test/:applicantId"
            element={<PersonalityTestWrapper />}
          />
          <Route
            path="/evaluation-complete/:applicantId"
            element={<EvaluationComplete />}
          />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/applicants" element={<ApplicantList />} />
          <Route
            path="/admin/applicants/:applicantId"
            element={<ApplicantDetail />}
          />
        </Routes>
      </div>
    </Router>
  );
};

// 지원자 정보 입력 폼 래퍼
const ApplicantFormWrapper: React.FC = () => {
  const navigate = useNavigate();

  const handleApplicantSubmit = (
    data: ApplicantInfo & { applicantId: string }
  ) => {
    // 지원자 정보를 세션 스토리지에 저장
    setStoredApplicantData(data);

    // applicantId를 URL 파라미터로 포함하여 안내사항 페이지로 이동
    navigate(`/instructions/${data.applicantId}`);
  };

  return <ApplicantForm onSubmit={handleApplicantSubmit} />;
};

// 안내사항 페이지 래퍼
const InstructionsWrapper: React.FC = () => {
  const { applicantId } = useParams<{ applicantId: string }>();
  const navigate = useNavigate();

  const handleTestStart = async () => {
    try {
      const response = await getTechnicalTestQuestions();

      if (response.success && response.data) {
        const testData = response.data as TechnicalTestData;
        navigate(`/test/${applicantId}`);
      }
    } catch (error) {
      alert("문제를 가져오는 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  // URL에 applicantId가 없거나 저장된 정보와 일치하지 않으면 메인 페이지로 리다이렉트
  if (!applicantId || !validateApplicantId(applicantId)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            잘못된 접근입니다
          </h1>
          <p className="text-gray-600 mb-4">
            {!applicantId
              ? "지원자 정보를 먼저 입력해주세요."
              : "유효하지 않은 지원자 ID입니다."}
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            처음으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return <Instructions onStart={handleTestStart} />;
};

// 기술 역량 테스트 페이지 래퍼
const TechnicalTestWrapper: React.FC = () => {
  const { applicantId } = useParams<{ applicantId: string }>();

  // URL에 applicantId가 없거나 저장된 정보와 일치하지 않으면 메인 페이지로 리다이렉트
  if (!applicantId || !validateApplicantId(applicantId)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            잘못된 접근입니다
          </h1>
          <p className="text-gray-600 mb-4">
            {!applicantId
              ? "지원자 정보를 먼저 입력해주세요."
              : "유효하지 않은 지원자 ID입니다."}
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            처음으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return <TechnicalTest applicantId={applicantId} />;
};

// 인성 테스트 안내사항 페이지 래퍼
const PersonalityInstructionsWrapper: React.FC = () => {
  const { applicantId } = useParams<{ applicantId: string }>();
  const navigate = useNavigate();

  // URL에 applicantId가 없거나 저장된 정보와 일치하지 않으면 메인 페이지로 리다이렉트
  if (!applicantId || !validateApplicantId(applicantId)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            잘못된 접근입니다
          </h1>
          <p className="text-gray-600 mb-4">
            {!applicantId
              ? "지원자 정보를 먼저 입력해주세요."
              : "유효하지 않은 지원자 ID입니다."}
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            처음으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return <PersonalityInstructions />;
};

// PersonalityTest용 래퍼 컴포넌트
const PersonalityTestWrapper: React.FC = () => {
  const { applicantId } = useParams<{ applicantId: string }>();

  if (!applicantId) {
    return <div>잘못된 접근입니다.</div>;
  }

  return <PersonalityTest applicantId={applicantId} />;
};

export default App;
