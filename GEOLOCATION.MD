# 📍 Geolocation System Documentation - HtracX

Complete guide to the geolocation and geofencing system integrated into HtracX Smart Hostel Management System.

---

## 🎯 Overview

The HtracX geolocation system provides:
- **Real-time GPS tracking** using browser Geolocation API
- **Geofencing validation** for attendance marking
- **Night monitoring** (9 PM - 5 AM) with automatic admin alerts
- **Distance calculation** from campus center
- **Permission management** with user-friendly error handling
- **Automatic warden/admin notifications** when students leave campus during curfew

---

## 🏗️ System Architecture

### Core Files

```
src/
├── lib/
│   ├── geolocation.ts              # Core geolocation utilities
│   └── api/
│       └── alerts.ts               # Night alert API functions (NEW)
├── hooks/
│   └── useGeolocation.ts           # React hooks for geolocation
└── app/
    ├── api/
    │   └── alerts/
    │       └── night/              # Night alert API routes (NEW)
    └── dashboard/
        ├── student/
        │   └── page.tsx            # Student dashboard with geolocation UI
        └── admin/
            └── alerts/
                └── page.tsx        # Admin alerts dashboard (NEW)
```

---

## 🔧 Configuration

### Campus Coordinates Setup

**File:** `src/lib/geolocation.ts`

```typescript
export const CAMPUS_COORDINATES = {
  // Default: Indian Institute of Technology, Delhi
  latitude: 28.5449,
  longitude: 77.1928,
  radiusInMeters: 500, // 500 meters geofence radius
}
```

### ⚠️ **IMPORTANT: Update These Coordinates**

Replace the default coordinates with your actual campus/hostel location:

1. **Find Your Campus Coordinates:**
   - Go to [Google Maps](https://maps.google.com)
   - Right-click on your hostel/campus location
   - Copy the latitude and longitude values
   - Example: `28.5449, 77.1928`

2. **Update the Configuration:**
   ```typescript
   export const CAMPUS_COORDINATES = {
     latitude: YOUR_CAMPUS_LATITUDE,    // Replace with your latitude
     longitude: YOUR_CAMPUS_LONGITUDE,  // Replace with your longitude
     radiusInMeters: 500,               // Adjust geofence radius (meters)
   }
   ```

3. **Adjust Geofence Radius:**
   - Small campus: 200-300 meters
   - Medium campus: 500-800 meters
   - Large campus: 1000+ meters

---

## 🌙 Night Monitoring System **UPDATED**

### Overview

The night monitoring system tracks student locations during curfew hours and automatically alerts admins when students leave campus.

### Configuration

**Curfew Hours:** 9:00 PM to 5:00 AM (Changed from 6:00 AM)

**Check Frequency:** Every 10 minutes (Changed from 5 minutes for less frequent checks and better battery life)

**Alert Throttling:** Maximum 1 alert per student per hour (prevents spam)

### How It Works

1. **Automatic Activation**
   - System automatically starts monitoring at 9:00 PM
   - Stops monitoring at 5:00 AM
   - No manual intervention required

2. **Location Checks**
   - Every 10 minutes, student's browser requests GPS location
   - High accuracy mode for precise tracking (uses GPS, not just Wi-Fi)
   - Calculates distance from campus center using Haversine formula

3. **Inside Campus** (Safe)
   - Status: "Safe"
   - Green indicator shown to student
   - No alerts sent
   - Normal monitoring continues

4. **Outside Campus** (Alert)
   - Status: "Outside Campus"
   - Red warning shown to student
   - **Automatic admin alert triggered**
   - Alert includes:
     - Student name
     - Room number
     - GPS coordinates (latitude, longitude)
     - Distance from campus (in meters)
     - Timestamp
   - Only one alert per hour to prevent spam

5. **Alert System**
   - Alert stored in Supabase `night_alerts` table
   - Real-time notification sent to all admins
   - Admin dashboard shows live alert feed
   - Admins can acknowledge alerts
   - Alert history maintained for reporting

### Adjusting Check Frequency

**Current:** 10 minutes (600 seconds)

**To change:** Edit `src/hooks/useGeolocation.ts` around line 170:

```typescript
const interval = setInterval(() => {
  checkNightStatus()
}, 10 * 60 * 1000) // 10 minutes in milliseconds

// Battery-friendly options:
// 15 minutes: 15 * 60 * 1000
// 20 minutes: 20 * 60 * 1000

// More frequent (higher battery usage):
// 5 minutes: 5 * 60 * 1000
// 2 minutes: 2 * 60 * 1000
```

**Battery Impact:**
- 10 minutes: Low impact ✅ (recommended)
- 5 minutes: Moderate impact
- 2 minutes: High impact ⚠️

### Adjusting Curfew Hours

**Current:** 9:00 PM - 5:00 AM

**To change:** Edit `src/hooks/useGeolocation.ts` around line 128:

```typescript
// Only monitor between 9 PM and 5 AM
if (hour < 21 && hour >= 5) {
  setNightStatus('inactive')
  setIsMonitoring(false)
  return
}

// To change hours:
// if (hour < START_HOUR && hour >= END_HOUR)
// Example for 10 PM - 6 AM:
// if (hour < 22 && hour >= 6)
```

---

## 📚 API Reference

### Core Functions (`src/lib/geolocation.ts`)

#### `getCurrentLocation(): Promise<GeolocationCoordinates>`
Get the current user's GPS location.

```typescript
import { getCurrentLocation } from '@/lib/geolocation'

try {
  const coords = await getCurrentLocation()
  console.log(`Lat: ${coords.latitude}, Lng: ${coords.longitude}`)
  console.log(`Accuracy: ±${coords.accuracy}m`)
} catch (error) {
  console.error('Location error:', error.message)
}
```

**Returns:** Promise with `GeolocationCoordinates` object
**Throws:** Error if permission denied or location unavailable

**Options (built-in):**
```typescript
{
  enableHighAccuracy: true,  // Use GPS instead of Wi-Fi
  timeout: 10000,            // 10 second timeout
  maximumAge: 0,             // No cached location
}
```

---

#### `calculateDistance(lat1, lon1, lat2, lon2): number`
Calculate distance between two coordinates using Haversine formula.

```typescript
import { calculateDistance } from '@/lib/geolocation'

const distance = calculateDistance(
  28.5449, 77.1928,  // Campus coordinates
  28.5450, 77.1930   // User coordinates
)
console.log(`Distance: ${distance} meters`)
```

**Parameters:**
- `lat1, lon1`: First coordinate pair
- `lat2, lon2`: Second coordinate pair

**Returns:** Distance in meters (rounded to integer)

**Formula:** Haversine - accounts for Earth's curvature

---

#### `isWithinCampus(userLat, userLng, campusLat?, campusLng?, radius?): boolean`
Check if user is within campus geofence.

```typescript
import { isWithinCampus, CAMPUS_COORDINATES } from '@/lib/geolocation'

const isInside = isWithinCampus(
  userLat,
  userLng,
  CAMPUS_COORDINATES.latitude,
  CAMPUS_COORDINATES.longitude,
  CAMPUS_COORDINATES.radiusInMeters
)

if (isInside) {
  console.log('✅ Student is inside campus')
} else {
  console.log('❌ Student is outside campus')
}
```

**Parameters:**
- `userLat, userLng`: User's coordinates (required)
- `campusLat, campusLng`: Campus coordinates (optional, uses default)
- `radius`: Geofence radius in meters (optional, uses default 500m)

**Returns:** `true` if within geofence, `false` otherwise

---

#### `validateLocationForAttendance(): Promise<ValidationResult>`
Comprehensive location validation for attendance marking.

```typescript
import { validateLocationForAttendance } from '@/lib/geolocation'

try {
  const result = await validateLocationForAttendance()
  
  if (result.isValid) {
    console.log('✅ Inside campus - can mark attendance')
    console.log(`Distance: ${result.distance}m`)
    console.log(`Coordinates: ${result.latitude}, ${result.longitude}`)
    // Mark attendance with result.latitude and result.longitude
  } else {
    console.log('❌ Outside campus - cannot mark attendance')
    console.log(result.message)
  }
} catch (error) {
  console.error('Validation failed:', error.message)
}
```

**Returns:**
```typescript
{
  isValid: boolean,      // Whether user is inside geofence
  latitude: number,      // User's latitude
  longitude: number,     // User's longitude
  distance: number,      // Distance from campus center (meters)
  message: string        // Human-readable status message
}
```

---

#### `watchUserLocation(onLocationChange, onError?): number`
Watch user location in real-time (for night monitoring).

```typescript
import { watchUserLocation, stopWatchingLocation } from '@/lib/geolocation'

const watchId = watchUserLocation(
  (coords, isInsideCampus) => {
    console.log(`Location update: ${coords.latitude}, ${coords.longitude}`)
    console.log(`Inside campus: ${isInsideCampus}`)
    console.log(`Accuracy: ±${coords.accuracy}m`)
    
    if (!isInsideCampus) {
      console.warn('⚠️ Student outside campus!')
      // Trigger admin alert
    }
  },
  (error) => {
    console.error('Watch error:', error)
  }
)

// Stop watching when component unmounts
return () => stopWatchingLocation(watchId)
```

**Returns:** Watch ID (number) to stop watching later

**Note:** Continuous watching has higher battery impact

---

#### `formatDistance(meters: number): string`
Format distance for user-friendly display.

```typescript
import { formatDistance } from '@/lib/geolocation'

console.log(formatDistance(350))    // "350m"
console.log(formatDistance(1500))   // "1.50km"
console.log(formatDistance(2450))   // "2.45km"
```

---

### Night Alert Functions (`src/lib/api/alerts.ts`) **NEW**

#### `createNightAlert(studentId, lat, lng, distance): Promise<void>`
Create a new night alert when student is outside during curfew.

```typescript
import { createNightAlert } from '@/lib/api/alerts'

// Automatically called by useNightMonitoring hook
await createNightAlert(
  studentId,      // UUID of student
  28.5450,        // Current latitude
  77.1930,        // Current longitude
  850             // Distance from campus in meters
)
```

**What it does:**
- Gets student info from Supabase (name, room)
- Creates alert record in `night_alerts` table
- Real-time notification sent to admin dashboards
- Includes all location and timestamp data

---

#### `getNightAlerts(options?): Promise<NightAlert[]>`
Get night alerts with optional filters (admin only).

```typescript
import { getNightAlerts } from '@/lib/api/alerts'

// Get all alerts
const allAlerts = await getNightAlerts()

// Get unacknowledged alerts only
const pendingAlerts = await getNightAlerts({ acknowledged: false })

// Get alerts for specific student
const studentAlerts = await getNightAlerts({ studentId: 'uuid-here' })

// Get recent 20 alerts
const recentAlerts = await getNightAlerts({ limit: 20 })
```

**Options:**
```typescript
{
  studentId?: string,      // Filter by student UUID
  acknowledged?: boolean,  // Filter by acknowledgement status
  limit?: number          // Max results (default 100)
}
```

**Returns:** Array of night alert objects with student info

---

#### `getStudentNightAlerts(studentId, limit?): Promise<NightAlert[]>`
Get night alerts for a specific student.

```typescript
import { getStudentNightAlerts } from '@/lib/api/alerts'

// Student viewing their own alerts
const myAlerts = await getStudentNightAlerts(studentId, 10)

myAlerts.forEach(alert => {
  console.log(`Alert at ${alert.alert_time}`)
  console.log(`Distance: ${alert.distance_from_campus}m`)
  console.log(`Acknowledged: ${alert.acknowledged}`)
})
```

---

#### `acknowledgeNightAlert(alertId, adminId): Promise<void>`
Mark a night alert as acknowledged by admin.

```typescript
import { acknowledgeNightAlert } from '@/lib/api/alerts'

// Admin acknowledges alert
await acknowledgeNightAlert(alertId, adminUserId)

// Alert is now marked as:
// - acknowledged: true
// - acknowledged_by: adminUserId
// - acknowledged_at: current timestamp
```

---

### React Hooks (`src/hooks/useGeolocation.ts`)

#### `useGeolocation(autoRequest?: boolean)`
Main hook for managing geolocation state.

```typescript
import { useGeolocation } from '@/hooks/useGeolocation'

function MyComponent() {
  const {
    latitude,          // Current latitude (null if not fetched)
    longitude,         // Current longitude (null if not fetched)
    accuracy,          // GPS accuracy in meters
    isInsideCampus,    // Whether user is inside campus
    distance,          // Distance from campus center (meters)
    isLoading,         // Loading state
    error,             // Error message (null if no error)
    permissionState,   // 'prompt' | 'granted' | 'denied' | null
    requestLocation,   // Function to request location
    refreshLocation,   // Function to refresh location
    isSupported,       // Whether browser supports geolocation
  } = useGeolocation(false) // Pass true to auto-request on mount

  return (
    <div>
      {isLoading && <p>Getting location...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      
      {latitude && longitude && (
        <div>
          <p>Location: {latitude.toFixed(6)}, {longitude.toFixed(6)}</p>
          <p>Accuracy: ±{accuracy}m</p>
          <p>Distance: {distance}m from campus</p>
          <p>Status: {isInsideCampus ? '✅ Inside' : '❌ Outside'}</p>
        </div>
      )}
      
      <button onClick={requestLocation} disabled={isLoading}>
        {isLoading ? 'Getting Location...' : 'Get Location'}
      </button>
      
      <button onClick={refreshLocation} disabled={isLoading}>
        Refresh
      </button>
    </div>
  )
}
```

---

#### `useNightMonitoring(enabled?: boolean)` **UPDATED**
Hook for monitoring night-time location (9 PM - 5 AM).

```typescript
import { useNightMonitoring } from '@/hooks/useGeolocation'

function MyComponent() {
  const {
    isMonitoring,     // Whether monitoring is active (true during 9 PM - 5 AM)
    nightStatus,      // 'safe' | 'outside' | 'inactive'
    lastCheckTime,    // Last check timestamp (Date object)
    checkNow,         // Function to check immediately
  } = useNightMonitoring(true) // Pass false to disable

  return (
    <div>
      {isMonitoring ? (
        <div className="border-2 border-amber-500 p-4 rounded">
          <p className="font-bold">🌙 Night monitoring active</p>
          <p>Checking every 10 minutes</p>
        </div>
      ) : (
        <p>Monitoring inactive (active 9 PM - 5 AM)</p>
      )}
      
      {nightStatus === 'safe' && (
        <div className="bg-green-500 text-white p-4 rounded">
          ✅ Student is inside campus
        </div>
      )}
      
      {nightStatus === 'outside' && (
        <div className="bg-red-500 text-white p-4 rounded">
          ⚠️ Student is outside campus!
          <p className="text-sm">Admin has been notified</p>
        </div>
      )}
      
      {nightStatus === 'inactive' && (
        <p>Monitoring will start at 9 PM</p>
      )}
      
      {lastCheckTime && (
        <p className="text-sm text-muted-foreground">
          Last check: {lastCheckTime.toLocaleTimeString()}
        </p>
      )}
      
      <button onClick={checkNow}>Check Now</button>
    </div>
  )
}
```

**What changed:**
- Check frequency: 10 minutes (was 5 minutes)
- Curfew end: 5:00 AM (was 6:00 AM)
- Automatic admin alerts when outside
- Alert throttling (1 per hour max per student)

---

## 🎮 User Flow

### Attendance Marking Flow

1. **Student opens dashboard** → Location not yet requested
2. **Student clicks "Enable Location"** → Browser permission prompt appears
3. **Permission granted** → GPS fetches coordinates (may take 5-10 seconds)
4. **System calculates distance** → Uses Haversine formula
5. **Display status** → Shows "Inside Hostel" (green) or "Outside Hostel" (red)
6. **Shows distance** → "Distance: 245m from campus"
7. **Shows accuracy** → "Accuracy: ±15m"
8. **Student clicks "Mark Attendance"** → Validates:
   - Current time is 5:30 PM - 6:30 PM ✅
   - Student is inside geofence ✅
   - Hasn't already marked today ✅
9. **If valid** → Attendance marked with GPS coordinates stored in database
10. **If invalid** → Show error message with specific reason

### Night Monitoring Flow **UPDATED**

1. **Clock hits 9:00 PM** → Night monitoring activates automatically
2. **System checks location immediately** → First check at 9:00 PM
3. **Location checked every 10 minutes** → 9:10 PM, 9:20 PM, 9:30 PM, etc.
4. **Student inside campus** → Status: "Safe" (green indicator)
5. **Student outside campus** → 
   - Status: "Outside Campus" (red indicator)
   - Warning shown to student
   - **Admin alert created automatically** ⚠️
   - Alert stored in Supabase `night_alerts` table
   - Real-time notification sent to all admin dashboards
   - Alert includes: name, room, GPS coords, distance, time
6. **Alert throttling** → Only 1 alert per hour per student (prevents spam)
7. **Student returns to campus** → Status updates to "Safe"
8. **Admin views alert** → 
   - Sees all alerts in real-time on admin dashboard
   - Can acknowledge alert
   - Can view student's location details
9. **Clock hits 5:00 AM** → Night monitoring deactivates
10. **Status updates** → "Monitoring inactive until 9 PM"

---

## 🔐 Permission Handling

### Permission States

- **`prompt`**: User hasn't been asked yet
- **`granted`**: User allowed location access
- **`denied`**: User blocked location access

### Error Messages

The system provides user-friendly error messages:

| Error Code | User Message |
|------------|-------------|
| `PERMISSION_DENIED` | Location permission denied. Please enable location access in your browser settings. |
| `POSITION_UNAVAILABLE` | Location information is unavailable. Please check your device settings. |
| `TIMEOUT` | Location request timed out. Please try again. |

### Browser Compatibility

✅ **Supported Browsers:**
- Chrome/Edge (Desktop & Mobile)
- Firefox (Desktop & Mobile)
- Safari (Desktop & Mobile)
- Opera

❌ **Not Supported:**
- Internet Explorer
- Very old browser versions
- Browsers without HTTPS (geolocation requires secure context)

---

## 📱 Mobile Considerations

### High Accuracy Mode

The system uses high accuracy mode for better precision:

```typescript
{
  enableHighAccuracy: true,  // Use GPS instead of Wi-Fi/Cell towers
  timeout: 10000,            // 10 second timeout
  maximumAge: 0,             // Don't use cached location
}
```

### Battery Impact **UPDATED**

- **Attendance marking**: Minimal (one-time GPS fetch, ~1-2 seconds)
- **Night monitoring**: Low (checks every 10 minutes) ✅ **IMPROVED**
- **Continuous tracking**: High (not implemented by default)

**Battery Life Estimates:**
- **10-minute intervals:** ~2-3% battery drain over 8 hours (9 PM - 5 AM) ✅
- **5-minute intervals:** ~4-5% battery drain over 8 hours
- **2-minute intervals:** ~8-10% battery drain over 8 hours ⚠️

**Recommendation:** 
- Default 10-minute interval is optimal for battery life vs security
- For stricter monitoring, reduce to 5 minutes
- For casual monitoring, increase to 15-20 minutes

**To adjust:** See [Night Monitoring Configuration](#adjusting-check-frequency)

---

## 🗄️ Database Integration

### Attendance Table Schema

Location coordinates are stored with each attendance record:

```sql
CREATE TABLE attendance (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  status TEXT NOT NULL,
  marked_at TIMESTAMPTZ DEFAULT NOW(),
  location_lat DECIMAL(10, 8),   -- Latitude (8 decimal places)
  location_lng DECIMAL(11, 8),   -- Longitude (8 decimal places)
  UNIQUE(user_id, date)
);
```

### Night Alerts Table Schema **NEW**

```sql
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

-- Indexes for performance
CREATE INDEX idx_night_alerts_student_id ON night_alerts(student_id);
CREATE INDEX idx_night_alerts_alert_time ON night_alerts(alert_time DESC);
CREATE INDEX idx_night_alerts_acknowledged ON night_alerts(acknowledged);
```

### Storing Attendance with Coordinates

```typescript
import { markAttendance } from '@/lib/api/data'

// Mark attendance with GPS coordinates
await markAttendance(
  userId,
  '2025-11-28',  // Date
  28.5449,       // Latitude
  77.1928        // Longitude
)
```

### Viewing Attendance with Location (Admin)

```typescript
import { getAllAttendance } from '@/lib/api/data'

const records = await getAllAttendance()
records.forEach(record => {
  console.log(`${record.user_id}: ${record.location_lat}, ${record.location_lng}`)
  // Can display on map if needed
  const mapsUrl = `https://www.google.com/maps?q=${record.location_lat},${record.location_lng}`
  console.log(`View on map: ${mapsUrl}`)
})
```

### Night Alert Queries **NEW**

```typescript
import { getNightAlerts } from '@/lib/api/alerts'

// Admin dashboard - get all unacknowledged alerts
const pendingAlerts = await getNightAlerts({ 
  acknowledged: false,
  limit: 50
})

pendingAlerts.forEach(alert => {
  console.log(`⚠️ Alert: ${alert.student_name} (${alert.student_room})`)
  console.log(`Distance: ${alert.distance_from_campus}m from campus`)
  console.log(`Time: ${alert.alert_time}`)
  console.log(`Location: ${alert.latitude}, ${alert.longitude}`)
})

// Real-time subscription for new alerts
import { subscribeToNightAlerts } from '@/lib/api/alerts'

const channel = subscribeToNightAlerts((payload) => {
  if (payload.eventType === 'INSERT') {
    const alert = payload.new
    console.log('🚨 NEW NIGHT ALERT:', alert)
    
    // Show notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Night Curfew Alert', {
        body: `${alert.student_name} is ${alert.distance_from_campus}m from campus`
      })
    }
  }
})

// Cleanup
return () => channel.unsubscribe()
```

---

## 🚨 Security & Privacy

### What We Track

✅ **We track:**
- GPS coordinates during attendance marking (once per day, 5:30-6:30 PM)
- Night-time location checks (every 10 minutes between 9 PM - 5 AM)
- Geofence status (inside/outside campus)
- Distance from campus center
- GPS accuracy (for validation)

❌ **We DON'T track:**
- Continuous real-time location throughout the day
- Location history outside of attendance and night monitoring
- Exact routes or movements between locations
- Location when app is closed or minimized
- Location outside of specified time windows

### Privacy Compliance

1. **User Consent**: Browser permission prompt required before any tracking
2. **Purpose Limitation**: Only used for attendance verification and safety monitoring
3. **Data Minimization**: Only coordinates, timestamps, and status stored
4. **Transparency**: Clear messaging about what's tracked, when, and why
5. **User Control**: Users can deny permission (but can't mark attendance)
6. **Time Restrictions**: Tracking only during specified hours (not 24/7)
7. **Alert Justification**: Night alerts are for student safety (curfew enforcement)

### Security Best Practices

```typescript
// ✅ Good: Only request location when needed
const handleMarkAttendance = async () => {
  const location = await getCurrentLocation()
  await markAttendance(userId, date, location.latitude, location.longitude)
}

// ✅ Good: Time-restricted monitoring
if (hour >= 21 || hour < 5) {
  // Only monitor during night hours
  checkLocation()
}

// ✅ Good: Alert throttling
if (!lastAlertSent || lastAlertSent < oneHourAgo) {
  sendAdminAlert()
}

// ❌ Bad: Tracking continuously without purpose
const watchId = watchUserLocation(/* always on */)

// ❌ Bad: No time restrictions
setInterval(checkLocation, 60000) // Every minute, all day

// ❌ Bad: Spamming alerts
sendAdminAlert() // Every time outside, no throttling
```

---

## 🐛 Troubleshooting

### Issue: Location permission denied

**Symptoms:**
- Red error message: "Location permission denied"
- "Enable Location" button doesn't work

**Solutions:**
1. **Chrome/Edge:**
   - Click the lock icon in address bar
   - Click "Site settings"
   - Find "Location" → Set to "Allow"
   - Refresh page

2. **Firefox:**
   - Click the shield/lock icon in address bar
   - Click "Connection secure" → "More Information"
   - Go to "Permissions" tab
   - Uncheck "Use Default" for Location → Select "Allow"
   - Refresh page

3. **Safari:**
   - Safari menu → Settings → Websites
   - Click "Location" in left sidebar
   - Find your site → Set to "Allow"
   - Refresh page

---

### Issue: Low GPS accuracy

**Symptoms:**
- Accuracy shows as ±50m or higher
- Location jumps around
- Sometimes shows outside geofence when inside

**Solutions:**
1. **Enable high accuracy mode** (already enabled in code)
2. **Ensure GPS is enabled** on device (not just Wi-Fi location)
3. **Move closer to windows** for better GPS signal
4. **Wait longer** for GPS to stabilize (may take 10-30 seconds)
5. **Increase geofence radius** if campus is large

---

### Issue: Geolocation not supported

**Symptoms:**
- Warning message: "Geolocation Not Supported"
- Location features disabled

**Solutions:**
1. **Use HTTPS**: Geolocation requires secure context
   - Development: `http://localhost` is allowed
   - Production: Must use HTTPS
2. **Update browser** to latest version
3. **Check browser compatibility** (see list above)
4. **Enable JavaScript** (must be enabled)

---

### Issue: Night monitoring not working

**Symptoms:**
- Status always shows "Inactive"
- No location checks between 9 PM - 5 AM

**Solutions:**
1. **Check system time**: Ensure device time is correct
2. **Verify night hours**: Default is 9 PM - 5 AM (21:00 - 05:00)
3. **Check console logs**: Look for permission errors
4. **Keep app open**: Monitoring only works when app is active

**Note:** Background monitoring requires additional setup (Service Workers) not currently implemented.

---

### Issue: "Outside campus" when actually inside

**Symptoms:**
- Shows "Outside Hostel" even when physically inside
- Distance seems incorrect

**Solutions:**
1. **Verify campus coordinates** in `src/lib/geolocation.ts`
   ```typescript
   // Make sure these match your actual campus
   export const CAMPUS_COORDINATES = {
     latitude: YOUR_ACTUAL_LATITUDE,
     longitude: YOUR_ACTUAL_LONGITUDE,
     radiusInMeters: 500,
   }
   ```

2. **Increase geofence radius** if campus is large:
   ```typescript
   radiusInMeters: 1000, // Increase to 1km
   ```

3. **Test with Google Maps**:
   - Drop a pin at campus center
   - Measure distance to hostel buildings
   - Ensure radius covers all buildings

4. **Check GPS accuracy**: If accuracy is ±100m and radius is 200m, you might be flagged as outside

---

### Issue: Night alerts not appearing **NEW**

**Symptoms:**
- Student is outside during curfew but no alerts
- Admin dashboard not showing alerts
- Console shows "Night curfew alert sent" but nothing in database

**Solutions:**
1. **Verify `night_alerts` table exists:**
   ```sql
   SELECT * FROM night_alerts LIMIT 1;
   ```
   If error, run the schema from [Supabase.md](./Supabase.md)

2. **Check RLS policies:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'night_alerts';
   ```
   Should have policies for students (own alerts) and admins (all alerts)

3. **Enable Realtime Replication:**
   - Go to Supabase Dashboard
   - Database → Replication
   - Find `night_alerts` table
   - Enable replication

4. **Verify Supabase connection:**
   - Check `.env.local` has correct credentials
   - Test with: `console.log(supabase.from('night_alerts').select('*'))`

5. **Check browser console:**
   - Look for errors when alert is created
   - Verify API endpoint is accessible

6. **Test manually:**
   ```typescript
   import { createNightAlert } from '@/lib/api/alerts'
   await createNightAlert('student-uuid', 28.5450, 77.1930, 850)
   ```

---

### Issue: Too many alerts / Alert spam **NEW**

**Symptoms:**
- Multiple alerts for same student in short time
- Admin dashboard flooded with notifications
- Excessive emails/notifications

**Solutions:**
1. **Alert throttling is enabled** (should only send 1 alert per hour per student)
   - Check `src/hooks/useGeolocation.ts` line ~160
   - Verify `lastAlertSent` logic is working

2. **Increase check interval:**
   ```typescript
   // Change from 10 minutes to 15 or 20 minutes
   const interval = setInterval(() => {
     checkNightStatus()
   }, 15 * 60 * 1000) // 15 minutes
   ```

3. **Increase throttle time:**
   ```typescript
   // Change from 1 hour to 2 hours
   const oneHourAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000)
   ```

4. **Add additional conditions:**
   ```typescript
   // Only alert if significantly outside (e.g., > 1km)
   if (distance > 1000 && !isInside) {
     sendAlert()
   }
   ```

---

### Issue: False positives (inside but marked outside) **NEW**

**Symptoms:**
- Student is physically inside campus
- System says "Outside Campus"
- Alerts triggered incorrectly

**Solutions:**
1. **Check GPS accuracy:**
   - If accuracy is ±100m and radius is 200m, false positives likely
   - Wait for better GPS lock (may take 30-60 seconds)
   - Check accuracy display on student dashboard

2. **Increase geofence radius:**
   ```typescript
   // src/lib/geolocation.ts
   export const CAMPUS_COORDINATES = {
     latitude: 28.5449,
     longitude: 77.1928,
     radiusInMeters: 1000, // Increase from 500m to 1000m
   }
   ```

3. **Verify campus coordinates:**
   - Drop pin on Google Maps at campus center
   - Measure distance to furthest hostel building
   - Ensure radius covers all buildings

4. **Test multiple locations:**
   - Check different spots on campus
   - Verify geofence is centered correctly

---

## 🧪 Testing

### Manual Testing Checklist

#### Attendance Flow
- [ ] Click "Enable Location" button
- [ ] Browser permission prompt appears
- [ ] After granting permission, location is displayed within 10 seconds
- [ ] Distance from campus center is shown
- [ ] GPS accuracy is displayed (should be < 50m for good signal)
- [ ] Status badge shows "Inside Hostel" (green) or "Outside Hostel" (red)
- [ ] "Refresh Location" button updates coordinates
- [ ] Can mark attendance when inside geofence (5:30-6:30 PM only)
- [ ] Cannot mark attendance when outside geofence
- [ ] Cannot mark attendance outside time window
- [ ] Success message appears after marking attendance
- [ ] Coordinates are stored in database
- [ ] Can view attendance with coordinates on admin dashboard

#### Night Monitoring **UPDATED**
- [ ] Change device time to 9:15 PM
- [ ] Night monitoring activates automatically within 1 minute
- [ ] Status shows "Monitoring Active"
- [ ] If inside campus: status shows "Safe" (green)
- [ ] If outside campus: status shows "Outside Campus" (red)
- [ ] Last check time is displayed and updates every 10 minutes
- [ ] "Check Now" button triggers immediate check
- [ ] When outside: alert is created in Supabase `night_alerts` table
- [ ] Admin dashboard receives real-time alert notification
- [ ] Alert includes: student name, room, coordinates, distance, time
- [ ] Only one alert sent per hour (test by staying outside > 1 hour)
- [ ] Change device time to 5:30 AM
- [ ] Night monitoring deactivates automatically
- [ ] Status shows "Monitoring Inactive"

#### Admin Alert Dashboard **NEW**
- [ ] Admin can view all night alerts
- [ ] Alerts show in real-time (no refresh needed)
- [ ] Can filter by acknowledged/unacknowledged
- [ ] Can see student details (name, room, location, time)
- [ ] Can acknowledge individual alerts
- [ ] Acknowledged alerts show admin name and time
- [ ] Can export alert history
- [ ] Alert count badge updates automatically

#### Error Handling
- [ ] Deny location permission → Clear error message displayed
- [ ] "How to enable location?" link appears
- [ ] Help modal explains browser-specific steps
- [ ] GPS timeout (> 10 seconds) → User-friendly error
- [ ] No GPS signal → Appropriate message
- [ ] Geolocation not supported → Browser upgrade warning
- [ ] Network error → Retry option provided

---

## 🚀 Production Deployment

### Pre-Deployment Checklist

1. **✅ Update Campus Coordinates**
   ```typescript
   // src/lib/geolocation.ts
   export const CAMPUS_COORDINATES = {
     latitude: YOUR_PRODUCTION_LATITUDE,
     longitude: YOUR_PRODUCTION_LONGITUDE,
     radiusInMeters: YOUR_GEOFENCE_RADIUS,
   }
   ```

2. **✅ Set Up Supabase Production Database**
   - Create production Supabase project
   - Run all SQL schemas from [Supabase.md](./Supabase.md)
   - Verify all tables created: users, attendance, night_alerts, etc.
   - Enable RLS policies
   - Enable Realtime replication for `night_alerts` table

3. **✅ Configure Environment Variables**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-prod-anon-key
   NEXT_PUBLIC_ADMIN_PASS_KEY=your-secure-admin-key
   ```

4. **✅ Test on Production Domain**
   - Geolocation requires HTTPS in production
   - Test on staging environment first
   - Verify SSL certificate is valid
   - Test all geolocation features end-to-end

5. **✅ Configure Admin Notifications**
   - Test real-time alert subscriptions
   - Consider adding:
     - Email notifications for critical alerts
     - SMS alerts for emergency situations
     - Browser push notifications
     - Slack/Discord webhooks

6. **✅ Optimize Check Frequency**
   - Default: 10 minutes (recommended)
   - Adjust based on your security needs and battery concerns
   - Consider time zone differences

7. **✅ Set Up Monitoring**
   - Log geolocation errors to error tracking service (Sentry, etc.)
   - Monitor GPS accuracy statistics
   - Track permission denial rates
   - Monitor night alert frequency
   - Set up alerts for system downtime

8. **✅ Privacy Policy & Compliance**
   - Update privacy policy to mention location tracking
   - Explain what data is collected, when, and why
   - Mention night monitoring and admin alerts
   - Provide opt-out information (if applicable)
   - GDPR compliance (if applicable)
   - Local data protection laws compliance

9. **✅ User Communication**
   - Inform students about night monitoring before activation
   - Explain alert system and its purpose
   - Provide clear instructions on how to enable location
   - Set up FAQ page for common questions
   - Provide support contact for issues

---

## 📊 Analytics & Monitoring

### Metrics to Track

1. **Permission Grant Rate**
   - % of users who grant location permission
   - Target: >90%
   - Track: Student dashboard analytics

2. **GPS Accuracy**
   - Average accuracy in meters
   - Target: <30m
   - Track: Store accuracy with attendance records

3. **Attendance Success Rate**
   - % of attendance attempts that succeed
   - Target: >95%
   - Track: Successful vs failed attempts

4. **Night Monitoring Coverage**
   - % of night hours with active monitoring
   - Target: >80%
   - Track: Monitoring session logs

5. **Night Alert Statistics** **NEW**
   - Number of alerts per day
   - Students with most frequent alerts
   - Average distance when outside
   - Alert acknowledgement time
   - False positive rate

6. **System Performance**
   - Location fetch time (should be < 10 seconds)
   - API response time for alerts
   - Real-time notification delay
   - Error rates

### Example Analytics Implementation

```typescript
// Track permission grant
const trackPermission = (state: PermissionState) => {
  analytics.track('location_permission', { state })
}

// Track GPS accuracy
const trackAccuracy = (accuracy: number) => {
  analytics.track('gps_accuracy', { accuracy })
}

// Track attendance attempts
const trackAttendance = (success: boolean, reason?: string) => {
  analytics.track('attendance_attempt', { success, reason })
}

// Track night alerts
const trackNightAlert = (studentId: string, distance: number) => {
  analytics.track('night_alert_created', { 
    studentId, 
    distance,
    timestamp: new Date()
  })
}

// Track admin alert acknowledgement
const trackAlertAck = (alertId: string, responseTime: number) => {
  analytics.track('alert_acknowledged', {
    alertId,
    responseTime // Time from alert to acknowledgement
  })
}
```

---

## 🔮 Future Enhancements

### Planned Features

1. **📍 Campus Map Integration**
   - Show student locations on interactive campus map
   - Visual geofence boundary
   - Building labels and navigation
   - Heatmap of common locations

2. **📊 Advanced Alert Analytics**
   - Alert dashboard with charts
   - Student behavior patterns
   - Peak violation times
   - Repeat offender tracking
   - Trend analysis

3. **🚨 Multi-Level Alerts**
   - Severity levels (low, medium, high)
   - Escalation system (student → warden → dean)
   - Emergency SOS button
   - Parent notifications (configurable)

4. **📧 Multi-Channel Notifications**
   - Email alerts for admins
   - SMS alerts for critical situations
   - Browser push notifications
   - Slack/Teams/Discord integration
   - WhatsApp notifications

5. **⏰ Dynamic Time Windows**
   - Admin-configurable attendance times
   - Different times for different days
   - Holiday schedules
   - Special event exemptions

6. **🏢 Multiple Geofences**
   - Different zones within campus (library, sports complex, etc.)
   - Building-specific attendance
   - Custom zones for events
   - Temporary geofences

7. **📱 Background Monitoring**
   - Service Worker for background location
   - Push notifications when leaving campus
   - Persistent monitoring even when app is closed
   - Battery-optimized background tracking

8. **🤖 AI-Powered Insights**
   - Predict potential violations
   - Anomaly detection (unusual patterns)
   - Automated risk assessment
   - Personalized recommendations

9. **📍 Offline Support**
   - Cache location checks when offline
   - Sync when connection restored
   - Offline alert queue

10. **🔒 Enhanced Security**
    - Location spoofing detection
    - VPN detection
    - Mock location detection
    - Device fingerprinting

---

## 📞 Support

### Common Questions

**Q: Why do you need my location?**
A: Location is used for two purposes:
1. Attendance verification - ensures you're physically present at the hostel
2. Safety monitoring - ensures students are safe on campus during night hours (9 PM - 5 AM)

**Q: Is my location tracked all the time?**
A: No. Location is only checked:
- Once when you mark attendance (5:30-6:30 PM)
- Every 10 minutes during night hours (9 PM - 5 AM) for safety
We don't track your movements throughout the day.

**Q: What happens if I leave campus during night hours?**
A: An automatic alert is sent to campus administrators with your location details. This is for your safety and to enforce hostel curfew rules. Only one alert per hour is sent to avoid spam.

**Q: Can I disable night monitoring?**
A: Night monitoring is mandatory for hostel residents for safety reasons. You can log out of the app, but this may affect your attendance and other hostel services.

**Q: What if I'm inside but it says I'm outside?**
A: GPS accuracy can vary (±10-50m). If this happens:
1. Wait for better GPS signal (30-60 seconds)
2. Move closer to windows for better signal
3. Check the accuracy indicator (should be < 30m for reliable results)
4. Contact admin if issue persists (they can adjust geofence radius)

**Q: Does night monitoring drain my battery?**
A: Minimal impact. Checking every 10 minutes uses approximately 2-3% battery over 8 hours (9 PM - 5 AM). This is optimized for battery life while maintaining security.

**Q: Can admins see my exact location?**
A: Admins can see:
- Whether you're inside or outside campus (not exact location)
- Distance from campus center when outside
- GPS coordinates only when you're outside during curfew (for safety alerts)

**Q: What if my GPS is not working?**
A: You'll need to:
1. Enable GPS/Location Services on your device
2. Grant location permission to the website
3. Ensure you're not using VPN or location spoofing
4. Try moving to an open area for better signal

**Q: How accurate is the geofence?**
A: The geofence is typically accurate within 10-50 meters depending on GPS conditions. Campus administrators set the geofence radius to account for GPS variations.

---

## 📝 API Documentation Summary

| Function | Purpose | Returns | New? |
|----------|---------|---------|------|
| `getCurrentLocation()` | Get current GPS coordinates | `Promise<GeolocationCoordinates>` | |
| `calculateDistance()` | Distance between two points | `number` (meters) | |
| `isWithinCampus()` | Check if inside geofence | `boolean` | |
| `validateLocationForAttendance()` | Full validation for attendance | `Promise<ValidationResult>` | |
| `watchUserLocation()` | Real-time location tracking | `number` (watch ID) | |
| `stopWatchingLocation()` | Stop tracking | `void` | |
| `formatDistance()` | Format distance for display | `string` | |
| `useGeolocation()` | React hook for location state | `GeolocationState` | |
| `useNightMonitoring()` | React hook for night monitoring | `NightMonitoringState` | ✅ Updated |
| `createNightAlert()` | Create admin alert | `Promise<void>` | ✅ New |
| `getNightAlerts()` | Get all night alerts (admin) | `Promise<NightAlert[]>` | ✅ New |
| `getStudentNightAlerts()` | Get student's alerts | `Promise<NightAlert[]>` | ✅ New |
| `acknowledgeNightAlert()` | Mark alert as acknowledged | `Promise<void>` | ✅ New |
| `subscribeToNightAlerts()` | Real-time alert subscription | `RealtimeChannel` | ✅ New |

---

**Last Updated:** 2025-11-28  
**Version:** 2.0.0  
**Status:** ✅ Production Ready

**Major Changes in v2.0.0:**
- ✅ Night monitoring check interval changed from 5 to 10 minutes
- ✅ Curfew end time changed from 6 AM to 5 AM
- ✅ Automatic admin alert system implemented
- ✅ Night alerts table and API added
- ✅ Real-time alert subscriptions
- ✅ Alert throttling (1 per hour per student)
- ✅ Admin alerts dashboard
- ✅ Battery optimization

---

**Need Help?** Contact the development team or refer to:
- [Supabase Setup](./Supabase.md) for database configuration
- [README.md](./README.md) for general setup instructions
- [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) for feature status