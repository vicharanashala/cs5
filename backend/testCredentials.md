# Query.in - Test Credentials

Use these credentials to test the authentication system across different dashboard views.

## Test Accounts

**Pattern:** `{role}{number}@query.in` / `{Role}{number}@123`

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@query.in | Admin1@123 |
| Moderator | mod1@query.in | Mod1@123 |
| Moderator | mod2@query.in | Mod2@123 |
| Intern | intern1@query.in | Intern1@123 |
| Intern | intern2@query.in | Intern2@123 |
| Intern | intern3@query.in | Intern3@123 |
| Intern | intern4@query.in | Intern4@123 |
| Intern | intern5@query.in | Intern5@123 |
| Intern | intern6@query.in | Intern6@123 |
| Intern | intern7@query.in | Intern7@123 |
| Intern | intern8@query.in | Intern8@123 |
| Intern | intern9@query.in | Intern9@123 |
| Intern | intern10@query.in | Intern10@123 |

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
  { email: 'intern10@query.in', password: 'Intern10@123', role: 'intern' },
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

  console.log('Done! 13 test users seeded.');
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
  -d '{"email":"admin@query.in","password":"Admin1@123"}'
```

**Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@query.in","password":"NewUser@123","role":"intern"}'
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