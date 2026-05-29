async function runWorkflowTests() {
  console.log("🚀 STARTING PHASE 3: WORKFLOW SIMULATION\n");
  const BASE_URL = 'http://localhost:5000/api';

  try {
    // Helper function to login
    async function login(email, password) {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      return data.success ? data : null;
    }

    console.log("--- 1. LOGIN INTERNS ---");
    const author = await login('intern2@query.in', 'Intern2@1234');
    const peer = await login('intern3@query.in', 'Intern3@1234');
    
    if (!author || !peer) {
      console.log("❌ Failed to login test interns. Exiting.");
      return;
    }
    console.log("✅ Logged in Intern 2 (Author) and Intern 3 (Peer).");

    console.log("\n--- 2. TEST 'ASK AI' & ESCALATION ---");
    const askRes = await fetch(`${BASE_URL}/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${author.token}` },
      body: JSON.stringify({ query: 'I have an entirely unique unknown issue 1234567890', intern_id: author.user.id })
    });
    const askData = await askRes.json();
    console.log(`Initial Ask AI status: ${askRes.status}`);

    let queryIdToTest = null;

    if (askRes.status === 200 && askData.resolution === 'pending_feedback') {
        console.log("✅ AI responded. Simulating downvote to force escalation...");
        const downvoteRes = await fetch(`${BASE_URL}/ask`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${author.token}` },
            body: JSON.stringify({ query: 'I have an entirely unique unknown issue 1234567890', intern_id: author.user.id, action: 'grok_downvote' })
        });
        const downvoteData = await downvoteRes.json();
        queryIdToTest = downvoteData.query_id;
        console.log(`✅ Downvoted. Query escalated. Query ID: ${queryIdToTest}`);
    } else if (askRes.status === 201 && askData.resolution === 'escalated') {
        queryIdToTest = askData.query_id;
        console.log(`✅ AI failed directly. Query escalated. Query ID: ${queryIdToTest}`);
    } else {
        console.log("❌ Unexpected response from Ask AI.");
        console.log(askData);
    }

    console.log("\n--- 3. TEST 5-QUERY SPAM CAP ---");
    console.log("Attempting to hit the 5 active query cap...");
    let capHit = false;
    for(let i=0; i<6; i++) {
        const spamRes = await fetch(`${BASE_URL}/ask`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${author.token}` },
            body: JSON.stringify({ query: `Spam query attempt number ${i} with unique letters abcdefg`, intern_id: author.user.id, action: 'grok_downvote' })
        });
        if (spamRes.status === 429) {
            capHit = true;
            console.log("✅ SUCCESS: Hit 429 Too Many Requests (Cap Blocked) on attempt " + (i+1));
            break;
        }
    }
    if (!capHit) console.log("❌ FAIL: Did not hit the capacity cap.");

    if (!queryIdToTest) return;

    console.log("\n--- 4. TEST PEER ANSWERING ---");
    const answerRes = await fetch(`${BASE_URL}/peer/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${peer.token}` },
      body: JSON.stringify({ query_id: queryIdToTest, response_text: 'Here is the correct peer answer!' })
    });
    const answerData = await answerRes.json();
    
    if (answerRes.status === 201) {
        console.log(`✅ SUCCESS: Peer submitted an answer. Response ID: ${answerData.data.response._id}`);
        
        console.log("\n--- 5. TEST HIGH-RATING LOCK (4-5 STARS) ---");
        const rateRes = await fetch(`${BASE_URL}/ratings/${answerData.data.response._id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${author.token}` },
            body: JSON.stringify({ rating: 5 })
        });
        const rateData = await rateRes.json();
        
        if (rateData.success && rateData.data.query_locked === true) {
            console.log("✅ SUCCESS: 5-Star rating instantly locked the query!");
        } else {
            console.log("❌ FAIL: Rating did not lock the query.");
            console.log(rateData);
        }

    } else {
        console.log(`❌ FAIL: Peer could not answer query. Status: ${answerRes.status}`);
        console.log(answerData);
    }

    console.log("\n🏁 PHASE 3 TESTING COMPLETE.");

  } catch (error) {
    console.error("Test execution failed.", error.message);
  }
}

runWorkflowTests();
