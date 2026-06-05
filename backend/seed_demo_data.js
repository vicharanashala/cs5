require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import all models
const User = require('./models/User');
const Query = require('./models/Query');
const Response = require('./models/Response');
const Notification = require('./models/Notification');
const Announcement = require('./models/Announcement');
const NoFaq = require('./models/NoFaq');
const ModeratorFaqSuggestion = require('./models/ModeratorFaqSuggestion');
const SimilarQueryInterest = require('./models/SimilarQueryInterest');

// Predefined users
const userList = [
  { email: 'admin@query.in', password: 'Admin1@123', role: 'admin' },
  { email: 'mod1@query.in', password: 'Mod1@123', role: 'moderator' },
  { email: 'mod2@query.in', password: 'Mod2@123', role: 'moderator' },
  { email: 'intern1@query.in', password: 'Intern1@123', role: 'intern' },
  { email: 'intern2@query.in', password: 'Intern2@123', role: 'intern' },
  { email: 'intern3@query.in', password: 'Intern3@123', role: 'intern' },
  { email: 'intern4@query.in', password: 'Intern4@123', role: 'intern' },
  { email: 'intern5@query.in', password: 'Intern5@123', role: 'intern' },
  { email: 'intern6@query.in', password: 'Intern6@123', role: 'intern' },
  { email: 'intern7@query.in', password: 'Intern7@123', role: 'intern' },
  { email: 'intern8@query.in', password: 'Intern8@123', role: 'intern' },
  { email: 'intern9@query.in', password: 'Intern9@123', role: 'intern' },
  { email: 'intern10@query.in', password: 'Intern10@123', role: 'intern', warning_count: 3 } // Give user 10 some warnings
];

// Seed Data
const seedDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // 1. Clear Data
    console.log('Clearing existing data (except FAQs)...');
    await Promise.all([
      User.deleteMany({}),
      Query.deleteMany({}),
      Response.deleteMany({}),
      Notification.deleteMany({}),
      Announcement.deleteMany({}),
      NoFaq.deleteMany({}),
      ModeratorFaqSuggestion.deleteMany({}),
      SimilarQueryInterest.deleteMany({})
    ]);

    // 2. Seed Users
    console.log('Seeding Users...');
    const hashedUsers = await Promise.all(userList.map(async (user) => {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
      return user;
    }));
    
    const createdUsers = await User.insertMany(hashedUsers);
    
    // Group users by role for easy access
    const admin = createdUsers.find(u => u.role === 'admin');
    const mods = createdUsers.filter(u => u.role === 'moderator');
    const interns = createdUsers.filter(u => u.role === 'intern');

    // Helper to get random interns
    const getRandomInterns = (count, excludeId = null) => {
      const available = interns.filter(i => i._id.toString() !== (excludeId || '').toString());
      return available.sort(() => 0.5 - Math.random()).slice(0, count);
    };

    // 3. Seed Announcements
    console.log('Seeding Announcements...');
    await Announcement.insertMany([
      {
        admin_id: admin._id,
        heading: 'Welcome to the VINS Summer Cohort 2026!',
        content: 'We are excited to welcome all selected interns to the Vicharanashala online internship. Please remember to upload your NOC by the end of the week. Let the journey begin!',
        priority: 'high',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
      },
      {
        admin_id: admin._id,
        heading: 'New RAG Engine Live',
        content: 'We have updated the AskAI feature. You might notice more accurate auto-complete suggestions now. Remember that 5-star responses will automatically lock your query!',
        priority: 'medium',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        admin_id: admin._id,
        heading: 'Scheduled Maintenance',
        content: 'The platform will undergo brief maintenance on Sunday at 2:00 AM IST. No action required.',
        priority: 'low',
        createdAt: new Date()
      }
    ]);

    // 4. Seed Queries and Responses (Scenarios)
    console.log('Seeding Queries and Responses...');
    
    // Scenario 1: Active Queue (New, 0 responses)
    const q1 = await Query.create({
      intern_id: interns[0]._id,
      query_text: "Can I use an iPad for the internship coding tasks?",
      status: "Pending"
    });

    // Scenario 2: Peer Answered (2 responses, waiting to be rated)
    const q2 = await Query.create({
      intern_id: interns[1]._id,
      query_text: "My HOD is on leave, can the vice-principal sign the NOC?",
      status: "Peer Answered"
    });
    
    const r2_1 = await Response.create({
      query_id: q2._id, author_id: interns[2]._id, response_type: 'peer',
      response_text: "Yes, the vice-principal or any acting head can sign it if the HOD is unavailable."
    });
    const r2_2 = await Response.create({
      query_id: q2._id, author_id: interns[3]._id, response_type: 'peer',
      response_text: "I think only the Principal or Dean can sign if the HOD is not there."
    });
    q2.responses = [r2_1._id, r2_2._id];
    await q2.save();

    // Scenario 3: High-Rated (Pending Resolution - 5 stars)
    const q3 = await Query.create({
      intern_id: interns[2]._id,
      query_text: "Is it mandatory to complete the Bronze phase if I already know React?",
      status: "Peer Answered",
      is_locked: true
    });
    const r3_1 = await Response.create({
      query_id: q3._id, author_id: interns[4]._id, response_type: 'peer',
      response_text: "If you already know the stack, your mentor might skip the Bronze phase and put you straight on to the project (Silver phase).",
      rating: 5, rater_note: "Perfect! Exactly what I needed."
    });
    q3.responses = [r3_1._id];
    await q3.save();

    // Scenario 4: Ambiguous (3-Strike)
    const q4 = await Query.create({
      intern_id: interns[3]._id,
      query_text: "How much?",
      status: "Ambiguous",
      is_locked: true,
      ambiguous_count: 3,
      ambiguous_marked_by: [interns[5]._id, interns[6]._id, interns[7]._id]
    });

    // Scenario 5: Low-Rated (Locked because all 5 peers failed)
    const q5 = await Query.create({
      intern_id: interns[4]._id,
      query_text: "What happens if I miss the orientation completely due to an emergency?",
      status: "Peer Answered",
      is_locked: true
    });
    const lowResponses = [];
    for(let i=0; i<5; i++) {
      const resp = await Response.create({
        query_id: q5._id, author_id: interns[5+i]._id, response_type: 'peer',
        response_text: `I'm not sure, maybe you get kicked out? (${i+1})`,
        rating: Math.floor(Math.random() * 3) + 1 // 1-3 stars
      });
      lowResponses.push(resp._id);
    }
    q5.responses = lowResponses;
    await q5.save();

    // Scenario 6: Stagnant (0 responses, 24h+)
    const q6 = await Query.create({
      intern_id: interns[5]._id,
      query_text: "Are there any specific coding standards for the backend we need to follow?",
      status: "Pending",
      is_locked: true, // Sweeper locks it
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000) // 48 hours ago
    });

    // Scenario 7: Resolved (Peer Approved by Admin)
    const q7 = await Query.create({
      intern_id: interns[6]._id,
      query_text: "Can my HOD send the NOC via email?",
      status: "Resolved",
      is_locked: true,
      resolved_by: admin._id,
      resolved_at: new Date(),
      resolution_type: 'peer_approved'
    });
    const r7_1 = await Response.create({
      query_id: q7._id, author_id: interns[7]._id, response_type: 'peer',
      response_text: "Yes, there is an email-forward path. Your HOD can forward the text NOC from their official email to sudarshan@iitrpr.ac.in.",
      rating: 4,
      approval: true
    });
    q7.responses = [r7_1._id];
    await q7.save();

    // Scenario 8: Resolved (Moderator Override)
    const q8 = await Query.create({
      intern_id: interns[7]._id,
      query_text: "Can I take a 2-day leave for a family function?",
      status: "Resolved",
      is_locked: true,
      resolved_by: mods[0]._id,
      resolved_at: new Date(),
      resolution_type: 'moderator_override'
    });
    const r8_1 = await Response.create({
      query_id: q8._id, author_id: mods[0]._id, response_type: 'moderator',
      response_text: "No. Leave is not permitted during the VINS internship. It requires your full attention for the 2 months.",
      approval: false // It's an override, so approval is false
    });
    q8.responses = [r8_1._id];
    await q8.save();

    // 5. Seed Moderator FAQ Suggestion
    console.log('Seeding Moderator FAQ Suggestions...');
    await ModeratorFaqSuggestion.create({
      query_id: q8._id,
      suggested_by: mods[0]._id,
      question_text: q8.query_text,
      suggested_answer: r8_1.response_text,
      status: 'pending'
    });

    // 6. Seed NoFaqs
    console.log('Seeding NoFaqs...');
    await NoFaq.insertMany([
      {
        queryText: "Can I use Python for the backend instead of Node.js?",
        occurrenceCount: 12, // Triggers yellow alert for admin
        impactedInterns: [interns[0]._id, interns[1]._id, interns[2]._id]
      },
      {
        queryText: "How do I get the platinum badge?",
        occurrenceCount: 4,
        impactedInterns: [interns[3]._id]
      }
    ]);

    // 7. Seed Similar Query Interest
    console.log('Seeding Similar Query Interests...');
    await SimilarQueryInterest.create({
      original_query_id: q1._id,
      interested_intern_id: interns[8]._id,
      query_text: "Are iPads allowed for doing the daily coding tasks?",
      notified: false
    });

    // 8. Seed Notifications
    console.log('Seeding Notifications...');
    await Notification.insertMany([
      {
        recipient_id: admin._id,
        type: 'admin_alert',
        title: 'New FAQ Suggestion Alert',
        message: 'The query "Can I use Python for the backend instead of Node.js?" has reached 12 occurrences.',
        link_type: 'query'
      },
      {
        recipient_id: interns[1]._id,
        type: 'peer_answer',
        title: 'New Peer Response',
        message: 'Someone answered your query about the NOC.',
        link_id: q2._id,
        link_type: 'query'
      },
      {
        recipient_id: interns[6]._id,
        type: 'query_resolved',
        title: 'Query Resolved',
        message: 'An admin has approved a response to your query!',
        link_id: q7._id,
        link_type: 'query'
      },
      {
        recipient_id: interns[9]._id, // The one with warnings
        type: 'intern_warning',
        title: 'Platform Warning',
        message: 'You have been warned for misusing the AskAI platform. Repeated violations will result in account suspension.',
        created_by: admin._id
      }
    ]);

    console.log('Database successfully seeded with demo data!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
