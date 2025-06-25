import React, { useState } from "react";
import ApplicantForm from "./pages/ApplicantForm";
import type { ApplicantInfo } from "./types";

function App() {
  const [applicantInfo, setApplicantInfo] = useState<ApplicantInfo | null>(
    null
  );

  const handleApplicantSubmit = (data: ApplicantInfo) => {
    console.log("지원자 정보:", data);
    setApplicantInfo(data);
    // TODO: 다음 단계로 이동 (안내사항 페이지)
    alert(`안녕하세요 ${data.name}님! 다음 단계로 이동합니다.`);
  };

  return (
    <div className="App">
      {!applicantInfo ? (
        <ApplicantForm onSubmit={handleApplicantSubmit} />
      ) : (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">등록 완료</h2>
            <p>지원자: {applicantInfo.name}</p>
            <p>이메일: {applicantInfo.email}</p>
            <p>연락처: {applicantInfo.phone}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
