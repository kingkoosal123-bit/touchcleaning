# Admin Panel Setup Guide

## Creating Admin Credentials

Since user roles are stored securely in the database, you need to manually assign admin privileges to a user account.

### Step 1: Create a User Account
1. Visit `/auth` page
2. Sign up with your admin email and password
3. Complete the registration process

### Step 2: Assign Admin Role

Option A - Using Supabase Dashboard (Recommended):
1. Go to your Supabase project dashboard
2. Navigate to **Table Editor** → **user_roles** table
3. Click **Insert Row**
4. Fill in the fields:
   - `user_id`: Copy the UUID from the auth.users table for your account
   - `role`: Select `admin` from the dropdown
5. Click **Save**

Option B - Using SQL Editor:
1. Go to Supabase **SQL Editor**
2. Run this query (replace `YOUR_EMAIL` with your actual email):

```sql
-- Get your user ID
SELECT id FROM auth.users WHERE email = 'YOUR_EMAIL';

-- Insert admin role (replace USER_ID with the ID from above query)
INSERT INTO user_roles (user_id, role)
VALUES ('USER_ID', 'admin');
```

### Step 3: Verify Admin Access
1. Sign out and sign in again
2. You should now see "Dashboard" link in the navbar
3. Access `/dashboard` to see the admin panel

## Admin Panel Features

### Dashboard (/dashboard)
- Total revenue analytics
- Customer statistics
- Active bookings overview
- Booking status breakdown
- Staff overview
- Quick action links

### Users Management (/dashboard/users)
- View all registered users
- Manage user roles (admin, staff, customer)
- User activity monitoring

### Bookings Management (/dashboard/bookings)
- View all bookings across the system
- Update booking statuses
- Assign staff to jobs
- View booking details and notes

### SEO Settings (/dashboard/seo)
- Manage meta titles for each page
- Customize meta descriptions
- Set keywords for SEO
- Preview how pages appear in search results

## Role Types

- **Admin**: Full access to all features, can manage users, bookings, and settings
- **Staff**: Can view and manage assigned bookings
- **Customer**: Can create bookings and view their own booking history

## Security Notes

- Roles are stored in a separate `user_roles` table for security
- RLS policies prevent privilege escalation
- Always use secure passwords for admin accounts
- Regularly review user roles and permissions

## Troubleshooting

**Can't see Dashboard link after assigning admin role?**
- Sign out and sign back in to refresh your session
- Verify the role was correctly inserted in the database
- Check browser console for any errors

**Getting "Access Denied" errors?**
- Ensure RLS policies are properly configured
- Verify your user_id matches the one in user_roles table
- Check that the role is exactly 'admin' (case-sensitive)

## Need Help?

For additional support:
1. Check the Supabase dashboard for any RLS policy errors
2. Review the browser console for error messages
3. Verify database migrations ran successfully
