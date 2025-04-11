# Smart Pet Feeder

A comprehensive IoT solution for automated pet feeding with real-time monitoring and control.

<img src="https://github.com/Redwan002117/Smart_Pet_Feeder/blob/main/Smart_Pet_Feeder_Banner.png"/>![Smart Pet Feeder]

## Overview

Smart Pet Feeder is a full-stack application that connects physical pet feeder devices (powered by ESP32/ESP8266 microcontrollers) with a responsive web platform. It allows pet owners to schedule feedings, dispense food remotely, monitor food levels, and track feeding history - all in real-time.

## Features

- **User Authentication**: Secure sign-up/login with email, password, social providers, and magic links
- **Device Management**: Easy setup and management of pet feeder devices
- **Feeding Control**: Manual and scheduled feeding options
- **Pet Profiles**: Track pet information and get feeding recommendations
- **Real-time Monitoring**: Live updates on food levels and device status
- **Feeding History**: Comprehensive logs and analytics
- **Mobile Responsive**: Works on phones, tablets, and desktops
- **Admin Panel**: User management and system monitoring

## Tech Stack

### Frontend
- **Framework**: React with TypeScript
- **Routing**: React Router Dom
- **Styling**: Custom CSS with iOS-like animations
- **Charts**: Chart.js with react-chartjs-2
- **Icons**: SVG icons from [icons.pqoqubbw.dev](https://icons.pqoqubbw.dev)

### Backend
- **Database & Auth**: Supabase (PostgreSQL)
- **API**: Supabase REST API
- **Real-time**: Supabase Realtime for live updates
- **Storage**: Supabase Storage for user uploads

### Hardware
- **Microcontroller**: ESP32 or ESP8266 (WeMos D1 Mini compatible)
- **Firmware**: Arduino-based custom firmware
- **Sensors**: Analog food level sensor
- **Actuators**: Motor control for food dispensing

## Installation

### Prerequisites
- Node.js (v14+)
- npm or yarn
- Arduino IDE (for device firmware)
- Supabase account

### Web Application Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/Redwan002117/Smart_Pet_Feeder.git
   cd Smart_Pet_Feeder
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with your Supabase credentials:
   ```
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```bash
   npm start
   ```

### Hardware Setup
1. Open the Arduino IDE
2. Install required libraries:
   - ESP8266WiFi/WiFi (depending on your device)
   - ESPAsyncWebServer
   - ESP8266HTTPClient/HTTPClient
   - ArduinoJson
3. Open the firmware file: `firmware/PetFeeder.ino` (for ESP8266) or `firmware/PetFeeder_ESP32.ino` (for ESP32)
4. Update the Supabase credentials in the firmware
5. Connect your ESP device and upload the firmware

## Database Setup

1. Create a new Supabase project
2. Set up the following tables with proper relationships:
   - `devices`
   - `pets`
   - `schedules`
   - `feeding_history`
   - `profiles` (through the auth system)
3. Enable Row Level Security (RLS) on all tables
4. Enable Realtime functionality for `devices`, `schedules`, and `feeding_history` tables

## Usage

### Device Setup
1. Power on your Smart Pet Feeder device (ESP8266/ESP32)
2. Connect to the "PetFeederSetup" WiFi network from your phone/computer
3. Go to "Device Setup" in the web app
4. Enter your home WiFi credentials
5. The device will connect to your network and register with the system

### Feeding Your Pet
- **Manual Feeding**: Use the "Dispense Now" button on the Dashboard or Devices page
- **Scheduled Feeding**: Create feeding schedules in the Schedule page
- **Monitor**: Check the Dashboard for real-time updates on food level and device status

## Project Structure

```
Smart_Pet_Feeder/
├── firmware/                  # Arduino firmware for ESP devices
│   ├── PetFeeder.ino          # ESP8266 firmware
│   └── PetFeeder_ESP32.ino    # ESP32 firmware
├── src/
│   ├── components/            # Reusable UI components
│   ├── pages/                 # Page components
│   ├── styles/                # CSS stylesheets
│   ├── types/                 # TypeScript type definitions
│   ├── utils/                 # Utility functions
│   ├── supabaseClient.js      # Supabase initialization
│   └── App.tsx                # Main app component
├── public/                    # Static files
└── README.md                  # Project documentation
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Icons provided by [icons.pqoqubbw.dev](https://icons.pqoqubbw.dev)
- Special thanks to GitHub Copilot for development assistance
