async function runTests() {
  console.log("🚀 STARTING PHASE 2: LIVE API PENETRATION TESTING\n");
  const BASE_URL = 'http://localhost:5000/api';

  try {
    // TEST 1: Login as Intern
    console.log("--- TEST 1: INTERN LOGIN ---");
    let res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'intern1@query.in', password: 'Intern1@1234' })
    });
    let data = await res.json();
    
    if (!data.success) {
      console.log("❌ Intern Login Failed. Ensure the server is running and the database is seeded.");
      console.log(data);
      return;
    }
    
    const internToken = data.token;
    console.log(`✅ Intern Login Success! Retrieved JWT Token (Role: ${data.user.role})`);

    // TEST 2: RBAC Role Spoofing (Intern hitting Admin route)
    console.log("\n--- TEST 2: RBAC ROLE SPOOFING ---");
    console.log("Attempting to access Admin-only route (GET /auth/users) using Intern token...");
    res = await fetch(`${BASE_URL}/auth/users`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${internToken}` }
    });
    data = await res.json();
    
    if (res.status === 403) {
      console.log("✅ SUCCESS: RBAC Middleware correctly blocked the Intern (403 Forbidden).");
    } else {
      console.log(`❌ FAIL: Expected 403, got ${res.status}. Role spoofing might be possible!`);
      console.log(data);
    }

    // TEST 3: Admin Account Creation Exploit (Unprotected Route)
    console.log("\n--- TEST 3: DATA INJECTION & ADMIN TAKEOVER ---");
    console.log("Attempting to hit POST /auth/register to create a rogue Admin account...");
    const rogueEmail = `hacker_${Date.now()}@query.in`;
    res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: rogueEmail, password: 'Hacker!1234', role: 'admin' })
    });
    data = await res.json();

    if (res.status === 201) {
      console.log(`🚨 CRITICAL VULNERABILITY CONFIRMED 🚨`);
      console.log(`The register route is unprotected! I successfully created a rogue Admin account: ${rogueEmail}`);
    } else {
      console.log(`✅ FAIL: The system blocked the rogue admin creation (Status: ${res.status}).`);
      console.log(data);
    }

    console.log("\n🏁 PHASE 2 TESTING COMPLETE.");

  } catch (error) {
    console.error("Test execution failed. Is the backend server running on port 5000?");
    console.error(error.message);
  }
}

runTests();
