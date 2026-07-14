# Supabase Integration Guide for HtracX

This document provides comprehensive instructions for setting up and integrating Supabase with the HtracX Smart Hostel Management System.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Supabase Setup](#supabase-setup)
3. [Database Schema](#database-schema)
4. [Environment Variables](#environment-variables)
5. [Testing Authentication](#testing-authentication)
6. [API Functions Reference](#api-functions-reference)
7. [Real-time Features](#real-time-features)
8. [Geolocation & Night Alerts](#geolocation--night-alerts)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- A Supabase account (sign up at [supabase.com](https://supabase.com))
- Node.js 18+ installed
- Basic knowledge of PostgreSQL

---

## Supabase Setup

### Step 1: Create a New Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in:
   - **Project Name**: `htracx` (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Select closest to your users
4. Click "Create new project" and wait for setup to complete

### Step 2: Get Your Credentials

1. Once the project is ready, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

---

## Database Schema

### Execute the following SQL in Supabase SQL Editor

Go to **SQL Editor** in your Supabase dashboard and run this SQL:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== USERS TABLE ====================
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('student', 'admin')),
  phone TEXT NOT NULL,
  room_no TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_users_email ON users(email);

-- ==================== ATTENDANCE TABLE ====================
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent')),
  marked_at TIMESTAMPTZ DEFAULT NOW(),
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  UNIQUE(user_id, date)
);

-- Add indexes
CREATE INDEX idx_attendance_user_id ON attendance(user_id);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_attendance_status ON attendance(status);

-- ==================== TICKETS TABLE ====================
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  room_no TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_tickets_user_id ON tickets(user_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_created_at ON tickets(created_at DESC);

-- ==================== LEAVE APPLICATIONS TABLE ====================
CREATE TABLE leave_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  from_date DATE NOT NULL,
  to_date DATE NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_leave_user_id ON leave_applications(user_id);
CREATE INDEX idx_leave_status ON leave_applications(status);
CREATE INDEX idx_leave_dates ON leave_applications(from_date, to_date);

-- ==================== MESS MENU TABLE ====================
CREATE TABLE mess_menu (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  day TEXT NOT NULL CHECK (day IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'snacks', 'dinner')),
  items TEXT[] NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(day, meal_type)
);

-- Add index
CREATE INDEX idx_mess_menu_day ON mess_menu(day);

-- ==================== NOTIFICATIONS TABLE ====================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('attendance', 'ticket', 'leave', 'announcement', 'alert')),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- ==================== NIGHT ALERTS TABLE (NEW) ====================
-- This table stores alerts when students are outside campus during curfew hours
CREATE TABLE night_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  student_room TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  distance_from_campus INTEGER NOT NULL, -- in meters
  alert_time TIMESTAMPTZ DEFAULT NOW(),
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_by UUID REFERENCES users(id),
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_night_alerts_student_id ON night_alerts(student_id);
CREATE INDEX idx_night_alerts_alert_time ON night_alerts(alert_time DESC);
CREATE INDEX idx_night_alerts_acknowledged ON night_alerts(acknowledged);

-- ==================== ROW LEVEL SECURITY (RLS) ====================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE mess_menu ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE night_alerts ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Attendance policies
CREATE POLICY "Students can view their own attendance" ON attendance
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Students can mark their own attendance" ON attendance
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all attendance" ON attendance
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Tickets policies
CREATE POLICY "Students can view their own tickets" ON tickets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Students can create tickets" ON tickets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all tickets" ON tickets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

CREATE POLICY "Admins can update tickets" ON tickets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Leave applications policies
CREATE POLICY "Students can view their own leave applications" ON leave_applications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Students can create leave applications" ON leave_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all leave applications" ON leave_applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

CREATE POLICY "Admins can update leave applications" ON leave_applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Mess menu policies (everyone can read, only admins can modify)
CREATE POLICY "Everyone can view mess menu" ON mess_menu
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage mess menu" ON mess_menu
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can create notifications" ON notifications
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Night alerts policies (NEW)
CREATE POLICY "Students can view their own night alerts" ON night_alerts
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Admins can view all night alerts" ON night_alerts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

CREATE POLICY "System can create night alerts" ON night_alerts
  FOR INSERT WITH CHECK (true);

-- ==================== FUNCTIONS AND TRIGGERS ====================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leave_applications_updated_at
  BEFORE UPDATE ON leave_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mess_menu_updated_at
  BEFORE UPDATE ON mess_menu
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==================== SEED DATA (OPTIONAL) ====================

-- Insert sample mess menu
INSERT INTO mess_menu (day, meal_type, items) VALUES
  ('Monday', 'breakfast', ARRAY['Idli', 'Vada', 'Sambhar', 'Chutney', 'Tea/Coffee']),
  ('Monday', 'lunch', ARRAY['Rice', 'Dal', 'Vegetable Curry', 'Roti', 'Salad']),
  ('Monday', 'snacks', ARRAY['Samosa', 'Tea', 'Biscuits']),
  ('Monday', 'dinner', ARRAY['Chapati', 'Paneer Curry', 'Rice', 'Dal', 'Curd']),
  
  ('Tuesday', 'breakfast', ARRAY['Poha', 'Jalebi', 'Tea/Coffee']),
  ('Tuesday', 'lunch', ARRAY['Rice', 'Rajma', 'Mixed Veg', 'Roti', 'Papad']),
  ('Tuesday', 'snacks', ARRAY['Pakora', 'Tea', 'Cookies']),
  ('Tuesday', 'dinner', ARRAY['Roti', 'Aloo Gobi', 'Rice', 'Dal', 'Raita']),
  
  ('Wednesday', 'breakfast', ARRAY['Upma', 'Banana', 'Tea/Coffee']),
  ('Wednesday', 'lunch', ARRAY['Rice', 'Chana Masala', 'Roti', 'Salad']),
  ('Wednesday', 'snacks', ARRAY['Bread Pakora', 'Tea', 'Namkeen']),
  ('Wednesday', 'dinner', ARRAY['Chapati', 'Dal Makhani', 'Rice', 'Raita']),
  
  ('Thursday', 'breakfast', ARRAY['Paratha', 'Curd', 'Pickle', 'Tea/Coffee']),
  ('Thursday', 'lunch', ARRAY['Rice', 'Kadhi', 'Aloo Fry', 'Roti', 'Papad']),
  ('Thursday', 'snacks', ARRAY['Vada Pav', 'Tea', 'Cookies']),
  ('Thursday', 'dinner', ARRAY['Roti', 'Mix Veg', 'Rice', 'Dal', 'Salad']),
  
  ('Friday', 'breakfast', ARRAY['Dosa', 'Sambhar', 'Chutney', 'Tea/Coffee']),
  ('Friday', 'lunch', ARRAY['Rice', 'Paneer Curry', 'Roti', 'Pickle', 'Salad']),
  ('Friday', 'snacks', ARRAY['Cutlet', 'Tea', 'Biscuits']),
  ('Friday', 'dinner', ARRAY['Chapati', 'Chole', 'Rice', 'Raita', 'Onion']),
  
  ('Saturday', 'breakfast', ARRAY['Puri', 'Bhaji', 'Tea/Coffee']),
  ('Saturday', 'lunch', ARRAY['Rice', 'Rajma', 'Aloo Gobi', 'Roti', 'Salad']),
  ('Saturday', 'snacks', ARRAY['Samosa', 'Tea', 'Namkeen']),
  ('Saturday', 'dinner', ARRAY['Roti', 'Dal Fry', 'Jeera Rice', 'Papad', 'Curd']),
  
  ('Sunday', 'breakfast', ARRAY['Bread', 'Omelette', 'Butter', 'Jam', 'Tea/Coffee']),
  ('Sunday', 'lunch', ARRAY['Biryani', 'Raita', 'Salad', 'Papad']),
  ('Sunday', 'snacks', ARRAY['Spring Roll', 'Tea', 'Cookies']),
  ('Sunday', 'dinner', ARRAY['Chapati', 'Paneer Butter Masala', 'Rice', 'Dal', 'Pickle']);
```

---

## Environment Variables

### Step 1: Copy `.env.example` to `.env.local`

```bash
cp .env.example .env.local
```

### Step 2: Update `.env.local` with your credentials

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Admin Configuration
NEXT_PUBLIC_ADMIN_PASS_KEY=HTRACX_ADMIN_2025_SECURE_KEY
```

**Important Notes:**
- Replace `your-project-id` with your actual Supabase project ID
- Replace `your-anon-key-here` with your actual Supabase anon/public key
- You can change `NEXT_PUBLIC_ADMIN_PASS_KEY` to any secure value you prefer
- **Never commit `.env.local` to version control!**

### Step 3: Restart the development server

```bash
bun run dev
```

---

## Testing Authentication

### Test Student Signup

1. Navigate to `/auth/signup`
2. Select "Student" user type
3. Fill in the form:
   - Name: Test Student
   - Email: student@test.com
   - Password: test123
   - Phone: 1234567890
   - Room No: A-101
4. Click "Sign Up"
5. You should be redirected to login page

### Test Admin Signup

1. Navigate to `/auth/signup`
2. Select "Admin" user type
3. Fill in the form:
   - Name: Test Admin
   - Email: admin@test.com
   - Password: test123
   - Phone: 9876543210
   - Admin Pass Key: `HTRACX_ADMIN_2025_SECURE_KEY` (or your custom key)
4. Click "Sign Up"
5. You should be redirected to login page

### Test Login

1. Navigate to `/auth/login`
2. Select correct user type (Student or Admin)
3. Enter email and password
4. Click "Login"
5. You should be redirected to appropriate dashboard

---

## API Functions Reference

All API functions are located in `src/lib/api/`:

### Authentication (`src/lib/api/auth.ts`)

- `signUpStudent(email, password, name, phone, roomNo)` - Register new student
- `signUpAdmin(email, password, name, phone, adminPassKey)` - Register new admin
- `signIn(email, password)` - Login user
- `signOut()` - Logout user
- `getCurrentSession()` - Get current session
- `getCurrentUserProfile()` - Get current user profile

### Data Operations (`src/lib/api/data.ts`)

**Attendance:**
- `markAttendance(userId, date, lat, lng)` - Mark attendance
- `getUserAttendance(userId, limit)` - Get user's attendance records
- `getTodayAttendance(userId)` - Get today's attendance
- `getAllAttendance(date)` - Get all attendance (admin only)

**Tickets:**
- `createTicket(userId, roomNo, category, description)` - Create new ticket
- `getUserTickets(userId)` - Get user's tickets
- `getAllTickets(status)` - Get all tickets (admin only)
- `updateTicketStatus(ticketId, status)` - Update ticket status (admin only)

**Leave Applications:**
- `createLeaveApplication(userId, fromDate, toDate, reason)` - Create leave request
- `getUserLeaveApplications(userId)` - Get user's leave applications
- `getAllLeaveApplications(status)` - Get all leave applications (admin only)
- `updateLeaveStatus(leaveId, status)` - Approve/reject leave (admin only)

**Mess Menu:**
- `getMessMenu(day)` - Get mess menu for specific day
- `getTodayMessMenu()` - Get today's mess menu
- `upsertMessMenuItem(day, mealType, items, description, imageUrl)` - Create/update menu (admin only)

**Notifications:**
- `createNotification(userId, title, message, type)` - Create notification
- `getUserNotifications(userId, limit)` - Get user's notifications
- `markNotificationAsRead(notificationId)` - Mark as read
- `markAllNotificationsAsRead(userId)` - Mark all as read
- `broadcastAnnouncement(title, message)` - Send to all students (admin only)

### Night Alert Operations (`src/lib/api/alerts.ts`) **NEW**

**Create Night Alert:**
```typescript
import { createNightAlert } from '@/lib/api/alerts'

// Called automatically by geolocation system when student is outside during curfew
await createNightAlert(
  studentId,      // UUID of student
  latitude,       // Current latitude
  longitude,      // Current longitude
  distanceMeters  // Distance from campus in meters
)
```

**Get All Night Alerts (Admin):**
```typescript
import { getNightAlerts } from '@/lib/api/alerts'

// Get all night alerts, optionally filtered
const alerts = await getNightAlerts({
  studentId: 'optional-student-uuid',  // Filter by student
  acknowledged: false,                 // Only unacknowledged
  limit: 50                           // Max results
})
```

**Get Student's Night Alerts:**
```typescript
import { getStudentNightAlerts } from '@/lib/api/alerts'

// Get alerts for specific student
const myAlerts = await getStudentNightAlerts(studentId, limit)
```

**Acknowledge Alert (Admin):**
```typescript
import { acknowledgeNightAlert } from '@/lib/api/alerts'

// Mark alert as acknowledged
await acknowledgeNightAlert(alertId, adminId)
```

---

## Real-time Features

The app uses Supabase Realtime for live updates:

### Subscribe to Notifications

```typescript
import { subscribeToNotifications } from '@/lib/api/data'

// In your component
useEffect(() => {
  const channel = subscribeToNotifications(userId, (payload) => {
    if (payload.eventType === 'INSERT') {
      // Handle new notification
      console.log('New notification:', payload.new)
    }
  })

  return () => {
    channel.unsubscribe()
  }
}, [userId])
```

### Subscribe to Tickets

```typescript
import { subscribeToTickets } from '@/lib/api/data'

// In your component
useEffect(() => {
  const channel = subscribeToTickets((payload) => {
    if (payload.eventType === 'UPDATE') {
      // Handle ticket update
      console.log('Ticket updated:', payload.new)
    }
  })

  return () => {
    channel.unsubscribe()
  }
}, [])
```

### Subscribe to Night Alerts (Admin) **NEW**

```typescript
import { subscribeToNightAlerts } from '@/lib/api/alerts'

// Admin dashboard - real-time night alerts
useEffect(() => {
  const channel = subscribeToNightAlerts((payload) => {
    if (payload.eventType === 'INSERT') {
      // New night alert received
      const alert = payload.new
      console.log(`⚠️ ${alert.student_name} is outside campus!`)
      
      // Show browser notification
      new Notification('Night Curfew Alert', {
        body: `${alert.student_name} (${alert.student_room}) is ${alert.distance_from_campus}m from campus`,
        icon: '/icon.png'
      })
      
      // Play alert sound
      const audio = new Audio('/alert-sound.mp3')
      audio.play()
    }
  })

  return () => channel.unsubscribe()
}, [])
```

---

## Geolocation & Night Alerts

### How It Works

**Curfew Hours:** 9:00 PM - 5:00 AM

**Check Frequency:** Every 10 minutes during curfew hours

**Process:**
1. Student's browser checks GPS location every 10 minutes between 9 PM - 5 AM
2. System calculates distance from campus center (configured in `src/lib/geolocation.ts`)
3. If student is outside the geofence (default 500m radius):
   - System creates a night alert in Supabase `night_alerts` table
   - Only sends one alert per hour to prevent spam
   - Alert includes: student name, room, GPS coordinates, distance, timestamp
4. Admin dashboard receives real-time alert via Supabase Realtime
5. Admin can view all alerts and acknowledge them

### Campus Coordinates Configuration

**IMPORTANT:** Update your actual campus coordinates in `src/lib/geolocation.ts`:

```typescript
export const CAMPUS_COORDINATES = {
  latitude: 28.5449,      // Replace with your campus latitude
  longitude: 77.1928,     // Replace with your campus longitude
  radiusInMeters: 500,    // Geofence radius (adjust as needed)
}
```

**How to find coordinates:**
1. Go to Google Maps
2. Right-click on your hostel/campus location
3. Copy the latitude and longitude values
4. Update the constants above

### Testing Night Monitoring

**Method 1: Change Device Time**
```
1. Set device time to 9:30 PM
2. Open student dashboard
3. Night monitoring will activate automatically
4. System checks location every 10 minutes
5. If outside campus, alert is sent to admins
```

**Method 2: Adjust Monitoring Hours (for testing)**
```typescript
// src/hooks/useGeolocation.ts - line 128
// Change to always monitor (not recommended for production)
if (hour < 21 && hour >= 5) {
  // Currently: Only monitor 9 PM - 5 AM
  // For testing: Comment out this block
}
```

### Alert Frequency Adjustment

Current: Checks every **10 minutes**

To change frequency, edit `src/hooks/useGeolocation.ts`:

```typescript
// Line ~170
const interval = setInterval(() => {
  checkNightStatus()
}, 10 * 60 * 1000) // 10 minutes

// Options:
// 5 minutes: 5 * 60 * 1000
// 15 minutes: 15 * 60 * 1000
// 20 minutes: 20 * 60 * 1000
```

---

## Troubleshooting

### Issue: "Invalid Supabase URL" error

**Solution:** Make sure your `.env.local` file has the correct Supabase URL:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
```

### Issue: "Row Level Security policy violation"

**Solution:** Make sure you've run all the RLS policies in the SQL script above.

### Issue: "Admin pass key incorrect"

**Solution:** Check that your `.env.local` has:
```env
NEXT_PUBLIC_ADMIN_PASS_KEY=HTRACX_ADMIN_2025_SECURE_KEY
```
And you're using the same value when signing up as admin.

### Issue: Can't insert into users table

**Solution:** Make sure your users table is set up to reference `auth.users`:
```sql
id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
```

### Issue: Real-time not working

**Solution:** 
1. Go to Supabase Dashboard → Database → Replication
2. Enable replication for the tables you want to subscribe to (tickets, notifications, attendance)

### Issue: "Demo Mode" warning won't go away

**Solution:**
1. Double-check `.env.local` has correct values
2. Restart the development server: `bun run dev`
3. Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)

### Issue: Night alerts not appearing in admin dashboard

**Solution:** 
1. Verify `night_alerts` table exists in Supabase
2. Check RLS policies are set up correctly
3. Enable Replication for `night_alerts` table:
   - Go to Database → Replication
   - Enable replication for `night_alerts`
4. Check browser console for errors
5. Verify student has location permission enabled

### Issue: Too many night alerts

**Solution:**
The system only sends one alert per hour per student to prevent spam. If you're still getting too many:
1. Increase check interval from 10 to 15-20 minutes
2. Adjust the alert throttling in `src/hooks/useGeolocation.ts` (currently 1 hour)

---

## Security Best Practices

1. **Never commit** `.env.local` to version control
2. **Change the admin pass key** in production to something more secure
3. **Enable email verification** in Supabase Auth settings for production
4. **Review RLS policies** before going to production
5. **Use environment-specific** Supabase projects (dev, staging, prod)
6. **Secure night alerts** - Only admins should see them
7. **GPS data privacy** - Store only necessary location data
8. **HTTPS required** - Geolocation only works over HTTPS in production

---

## Next Steps

After setting up Supabase:

1. ✅ Test authentication flow (signup, login, logout)
2. ✅ Update campus coordinates in `src/lib/geolocation.ts`
3. ✅ Test attendance marking with GPS
4. ✅ Test night monitoring system
5. ✅ Verify night alerts appear in admin dashboard
6. ✅ Create sample tickets and leave applications
7. ✅ Update mess menu as admin
8. ✅ Test real-time notifications
9. 🚀 Deploy to production with production Supabase project

---

## Support

If you encounter issues not covered here:

1. Check Supabase docs: https://supabase.com/docs
2. Review the console for error messages
3. Check Supabase Dashboard → Logs for backend errors
4. Verify all tables and RLS policies are created correctly
5. Check [GEOLOCATION.md](./GEOLOCATION.md) for geolocation-specific issues

---

**Happy coding! 🎉**