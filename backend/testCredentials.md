# Query.in - Test Credentials

Use these credentials to test the authentication system across different dashboard views.

## Test Accounts

| Role       | Email                    | Password          |
|------------|--------------------------|-------------------|
| Admin      | admin@query.in           | Admin@1234        |
| Moderator  | mod@query.in             | Mod@1234          |
| Intern 1   | intern1@query.in         | Intern1@1234      |
| Intern 2   | intern2@query.in         | Intern2@1234      |

**Password Requirements:** 8+ characters, 1 uppercase, 1 lowercase, 1 number, 1 special character (`!@#$%^&*(),.?":{}|<>`)

---

## Database Seed Script

Run this script in the backend folder to inject the test users into MongoDB:

```bash
cd backend
node -e "
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const users = [
  { email: 'admin@query.in', password: 'Admin@1234', role: 'admin' },
  { email: 'mod@query.in', password: 'Mod@1234', role: 'moderator' },
  { email: 'intern1@query.in', password: 'Intern1@1234', role: 'intern' },
  { email: 'intern2@query.in', password: 'Intern2@1234', role: 'intern' },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  await User.deleteMany({});
  console.log('Cleared existing users');

  for (const u of users) {
    const salt = await bcrypt.genSalt(12);
    const hashed = await bcrypt.hash(u.password, salt);
    await User.create({ email: u.email, password: hashed, role: u.role });
    console.log('Created:', u.email, '-', u.role);
  }

  console.log('Done! 4 test users seeded.');
  await mongoose.disconnect();
}

seed().catch(console.error);
"
```

---

## Testing the Auth Endpoints

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@query.in","password":"Admin@1234"}'
```

**Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@query.in","password":"NewUser@1234","role":"intern"}'
```

**Get Me (requires token):**
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <YOUR_TOKEN_HERE>"
```

---

## Protected Route Example

The `protect` middleware guards `/api/auth/me`. Without a valid JWT in the `Authorization: Bearer <token>` header, it returns:

```json
{ "success": false, "error": "Access denied. No token provided." }
```

The `authorizeRoles('admin')` middleware on an endpoint returns 403 if a non-admin tries to access it:

```json
{ "success": false, "error": "Access denied. Your role (intern) is not authorized for this resource." }
```