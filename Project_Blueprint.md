I'm building a comprehensive "Automatic Pet Feeder" web application and device system with the following specifications. The app is hosted in my GitHub repo: https://github.com/Redwan002117/Smart_Pet_Feeder, and I’m using GitHub Copilot to assist with coding. The tech stack includes React (JavaScript/TypeScript, CSS) for the frontend, Supabase for the backend (database, authentication, real-time API), and an ESP32/ESP8266 for the pet feeder device. The app should have a pet-friendly aesthetic with a warm color palette, iOS-style animations, push notifications, rounded corners, and intuitive iconography from https://icons.pqoqubbw.dev. The device setup must be secure and app-only. Here’s the full scope:

---

### Tech Stack and General Requirements
- **Frontend**: React, JavaScript/TypeScript, CSS
- **Backend**: Supabase (database, auth, real-time API)
- **Device**: ESP32/ESP8266 with Arduino firmware
- **Design**: Responsive (mobile, tablet, desktop), iOS-like animations, warm colors, rounded corners, clean UI
- **Features**: Real-time updates, form validation, error handling, notifications, role-based access, fast loading
- **Icons**: Use animated SVGs from https://icons.pqoqubbw.dev
- **Subdomain**: `petfeeder.redwancodes.com` in a separate folder (not `public/index.html`)
- **Admin**: Email: `petfeeder@redwancodes.com`, Username: `@GamerNo002117`

I’ll provide detailed requirements in sections. If you hit a token limit, stop at the end of the current section and wait for me to say "continue" to proceed to the next section.

---

### Section 1: Supabase Database Setup
Set up the Supabase backend:
- **Auth**: Use Supabase Auth for user management (`auth.users` table with `id` as UUID).
- **Schema**:
  - `devices` table:
    - `device_id` (UUID, primary key, default `uuid_generate_v4()`),
    - `user_id` (UUID, references `auth.users(id)`),
    - `device_name` (TEXT),
    - `created_at` (TIMESTAMP, default `NOW()`),
    - `last_status` (JSONB, e.g., `{"food_level": 50, "command": "dispense"}`).
  - `pets` table:
    - `pet_id` (UUID, primary key, default `uuid_generate_v4()`),
    - `user_id` (UUID, references `auth.users(id)`),
    - `name` (TEXT),
    - `health_data` (JSONB, e.g., `{"weight": 5, "age": 2}`).
  - `schedules` table:
    - `schedule_id` (UUID, primary key, default `uuid_generate_v4()`),
    - `device_id` (UUID, references `devices(device_id)`),
    - `user_id` (UUID, references `auth.users(id)`),
    - `time` (TIMESTAMP),
    - `amount` (INTEGER).
  - `feeding_history` table:
    - `feed_id` (UUID, primary key, default `uuid_generate_v4()`),
    - `device_id` (UUID, references `devices(device_id)`),
    - `time` (TIMESTAMP),
    - `amount` (INTEGER).
- **RLS**: Enable Row-Level Security on all tables:
  - Policy: "Users can access their own data" (`auth.uid() = user_id`).
- **Realtime**: Enable on `devices`, `schedules`, and `feeding_history` tables.
- Use placeholders for Supabase URL and anon key (e.g., `YOUR_SUPABASE_URL`, `YOUR_ANON_KEY`).

**Checkpoint**: Stop here if token limit is reached. Wait for "continue" to move to Section 2.

---

### Section 2: ESP32/ESP8266 Firmware
Write Arduino code for the ESP32/ESP8266:
- **Libraries**: `WiFi.h`, `ESPAsyncWebServer.h`, `HTTPClient.h`, `ArduinoJson.h`.
- **Setup**:
  - Start AP: SSID "PetFeederSetup", password "12345678".
  - POST endpoint `/setup` at `192.168.4.1`:
    - Require header `X-Setup-Token: your-secret-token-1234`.
    - Accept JSON body: `{"ssid": "...", "password": "..."}`.
    - Validate token, store credentials, connect to WiFi.
  - Deny other requests (e.g., GET `/`) with 403 "Access Denied".
- **Post-Setup**:
  - Generate `device_id` (e.g., random hex string).
  - POST to Supabase `/rest/v1/devices` with `device_id`, `user_id` (from app), `device_name: "Pet Feeder"`.
  - Every 5 seconds:
    - PATCH `last_status` with `food_level` (e.g., `analogRead(34)`).
    - GET `last_status`, check for `"command": "dispense"`, simulate action (e.g., delay).
- Use placeholders for Supabase URL and anon key.

**Checkpoint**: Stop here if token limit is reached. Wait for "continue" to move to Section 3.

---

### Section 3: React App - Project Structure and Setup
Set up the React app in `Smart_Pet_Feeder`:
- **Folder Structure**:
  - `src/components/` (Header, etc.)
  - `src/pages/` (Home, Login, Dashboard, etc.)
  - `src/styles/` (CSS with warm palette, rounded corners)
  - `src/subabaseClient.js` (Supabase initialization)
  - `petfeeder.redwancodes.com/` (separate folder for subdomain build)
- **Dependencies**: Install `react`, `react-router-dom`, `@supabase/supabase-js`, `chart.js`, `react-chartjs-2`.
- **supabaseClient.js**:
  ```javascript
  import { createClient } from '@supabase/supabase-js';
  const supabaseUrl = 'YOUR_SUPABASE_URL';
  const supabaseAnonKey = 'YOUR_ANON_KEY';
  export const supabase = createClient(supabaseUrl, supabaseAnonKey);
CSS: Global styles with iOS-like transitions, warm colors (e.g., #FFD700, #FF6347).
Checkpoint: Stop here if token limit is reached. Wait for "continue" to move to Section 4.

Section 4: React App - Authentication Pages
Implement authentication:

Login (src/pages/Login.js):
Fields: email, password, "Remember Me" checkbox.
Buttons: Login, Google/Facebook/Apple/GitHub (Supabase social auth), Magic Link.
Session persistence with Supabase auth.
Signup (src/pages/SignUp.js):
Fields: email, password, username (required for Google sign-ins).
Supabase signUp(), redirect to login on success.
Animations: Fade-in forms, smooth button transitions.
Checkpoint: Stop here if token limit is reached. Wait for "continue" to move to Section 5.

Section 5: React App - Header Component
Create a reusable header:

File: src/components/Header.js
Layout:
Left: Logo (SVG from https://icons.pqoqubbw.dev).
Right: Theme toggle, notification icon (preview), profile dropdown (Profile, Settings, Logout).
Sidebar (left): Navigation links (Dashboard, Devices, etc.), responsive collapse on mobile.
Style: Fixed position, warm background, iOS-style shadow.
Checkpoint: Stop here if token limit is reached. Wait for "continue" to move to Section 6.

Section 6: React App - Landing/Home Page
Build the home page:

File: src/pages/Home.js
Sections:
Hero: Value proposition ("Feed your pet effortlessly!"), CTA button (Register).
Features: Cards with icons (e.g., scheduling, real-time monitoring).
Navigation: Redirect to Dashboard if logged in, else Login.
Design: Full-width hero, animated SVGs, smooth scroll.
Checkpoint: Stop here if token limit is reached. Wait for "continue" to move to Section 7.

Section 7: React App - Dashboard Page
Create the dashboard:

File: src/pages/Dashboard.js
Components:
Device status: Connectivity, WiFi signal, last seen, active status.
Feeding controls: Tabs (Manual, Scheduled), "Dispense" button.
Schedules: Show 2 nearest upcoming feedings.
History: Paginated log of past feedings.
Charts: Line chart for feeding trends (Chart.js).
Realtime: Subscribe to devices and feeding_history tables.
Checkpoint: Stop here if token limit is reached. Wait for "continue" to move to Section 8.

Section 8: React App - Device Setup and Management
Add device features:

Setup (src/pages/DeviceSetup.js):
Form: SSID, password.
POST to http://192.168.4.1/setup with X-Setup-Token: your-secret-token-1234.
Register device in Supabase with device_id, user_id.
Management (src/pages/Devices.js):
List devices with: WiFi strength, network switcher, battery/food levels, status, firmware update button.
Add/remove devices.
Checkpoint: Stop here if token limit is reached. Wait for "continue" to move to Section 9.

Section 9: React App - Pets and Schedule Management
Implement pet and schedule features:

Pets (src/pages/Pets.js):
Add/edit profiles: Name, health data (weight, age).
Recommendations based on health (e.g., feeding amount).
Schedules (src/pages/Schedule.js):
Create schedules: Time, amount, device.
View upcoming schedules with filters.
Past feeding log with search.
Checkpoint: Stop here if token limit is reached. Wait for "continue" to move to Section 10.

Section 10: React App - Profile and Settings
Build user pages:

Profile (src/pages/Profile.js):
Left: Profile picture (uploadable), creation date.
Right: Editable name/username, fixed email, role, verification status, role change request.
Settings (src/pages/Settings.js):
Notifications: Push/email toggles.
Security: Password change, 2FA setup, session management, profile deletion.
Checkpoint: Stop here if token limit is reached. Wait for "continue" to move to Section 11.

Section 11: React App - Admin Features
Add admin-only features:

Dashboard (src/pages/AdminDashboard.js):
Metrics: Active/verified users, devices, pets, system health (charts).
User Management (src/pages/UserManagement.js):
List users: Pictures, usernames, status, roles, delete option.
Settings (src/pages/AdminSettings.js):
SMTP config, WiFi management, UI customization, maintenance mode, 2FA enforcement.
Navigation: Add admin links (User Management, Admin Settings, SMTP, Themes).
Checkpoint: Stop here if token limit is reached. Wait for "continue" to confirm completion.

Final Notes
Use TypeScript where possible for type safety.
Implement push notifications with Supabase Realtime and browser APIs.
Add form validation (e.g., email format, required fields).
Use Chart.js for data visualization (line for trends, bar for comparisons).
Deploy to petfeeder.redwancodes.com in a separate folder.
Track progress with comments in code.
Start coding now!