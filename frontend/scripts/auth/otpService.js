
export async function verifyOtp({ userId, otp, purpose }) {
  console.log("Sending to Backend:", { userId, otp, purpose });

  const res = await fetch("http://127.0.0.1:8000/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, otp, purpose })
  });

  const data = await res.json();
  return { res, data };
}