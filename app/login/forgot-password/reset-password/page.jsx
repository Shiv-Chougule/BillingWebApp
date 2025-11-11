"use client";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const router = useRouter();

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   const res = await fetch("/api/auth/reset-password", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ email, password }),
  //   });

  //   const data = await res.json();
  //   setMessage(data.message);

  //   if (data.success) {
  //     router.push("/login");
  //   }
  // };

  const resetPassword = async (email, newPassword) => {
    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, newPassword }),
    });
  
    const data = await response.json();
    alert(data.message);

    if (data.success) {
           router.push("/login");
   }
  };
  

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white text-black p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold text-center mb-4">Reset Password</h2>
        <form onSubmit={resetPassword} className="flex flex-col gap-4">
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border p-2 rounded w-full"
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border p-2 rounded w-full"
          />
          <button type="submit" className="bg-blue-600 text-white p-2 rounded">
            Reset Password
          </button>
        </form>
        {message && <p className="mt-2 text-center text-gray-700">{message}</p>}
      </div>
    </div>
  );
};

export default ResetPassword;
