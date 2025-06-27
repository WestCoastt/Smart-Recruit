import React from "react";

interface InstructionsProps {
  onStart: () => void;
}

const Instructions: React.FC<InstructionsProps> = ({ onStart }) => {
  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-8"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl lg:max-w-3xl p-6 md:p-8">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            기술 역량 테스트 안내
          </h1>
          <p className="text-lg md:text-xl text-gray-600">
            테스트 시작 전 반드시 아래 내용을 숙지해 주세요
          </p>
        </div>

        {/* 안내사항 카드들 */}
        <div className="space-y-6 mb-8">
          {/* 테스트 개요 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center mb-3">
              <svg
                className="w-6 h-6 text-blue-600 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h2 className="text-xl font-semibold text-blue-900">
                테스트 개요
              </h2>
            </div>
            <div className="text-blue-800 space-y-2">
              <p>
                <strong>문제 수:</strong> 30문제 (객관식 및 주관식)
              </p>
              <p>
                <strong>제한 시간:</strong> 30분
              </p>
              <p>
                <strong>주제:</strong> Java, 데이터베이스, 운영체제, 클라우드,
                보안, 네트워크 기초
              </p>
            </div>
          </div>

          {/* 주의사항 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-center mb-3">
              <svg
                className="w-6 h-6 text-yellow-600 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <h2 className="text-xl font-semibold text-yellow-900">
                주의사항
              </h2>
            </div>
            <div className="text-yellow-800 space-y-2">
              <p>• 테스트가 시작되면 30분 동안 진행됩니다</p>
              <p>
                • 문제는 순서대로 풀 필요가 없으며, 이전/다음 버튼으로 이동
                가능합니다
              </p>
              <p>• 모든 문제를 푼 후 반드시 제출 버튼을 눌러주세요</p>
              <p>• 시간이 종료되면 자동으로 제출됩니다</p>
            </div>
          </div>

          {/* 부정행위 경고 */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center mb-3">
              <svg
                className="w-6 h-6 text-red-600 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h2 className="text-xl font-semibold text-red-900">
                ⚠️ 부정행위 방지 정책
              </h2>
            </div>
            <div className="text-red-800 space-y-3">
              <div className="bg-red-100 p-4 rounded-md">
                <p className="font-semibold mb-2">
                  다음 행위는 부정행위로 간주됩니다:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>테스트 화면에서 다른 탭/창으로 이동</li>
                  <li>브라우저 최소화 또는 다른 애플리케이션으로 전환</li>
                  <li>검색엔진이나 외부 자료 참조</li>
                  <li>다른 사람과의 상의 또는 도움 요청</li>
                </ul>
              </div>
              <div className="bg-red-200 p-4 rounded-md border-l-4 border-red-500">
                <p className="font-bold text-red-900">
                  🚨 화면 이탈 감지 시 평가가 즉시 중단되며, 해당 지원자는
                  부정행위자로 분류되어 평가 결과가 무효 처리됩니다.
                </p>
              </div>
            </div>
          </div>

          {/* 기술적 요구사항 */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <div className="flex items-center mb-3">
              <svg
                className="w-6 h-6 text-gray-600 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <h2 className="text-xl font-semibold text-gray-900">권장 환경</h2>
            </div>
            <div className="text-gray-700 space-y-2">
              <p>• 안정적인 인터넷 연결 필수</p>
              <p>• 최신 버전의 Chrome, Firefox, Safari, Edge 브라우저 사용</p>
              <p>• 조용하고 집중할 수 있는 환경에서 응시</p>
              <p>• 테스트 중 전화나 알림을 받지 않도록 설정</p>
            </div>
          </div>
        </div>

        {/* 동의 체크박스 */}
        <div className="mb-6">
          <label className="flex items-start cursor-pointer">
            <input
              type="checkbox"
              id="agreement"
              className="mt-1 mr-3 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              required
            />
            <span className="text-gray-700 text-sm leading-relaxed">
              위 안내사항을 모두 확인했으며, 부정행위 방지 정책에 동의합니다.
              화면 이탈 시 평가가 중단될 수 있음을 이해했습니다.
            </span>
          </label>
        </div>

        {/* 시작 버튼 */}
        <div className="text-center">
          <button
            onClick={() => {
              const checkbox = document.getElementById(
                "agreement"
              ) as HTMLInputElement;
              if (!checkbox.checked) {
                alert("안내사항에 동의해 주세요.");
                return;
              }
              onStart();
            }}
            style={{
              backgroundColor: "#2563EB",
              color: "#FFFFFF",
            }}
            className="px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:opacity-90 focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50"
          >
            기술 역량 테스트 시작하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default Instructions;
