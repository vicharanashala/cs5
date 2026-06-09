# Query.in - Live Presentation Script

**Tip for Presenter:** Before you start the presentation, make sure you have run the database seeder (`npm run seed` in the backend folder) so that all the demo accounts, queries, and scenarios are pre-loaded. 

---

## 1. Introduction (2 mins)

**[Slide/Screen: Welcome / Landing Page]**

"Hello everyone. Today, I am excited to present **Query.in**, a crowd-sourced FAQ generation and peer-to-peer query resolution platform built specifically for internship programs like the VINS Summer Cohort."

"In any large internship program, communication between interns and the administration is a huge bottleneck. Interns have hundreds of questions, and the admin team is overwhelmed. We identified four major problems:"
1. **Query Repetition:** Interns ask the same questions over and over.
2. **Delay in Answers:** Because admins are busy, interns wait hours or days for a simple response.
3. **Admin Workload:** Admins are answering individual queries instead of managing the program.
4. **Poor Quality Questions:** Interns often ask vague or ambiguous questions, wasting everyone's time.

"Our solution? **Crowd-sourcing combined with AI.** Instead of relying solely on an admin, Query.in leverages the collective intelligence of the interns themselves, backed by a powerful AI moderation pipeline."

---

## 2. AI Deflection & Auto-Complete (3 mins)

**[Screen: Login as Intern (`intern1@query.in` / `Intern1@123`)]**

"Let's look at it from an Intern's perspective. I am logged in as an intern. I have a question about my NOC (No Objection Certificate)."

**[Action: Navigate to 'Ask AI']**

"As I start typing my question: *'How do I submit my NOC?'*, you'll see the **RAG (Retrieval-Augmented Generation) Auto-Complete** kick in instantly."

**[Action: Type 'NOC' slowly so auto-complete drops down]**

"Before I even submit the query, the system searches our FAQ database using keyword and tag matching. If the answer is already there, I get it instantly. Problem 1 (Query Repetition) is solved. I don't need to bother the admin or my peers."

**[Action: Type a question that is NOT in the FAQ, but is valid, e.g., 'What are the rules for taking leave during the internship?']**

"But what if the FAQ doesn't have the answer? I hit submit. The system first checks the internal knowledge base. If it fails, it falls back to our **Multi-Provider LLM Pipeline** (powered by Gemini and Groq)."

"If the AI gives me a good answer, I upvote it, and the query is resolved. But if the AI's answer isn't helpful, I downvote it, and the query escalates to the **Peer Queue**."

---

## 3. The Crowd-Sourced Peer Queue (4 mins)

**[Screen: Login as another Intern (`intern2@query.in` / `Intern2@123`) in a new incognito window]**

"This is where the crowd-sourcing magic happens. I am now logged in as a different intern."

**[Action: Navigate to 'Peer Queue']**

"In the Peer Queue, I can see questions asked by other interns. Instead of waiting for an admin, *I* can answer this question. This solves the delay problem—interns help interns."

**[Action: Find a pending query and submit a peer answer]**

"I submit my answer. The query author gets a real-time Socket.IO notification immediately."

**[Screen: Switch back to Intern 1, go to 'My Escalations']**

"Back as Intern 1, I see the response. Now I get to act as a quality controller. I rate this response from 1 to 5 stars."
- "If I give it **5 stars**, the answer is perfect. The query instantly locks and goes to the Admin's 'Highly-Rated' queue for final approval."
- "If I give it **1-3 stars**, the query stays open so other peers can try answering. If 5 peers give bad answers, the query locks and goes to the 'Low-Rated' queue."

---

## 4. Quality Control & Ambiguous Queries (2 mins)

**[Action: Show the 'Mark as Ambiguous' button on a query in the Peer Queue]**

"What if an intern asks a terrible, vague question like *'How much?'*?"

"Peers don't have to waste time answering. They can click **'Mark as Ambiguous'**. We implemented a **3-Strike Rule**. If 3 different peers mark a question as ambiguous, the system automatically locks the query and notifies the author that their question was unclear and needs to be rephrased."

"This distributed quality control ensures the admin only sees high-quality, actionable queries."

---

## 5. The Admin Resolve Hub (4 mins)

**[Screen: Login as Admin (`admin@query.in` / `Admin1@123`)]**

"Now, let's look at the Admin dashboard. The admin's workload is drastically reduced. They don't answer queries from scratch; they just review what the crowd has already filtered."

**[Action: Navigate to 'Query Management' (Resolve Hub)]**

"Our Resolve Hub is split into 6 automated sections:"
1. **Pending Resolution:** 4-5 star peer answers. The admin just clicks 'Approve'.
2. **Ambiguous:** Queries the crowd flagged as vague.
3. **Low-Rated:** Queries where peers tried to help but failed.
4. **Stagnant:** Queries untouched for 24+ hours (swept automatically by a background cron job).
5. **Archive:** Previously resolved queries.
6. **Moderator Suggested:** FAQ gaps identified by moderators.

**[Action: Approve a High-Rated Query and click '+ Add to FAQ Database']**

"When I approve a great peer answer, I have the option to instantly add it to the FAQ database. This is how the knowledge base grows organically based on real intern problems."

---

## 6. User Management & Warning System (2 mins)

**[Action: Navigate to 'User Management']**

"Finally, we have strict abuse prevention. In the User Management panel, admins can see warning counts. If an intern misbehaves (e.g., spamming the queue), the admin can issue a warning from the Resolve Hub. "

"If an intern hits 5 warnings, their account is automatically disabled, and they are booted from the system instantly."

---

## 7. Conclusion (1 min)

**[Screen: Analytics Page]**

"We also feature a full analytics dashboard showing bottleneck analysis, AI helpfulness rates, and average resolution times."

"In conclusion, **Query.in** transforms internship management. By combining AI deflection with a robust, crowd-sourced peer review system, we eliminate query repetition, drastically reduce wait times, and take the load off the admin team—creating a self-sustaining knowledge ecosystem."

"Thank you! We'd love to take your questions."
