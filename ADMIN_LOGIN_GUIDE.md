# Admin Login Guide

## How Admin Login Works

### Overview
The IT Training Platform uses **role-based authentication** with three user types:
- **Admin**: Full system access with management capabilities
- **Employee**: Access to training courses and portfolio features  
- **Intern**: Limited access to assigned training materials

### Admin Account Creation

**Admin accounts CANNOT be created through the signup form.** They are pre-seeded in the database by system administrators.

#### Pre-seeded Demo Accounts

The following demo accounts are available:

| Role     | Email                    | Password      |
|----------|--------------------------|---------------|
| Admin    | admin@company.com        | Admin123!     |
| Employee | john.doe@company.com     | Employee123!  |
| Intern   | intern@company.com       | Intern123!    |

### How to Login as Admin

1. Navigate to `/login` page
2. Enter admin credentials:
   - **Email**: `admin@company.com`
   - **Password**: `Admin123!`
3. Click "Sign In"
4. You'll be redirected to `/dashboard` with admin privileges

### User Registration

Regular users (employees and interns) can register through the `/signup` page:
- They must use a `@company.com` email address
- They can select either "Employee" or "Intern" role
- **Admin role is NOT available** during self-registration

### Role Access in Code

After login, the user's role is available in the session:

```typescript
import { useSession } from "@/lib/auth-client";

const { data: session } = useSession();
const userRole = session?.user?.role; // 'admin', 'employee', or 'intern'
```

### Creating Additional Admin Accounts

To create new admin accounts, system administrators should:

1. Use the Database Agent to seed new users directly into the `user` table with `role='admin'`
2. Or manually insert records into the database with proper password hashing

**Example using Database Agent:**
```
Create a new admin user with email 'newtadmin@company.com', name 'New Admin', role 'admin', and password 'SecurePass123!' in the better-auth user table.
```

### Security Notes

- All passwords are hashed using bcrypt (10 salt rounds)
- Sessions are managed by better-auth with bearer token authentication
- Email verification is enabled in the schema (though currently bypassed for demo accounts)
- Role-based middleware can be added to protect admin-only routes

### Next Steps

To implement role-based access control:
1. Update middleware to check user roles
2. Create admin-only routes (e.g., `/admin/*`)
3. Add role checks in API routes
4. Conditionally render UI based on user role
