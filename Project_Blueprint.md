I'm building a comprehensive "Automatic Pet Feeder" web application and device system with React, ESP32/ESP8266, and Supabase. The app is hosted at https://github.com/Redwan002117/Smart_Pet_Feeder, and I’m using GitHub Copilot to assist. The application should combine a user-friendly frontend with device setup and real-time functionality. Here’s the full specification:

### Tech Stack
- **Frontend**: React, JavaScript/TypeScript, CSS
- **Backend**: Supabase (database, authentication, real-time API)
- **Hardware**: ESP32/ESP8266 for the pet feeder device
- **Design**: Responsive (mobile, tablet, desktop), iOS-like UI with smooth animations, notifications, and transitions
- **Icons**: Animated SVGs from https://icons.pqoqubbw.dev
- **Subdomain**: `petfeeder.redwancodes.com` (separate folder, not using `public/index.html`)

### Core Application Features
1. **Landing/Home Page**:
   - Hero section with value proposition
   - Navigation: Dashboard (registered users) or Login (guests)
   - Features overview/documentation
   - Registration CTA
2. **Authentication**:
   - Login: Email/username, password, social logins (Google, Facebook, Apple, GitHub), Supabase Magic Link
   - Registration: Username required for Google sign-ins
   - Features: Remember me, auto-fill, session persistence
3. **Header Component** (all pages):
   - Left: Logo
   - Right: Theme switcher, notification preview, profile dropdown (Profile, Settings, Logout)
   - Left-side responsive navigation
4. **Dashboard**:
   - Device status: Connectivity, Wi-Fi signal, last seen, active status
   - Feeding controls: Tabs for scheduled/manual feeding
   - Next 2 scheduled feedings
   - Feeding history with pagination
   - Interactive charts (feeding patterns)
5. **Devices Management**:
   - Add/remove devices
   - Per-device view: Wi-Fi signal, network switching, battery/food levels, status, firmware updates
6. **Pets Management**:
   - Add/edit pet profiles
   - Health tracking forms
   - Feeding recommendations
7. **Schedule Management**:
   - Create schedules
   - View upcoming/past schedules with filters
8. **Profile Page**:
   - Left: Profile picture (uploadable), account creation date
   - Right: Editable name/username, fixed email, role, verification status, role change request
9. **Settings Page**:
   - Notifications: Push/email toggles
   - Security: Password change, 2FA, profile deletion, session management
10. **Admin Features** (role-restricted):
    - Dashboard: Metrics (active/verified users, devices, pets, system health)
    - User management: Create/list users, assign roles, delete
    - Settings: SMTP, Wi-Fi, UI customization, maintenance mode, global 2FA
11. **Navigation Bar** (left-side):
    - Normal: Dashboard, Devices, Schedule, Pets, Feeding History, Analytics
    - Admin: + User Management, Admin Settings, SMTP, Themes & Fonts

### Device Setup Workflow
1. User signs up in the app; Supabase generates a unique user ID.
2. ESP32/ESP8266 powers on, creates AP "PetFeederSetup" (password: "12345678").
3. App connects to AP, sends WiFi credentials to `http://192.168.4.1/setup` (POST, header `X-Setup-Token: your-secret-token-1234`, JSON body `{ssid, password}`). Endpoint only accessible from app.
4. ESP validates token, connects to WiFi, registers a unique `device_id` with Supabase.
5. Device communicates with Supabase for real-time status/commands.

### Requirements
- Supabase schema: Users (`auth.users`), Devices (`device_id`, `user_id`, `device_name`, `last_status`, RLS)
- Real-time updates for device status/feedings
- Responsive, iOS-like design with animations
- Form validation, error handling, notifications
- Fast-loading pages, SVGs for icons
- Security: Role-based access, proper auth
- Data viz: Charts for feeding patterns, pet health, device status
- Aesthetic: Warm colors, rounded corners, pet-friendly vibe
- Admin: petfeeder@redwancodes.com, @GamerNo002117

I’ll break this into sections with checkpoints. If token limits are hit, stop at the checkpoint and wait for me to say "continue" to resume.

---

### Section 1: Supabase Setup
- Create schema:
  - `auth.users` (Supabase Auth, `id` UUID)
  - `devices` table: `device_id` (UUID, default `uuid_generate_v4()`), `user_id` (UUID, references `auth.users(id)`), `device_name` (TEXT), `created_at` (TIMESTAMP, default `NOW()`), `last_status` (JSONB)
  - RLS on `devices`: Policy "Users can access own devices" (`auth.uid() = user_id`)
- Enable Realtime on `devices`
- Initialize Supabase client in `src/supabaseClient.js` with placeholders for URL/anon key

**Checkpoint**: Stop here if token limit reached. Wait for "continue" to move to Section 2.

---

### Section 2: ESP32/ESP8266 Firmware
- Libraries: `WiFi.h`, `ESPAsyncWebServer.h`, `HTTPClient.h`, `ArduinoJson.h`
- On boot:
  - AP: "PetFeederSetup", "12345678"
  - POST `/setup` at `192.168.4.1`:
    - Check `X-Setup-Token: your-secret-token-1234`
    - Accept JSON `{ssid, password}`
    - Connect to WiFi if valid
  - Deny other requests (403)
- After WiFi:
  - Generate `device_id` (random hex)
  - POST to Supabase `/rest/v1/devices` with `device_id`, `user_id` (from app), `device_name`
  - Every 5s: PATCH `last_status` (e.g., `food_level`), GET commands (e.g., `dispense`)
- Use Supabase URL/anon key placeholders

**Checkpoint**: Stop here if token limit reached. Wait for "continue" to move to Section 3.

---

### Section 3: React App - Core Structure & Auth
- Directory: `petfeeder.redwancodes.com` (separate folder)
- `src/supabaseClient.js`: `createClient('YOUR_SUPABASE_URL', 'YOUR_ANON_KEY')`
- `src/App.js`: Router with:
  - `/`: Landing (hero, features, CTA)
  - `/login`: Form (email/password, social, Magic Link), session persistence
  - `/signup`: Form (email, password, username for Google), redirect to dashboard
- Style: iOS-like, warm colors, rounded corners

**Checkpoint**: Stop here if token limit reached. Wait for "continue" to move to Section 4.

---

### Section 4: Header & Navigation
- `src/components/Header.js`:
  - Left: Logo
  - Right: Theme toggle, notification icon, profile dropdown (Profile, Settings, Logout)
- `src/components/NavBar.js` (left-side):
  - Normal: Dashboard, Devices, Schedule, Pets, Feeding History, Analytics
  - Admin: + User Management, Admin Settings, SMTP, Themes & Fonts
- Responsive, animated icons from https://icons.pqoqubbw.dev

**Checkpoint**: Stop here if token limit reached. Wait for "continue" to move to Section 5.

---

### Section 5: Dashboard & Device Setup
- `src/Dashboard.js`:
  - Device status block (connectivity, Wi-Fi, last seen, active)
  - Feeding tabs (scheduled/manual), next 2 schedules, history (paginated)
  - Charts (feeding patterns, line chart)
- `src/DeviceSetup.js`:
  - Form: SSID, password
  - POST to `http://192.168.4.1/setup` with `X-Setup-Token`, register `device_id` in Supabase
- Real-time: Subscribe to `devices` table updates

**Checkpoint**: Stop here if token limit reached. Wait for "continue" to move to Section 6.

---

### Section 6: Devices & Pets Management
- `src/Devices.js`:
  - Add/remove devices, per-device view (Wi-Fi, battery, food level, status, firmware)
- `src/Pets.js`:
  - Add/edit pets, health tracking, feeding recommendations
- Use Supabase for data storage/retrieval

**Checkpoint**: Stop here if token limit reached. Wait for "continue" to move to Section 7.

---

### Section 7: Schedule & Profile
- `src/Schedule.js`:
  - Create schedules, view upcoming/past with filters
- `src/Profile.js`:
  - Left: Picture (upload), creation date
  - Right: Editable name/username, fixed email, role, verification, role request
- Form validation, notifications

**Checkpoint**: Stop here if token limit reached. Wait for "continue" to move to Section 8.

---

### Section 8: Settings & Admin Features
- `src/Settings.js`:
  - Notifications: Push/email toggles
  - Security: Password, 2FA, deletion, sessions
- `src/AdminDashboard.js` (role-restricted):
  - Metrics (users, devices, pets), charts
  - User management: Create, list, assign roles, delete
  - Settings: SMTP, Wi-Fi, UI, maintenance, 2FA enforcement
- Role-based access via Supabase RLS

**Checkpoint**: Stop here if token limit reached. Wait for "continue" to confirm completion.

---

### Final Notes
- Use placeholders for Supabase URL, anon key, admin credentials (petfeeder@redwancodes.com, @GamerNo002117)
- Implement error handling, fast loading, security
- Track progress step-by-step
- Start coding now!
