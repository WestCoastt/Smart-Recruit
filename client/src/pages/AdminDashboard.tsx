import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface AdminInfo {
  id: string;
  username: string;
  email?: string;
}

const AdminDashboard: React.FC = () => {
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // 토큰 확인 및 관리자 정보 로드
    const token = localStorage.getItem("adminToken");
    const storedAdminInfo = localStorage.getItem("adminInfo");

    if (!token || !storedAdminInfo) {
      // 토큰이 없으면 로그인 페이지로 리디렉션
      navigate("/admin/login");
      return;
    }

    try {
      const parsedAdminInfo = JSON.parse(storedAdminInfo);
      setAdminInfo(parsedAdminInfo);
      // 로그인 후 바로 지원자 관리 페이지로 이동
      navigate("/admin/applicants");
    } catch (error) {
      handleLogout();
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminInfo");
    navigate("/admin/login");
  };

  if (!adminInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">
                관리자 대시보드
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                환영합니다,{" "}
                <span className="font-medium">{adminInfo.username}</span>님
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                지원자 관리 시스템
              </h2>
              <p className="text-gray-600 mb-8">
                지원자 목록과 상세 리포트를 확인할 수 있습니다.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                  onClick={() => navigate("/admin/applicants")}
                  className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
                >
                  <div className="text-left">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      지원자 관리
                    </h3>
                    <p className="text-gray-600">
                      지원자 목록 조회 및 평가 결과 확인
                    </p>
                  </div>
                </button>

                <button className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                  <div className="text-left">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      통계 분석
                    </h3>
                    <p className="text-gray-600">
                      지원자 평가 통계 및 분석 리포트
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
