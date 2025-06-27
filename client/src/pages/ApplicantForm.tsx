import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import type { ApplicantInfo } from "../types";
import { submitApplicantInfo } from "../utils/api";

// 유효성 검증 스키마
const schema = yup.object({
  name: yup
    .string()
    .required("이름을 입력해주세요")
    .min(2, "이름은 최소 2글자 이상이어야 합니다")
    .max(50, "이름은 50글자를 초과할 수 없습니다"),
  email: yup
    .string()
    .required("이메일을 입력해주세요")
    .email("올바른 이메일 형식을 입력해주세요"),
  phone: yup
    .string()
    .required("연락처를 입력해주세요")
    .matches(
      /^01[016789]\d{8}$/,
      "올바른 휴대폰 번호를 입력해주세요 (예: 01012345678)"
    ),
});

interface ApplicantFormProps {
  onSubmit?: (data: ApplicantInfo & { applicantId: string }) => void;
}

const ApplicantForm: React.FC<ApplicantFormProps> = ({ onSubmit }) => {
  const [submitError, setSubmitError] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ApplicantInfo>({
    resolver: yupResolver(schema),
  });

  const handleFormSubmit = async (data: ApplicantInfo) => {
    try {
      setSubmitError("");

      // 서버로 데이터 전송
      const response = await submitApplicantInfo(data);

      if (response.success) {
        // 성공 시 onSubmit 콜백 호출 (applicantId 포함) - 즉시 페이지 이동
        if (
          onSubmit &&
          response.data &&
          typeof response.data === "object" &&
          response.data !== null &&
          "applicantId" in response.data
        ) {
          onSubmit({
            ...data,
            applicantId: (response.data as { applicantId: string }).applicantId,
          });
        }
      }
    } catch (error: unknown) {
      console.error("지원자 정보 제출 실패:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "서버 오류가 발생했습니다. 다시 시도해주세요.";
      setSubmitError(errorMessage);
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-8"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md md:max-w-lg lg:max-w-xl p-6 md:p-8">
        {/* 헤더 */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
            인적성 평가 시스템
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            지원자 정보를 입력해주세요
          </p>
        </div>

        {/* 폼 */}
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-5 md:space-y-6"
        >
          {/* 이름 입력 */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm md:text-base font-medium text-gray-700 mb-2"
            >
              이름 <span className="text-red-500">*</span>
            </label>
            <input
              {...register("name")}
              type="text"
              id="name"
              placeholder="홍길동"
              className={`w-full px-4 py-3 md:py-4 text-sm md:text-base border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.name
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* 이메일 입력 */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm md:text-base font-medium text-gray-700 mb-2"
            >
              이메일 <span className="text-red-500">*</span>
            </label>
            <input
              {...register("email")}
              type="email"
              id="email"
              placeholder="example@email.com"
              className={`w-full px-4 py-3 md:py-4 text-sm md:text-base border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.email
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* 연락처 입력 */}
          <div>
            <label
              htmlFor="phone"
              className="block text-sm md:text-base font-medium text-gray-700 mb-2"
            >
              연락처 <span className="text-red-500">*</span>
            </label>
            <input
              {...register("phone")}
              type="tel"
              id="phone"
              placeholder="01012345678"
              className={`w-full px-4 py-3 md:py-4 text-sm md:text-base border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.phone
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* 오류 메시지 표시 */}
          {submitError && (
            <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 border border-red-300 rounded-lg">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                {submitError}
              </div>
            </div>
          )}

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              backgroundColor: isSubmitting ? "#9CA3AF" : "#2563EB",
              color: isSubmitting ? "#6B7280" : "#FFFFFF",
            }}
            className={`w-full py-3 md:py-4 px-4 rounded-lg font-semibold text-base md:text-lg transition-all duration-200 shadow-lg hover:shadow-xl focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50 ${
              isSubmitting ? "cursor-not-allowed" : "hover:opacity-90"
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                처리 중...
              </span>
            ) : (
              "다음 단계로"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ApplicantForm;
