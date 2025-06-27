import React from "react";

const EvaluationComplete: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
      <div className="max-w-lg w-full mx-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 text-center">
          {/* 완료 아이콘 애니메이션 */}
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100 mb-6 animate-pulse">
            <svg
              className="h-12 w-12 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          {/* 제목 */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🎉 평가 완료!
          </h1>

          {/* 메시지 */}
          <div className="text-gray-600 mb-8 space-y-4">
            <p className="text-lg font-medium text-green-700">
              모든 평가가 성공적으로 완료되었습니다.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg text-sm">
              <p className="font-semibold text-gray-800 mb-2">
                완료된 평가 항목:
              </p>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span>✅ 기술 역량 테스트</span>
                  <span className="text-green-600 font-medium">완료</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>✅ 인성 검사 (협업/책임감/리더십)</span>
                  <span className="text-green-600 font-medium">완료</span>
                </div>
              </div>
            </div>
            <p className="text-gray-600">
              인사팀에서 기재하신 연락처로 다음 전형 절차를 안내드립니다.
            </p>
          </div>

          {/* 다음 단계 안내 */}
          <div className="bg-blue-50 p-6 rounded-lg mb-6 border-l-4 border-blue-500">
            <div className="text-left">
              <h3 className="font-bold text-blue-900 mb-3 flex items-center">
                <svg
                  className="h-5 w-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                다음 단계 안내
              </h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>
                    <strong>평가 결과 검토:</strong> 3-5일 내 결과 분석 완료
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>
                    <strong>결과 통보:</strong> 이메일/문자로 개별 연락
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>
                    <strong>면접 일정:</strong> 합격 시 별도 안내 예정
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* 문의 안내 */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-gray-600">
              <strong>문의사항이 있으시면</strong>
              <br />
              인사팀으로 연락 부탁드립니다.
            </p>
          </div>

          {/* 감사 메시지 */}
          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border">
            <p className="text-lg font-medium text-gray-800">
              🙏 지원해 주셔서 감사합니다
            </p>
          </div>

          {/* 평가 완료 시간 */}
          <div className="mt-4 text-xs text-gray-400">
            평가 완료 시간: {new Date().toLocaleString("ko-KR")}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvaluationComplete;
