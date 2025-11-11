"use client";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const VerifyOTP = () => {
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const router = useRouter();

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   const res = await fetch("/api/auth/verify-otp", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ email, otp }),
  //   });

  //   const data = await res.json();
  //   setMessage(data.message);

  //   if (data.success) {
  //     router.push(`/login/forgot-password/reset-password?email=${email}`);
  //   }
  // };

  const verifyOtp = async (email, otp) => {
    const response = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });
  
    const data = await response.json();
    alert(data.message);

    if (data.success) {
         router.push(`/login/forgot-password/reset-password?email=${email}`);
    }
  };
  

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white text-black p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold text-center mb-4">Verify OTP</h2>
        <form onSubmit={verifyOtp} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            className="border p-2 rounded w-full"
          />
          <button type="submit" className="bg-blue-600 text-white p-2 rounded">
            Verify OTP
          </button>
        </form>
        {message && <p className="mt-2 text-center text-gray-700">{message}</p>}
      </div>
    </div>
  );
};

export default VerifyOTP;
