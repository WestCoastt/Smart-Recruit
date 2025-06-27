import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { validateApplicantId } from "../utils/api";

const PersonalityInstructions: React.FC = () => {
  const { applicantId } = useParams<{ applicantId: string }>();
  const navigate = useNavigate();
  const [isAgreed, setIsAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 지원자 ID 검증
  useEffect(() => {
    const checkApplicant = async () => {
      if (!applicantId || !validateApplicantId(applicantId)) {
        navigate("/", { replace: true });
        return;
      }
      setIsLoading(false);
    };

    checkApplicant();
  }, [applicantId, navigate]);

  // 인성 테스트 시작
  const handleStartPersonalityTest = () => {
    if (!isAgreed) {
      alert("안내사항에 동의해주시기 바랍니다.");
      return;
    }

    // PersonalityTest 컴포넌트로 이동
    navigate(`/personality-test/${applicantId}`, { replace: true });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900 text-center">
            인성 테스트 안내사항
          </h1>
          <p className="text-gray-600 text-center mt-2">
            테스트 시작 전 아래 안내사항을 반드시 확인해주세요
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* 테스트 개요 */}
          <div className="mb-8 p-6 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
            <h2 className="text-xl font-bold text-blue-800 mb-4 flex items-center">
              📋 인성 테스트 개요
            </h2>
            <div className="space-y-3 text-blue-700">
              <div className="flex items-center space-x-2">
                <span className="font-semibold">• 문항 수:</span>
                <span>총 120문항</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold">• 제한 시간:</span>
                <span className="text-red-600 font-medium">15분</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold">• 평가 영역:</span>
                <span>협업 능력, 책임감, 리더십</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold">• 응답 방식:</span>
                <span>5점 척도 (전혀 그렇지 않다 ~ 매우 그렇다)</span>
              </div>
            </div>
          </div>

          {/* 주의사항 */}
          <div className="mb-8 p-6 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg">
            <h2 className="text-xl font-bold text-yellow-800 mb-4 flex items-center">
              ⚠️ 주의사항
            </h2>
            <div className="space-y-3 text-yellow-700">
              <div className="flex items-start space-x-2">
                <span className="font-semibold mt-1">•</span>
                <span>각 문항을 신중히 읽고 솔직하게 답변해주세요</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="font-semibold mt-1">•</span>
                <span>
                  정답이 있는 것이 아니므로 본인의 생각을 솔직히 표현해주세요
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="font-semibold mt-1">•</span>
                <span>
                  시간에 쫓기지 말고 차분히 답변해주세요 (평균 1문항당 7-8초)
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="font-semibold mt-1">•</span>
                <span>모든 문항에 빠짐없이 답변해주세요</span>
              </div>
            </div>
          </div>

          {/* 권장 환경 */}
          <div className="mb-8 p-6 bg-gray-50 border-l-4 border-gray-500 rounded-r-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              💻 권장 환경
            </h2>
            <div className="space-y-3 text-gray-700">
              <div className="flex items-center space-x-2">
                <span className="font-semibold">• 브라우저:</span>
                <span>Chrome, Firefox, Safari 최신 버전</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold">• 네트워크:</span>
                <span>안정적인 인터넷 연결 환경</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold">• 화면:</span>
                <span>1024x768 이상 해상도 권장</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold">• 환경:</span>
                <span>조용하고 집중할 수 있는 공간</span>
              </div>
            </div>
          </div>

          {/* 동의 체크박스 */}
          <div className="mb-8 p-6 bg-indigo-50 border border-indigo-200 rounded-lg">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isAgreed}
                onChange={(e) => setIsAgreed(e.target.checked)}
                className="mt-1 h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="text-gray-700 font-medium">
                위 안내사항을 모두 확인하였으며, 솔직하게 답변할 것을
                동의합니다.
                <br />
                <span className="text-indigo-600">
                  테스트는 한 번만 응시 가능하며, 중도 포기 시 재응시할 수
                  없음을 이해합니다.
                </span>
              </span>
            </label>
          </div>

          {/* 시작 버튼 */}
          <div className="text-center">
            <button
              onClick={handleStartPersonalityTest}
              disabled={!isAgreed}
              className={`px-8 py-4 text-lg font-bold rounded-lg transition-all duration-200 ${
                isAgreed
                  ? "bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105 shadow-lg"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {isAgreed ? "🚀 인성 테스트 시작하기" : "안내사항에 동의해주세요"}
            </button>

            {isAgreed && (
              <p className="text-sm text-gray-500 mt-4">
                버튼을 클릭하면 즉시 테스트가 시작됩니다
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalityInstructions;
