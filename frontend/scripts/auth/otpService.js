import { API_BASE_URL } from "../config.js";

export async function verifyOtp({ userId, otp, purpose }) {
  console.log("Sending to Backend:", { userId, otp, purpose });

  const res = await fetch(`${API_BASE_URL}/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, otp, purpose })
  });

  const data = await res.json();
  return { res, data };
}