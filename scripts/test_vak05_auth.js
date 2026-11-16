/**
 * VAK-05 Automated Verification Test Script
 * Verifies:
 * 1. WhatsApp Send OTP returns generated OTP
 * 2. WhatsApp Verify OTP succeeds with both generated OTP and master demo code (123456)
 * 3. Google Sign-in creates and provisions citizen / advocate sessions
 * 4. Error handling when invalid parameters are passed
 */

const http = require("http");

function post(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request(
      {
        hostname: "localhost",
        port: 5000,
        path,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(data),
        },
      },
      (res) => {
        let resData = "";
        res.on("data", (chunk) => (resData += chunk));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(resData) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: resData });
          }
        });
      }
    );
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log("=== VAK-05 AUTHENTICATION RESILIENCE TESTS ===");
  let passed = 0;
  let total = 0;

  function assert(cond, name) {
    total++;
    if (cond) {
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${name}`);
    }
  }

  // Test 1: Send WhatsApp OTP
  console.log("\n[Test Suite 1: WhatsApp OTP Send & Verify]");
  const testPhone = "+919876543210";
  const sendRes = await post("/api/auth/send-otp", { phone: testPhone, role: "client" });
  assert(sendRes.status === 200 && sendRes.data.success === true, "Send OTP returns 200 OK with success=true");
  assert(typeof sendRes.data.otp === "string" && sendRes.data.otp.length === 6, "Send OTP returns 6-digit OTP code");

  const generatedOtp = sendRes.data.otp;

  // Test 2: Verify WhatsApp OTP with generated OTP
  const verifyRes = await post("/api/auth/verify-otp", { phone: testPhone, otp: generatedOtp, role: "client" });
  assert(verifyRes.status === 200 && verifyRes.data.success === true, "Verify OTP succeeds with generated OTP");
  assert(verifyRes.data.token && verifyRes.data.user.email.includes("9876543210"), "Verify OTP returns JWT token and user profile");

  // Test 3: Verify WhatsApp OTP with master demo fallback code 123456
  const demoPhone = "+919876599999";
  const verifyDemoRes = await post("/api/auth/verify-otp", { phone: demoPhone, otp: "123456", role: "advocate" });
  assert(verifyDemoRes.status === 200 && verifyDemoRes.data.success === true, "Verify OTP succeeds with demo fallback code 123456");
  assert(verifyDemoRes.data.user.role === "advocate", "Verify OTP provisions advocate role properly");

  // Test 4: Google Sign-in for Citizen
  console.log("\n[Test Suite 2: Google Authentication]");
  const googleCitizenRes = await post("/api/auth/google", {
    email: "priya.nair.test@gmail.com",
    name: "Priya Nair",
    role: "client",
  });
  assert(googleCitizenRes.status === 200 && googleCitizenRes.data.success === true, "Google Sign-In for citizen succeeds");
  assert(googleCitizenRes.data.user.role === "client" && googleCitizenRes.data.user.verifyMethod === "google", "Google user has client role and google verifyMethod");

  // Test 5: Google Sign-in for Advocate
  const googleAdvRes = await post("/api/auth/google", {
    email: "adv.suresh.menon@gmail.com",
    name: "Adv. Suresh Menon",
    role: "advocate",
  });
  assert(googleAdvRes.status === 200 && googleAdvRes.data.success === true, "Google Sign-In for advocate succeeds");
  assert(googleAdvRes.data.user.role === "advocate", "Google user has advocate role");

  // Test 6: Validation errors
  console.log("\n[Test Suite 3: Validation & Error Handling]");
  const invalidOtpRes = await post("/api/auth/verify-otp", { phone: testPhone, otp: "000000" });
  assert(invalidOtpRes.status === 400 && invalidOtpRes.data.success === false, "Invalid OTP correctly rejected with 400 and clear error");

  const missingEmailRes = await post("/api/auth/google", { name: "Nameless" });
  assert(missingEmailRes.status === 400 && missingEmailRes.data.success === false, "Google auth without email rejected with 400");

  console.log(`\nResults: ${passed} / ${total} passed.`);
  if (passed === total) {
    console.log("🎉 ALL VAK-05 TESTS PASSED PERFECTLY!");
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
