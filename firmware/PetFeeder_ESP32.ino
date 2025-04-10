#include <WiFi.h>
#include <ESPAsyncWebServer.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <EEPROM.h>

// Constants
#define EEPROM_SIZE 512
#define FOOD_LEVEL_PIN 34  // Analog pin on ESP32 (ADC1)
#define MOTOR_PIN 25       // GPIO25 on ESP32
#define MOTOR_DELAY_PER_GRAM 100 // ms per gram of food
#define SETUP_TOKEN "your-secret-token-1234"
#define AP_SSID "PetFeederSetup"
#define AP_PASSWORD "12345678"
#define SUPABASE_URL "YOUR_SUPABASE_URL"
#define SUPABASE_KEY "YOUR_ANON_KEY"
#define DEVICES_ENDPOINT "/rest/v1/devices"
#define HISTORY_ENDPOINT "/rest/v1/feeding_history"
#define WIFI_MAX_ATTEMPTS 20
#define RETRY_DELAY 5000 // ms

// EEPROM addresses
const int WIFI_SSID_ADDR = 0;
const int WIFI_PASS_ADDR = 64;
const int DEVICE_ID_ADDR = 128;
const int USER_ID_ADDR = 192;
const int SETUP_COMPLETE_ADDR = 256;

// Variables
String deviceId = "";
String userId = "";
bool setupComplete = false;
AsyncWebServer server(80);

// Motor control state
bool motorRunning = false;
unsigned long motorStartTime = 0;
unsigned long motorDuration = 0;

// Function prototypes
String readStringFromEEPROM(int startAddr, int maxLength);
void writeStringToEEPROM(int startAddr, const String &data);
void generateDeviceId();
bool connectToWifi(const String &ssid, const String &password);
void handleSetup(AsyncWebServerRequest *request, uint8_t *data, size_t len);
void registerDevice();
void updateDeviceStatus();
void checkForCommands();
void dispenseFood(int amount);
void recordFeeding(int amount);
void updateMotor();

void setup() {
  Serial.begin(115200);
  
  // Initialize pins
  pinMode(FOOD_LEVEL_PIN, INPUT);
  pinMode(MOTOR_PIN, OUTPUT);
  digitalWrite(MOTOR_PIN, LOW);
  
  // Initialize EEPROM
  EEPROM.begin(EEPROM_SIZE);
  
  // Check if setup is complete
  setupComplete = EEPROM.read(SETUP_COMPLETE_ADDR) == 1;
  
  if (setupComplete) {
    String savedSSID = readStringFromEEPROM(WIFI_SSID_ADDR, 63);
    String savedPassword = readStringFromEEPROM(WIFI_PASS_ADDR, 63);
    deviceId = readStringFromEEPROM(DEVICE_ID_ADDR, 63);
    userId = readStringFromEEPROM(USER_ID_ADDR, 63);
    
    Serial.println("Attempting to connect to saved WiFi...");
    if (connectToWifi(savedSSID, savedPassword)) {
      Serial.println("Connected to WiFi successfully");
      Serial.print("Device ID: ");
      Serial.println(deviceId);
      Serial.print("User ID: ");
      Serial.println(userId);
    } else {
      Serial.println("Failed to connect to saved WiFi. Switching to setup mode...");
      setupComplete = false;
      EEPROM.write(SETUP_COMPLETE_ADDR, 0);
      EEPROM.commit();
    }
  }
  
  if (!setupComplete) {
    Serial.println("Setting up access point...");
    WiFi.softAP(AP_SSID, AP_PASSWORD);
    IPAddress IP = WiFi.softAPIP();
    Serial.print("AP IP address: ");
    Serial.println(IP);
    
    // Setup server endpoints (silence unused parameter warnings)
    server.on("/setup", HTTP_POST, [](AsyncWebServerRequest *) {}, NULL, 
      [](AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t, size_t) {
        handleSetup(request, data, len);
      }
    );
    
    server.onNotFound([](AsyncWebServerRequest *request) {
      request->send(403, "text/plain", "Access Denied");
    });
    
    server.begin();
  }
}

void loop() {
  if (setupComplete) {
    if (WiFi.status() == WL_CONNECTED) {
      updateDeviceStatus();
      checkForCommands();
    } else {
      Serial.println("WiFi disconnected. Reconnecting...");
      connectToWifi(readStringFromEEPROM(WIFI_SSID_ADDR, 63), readStringFromEEPROM(WIFI_PASS_ADDR, 63));
    }
    updateMotor(); // Non-blocking motor control
    delay(100); // Reduced delay for responsiveness
  }
}

String readStringFromEEPROM(int startAddr, int maxLength) {
  String result;
  for (int i = 0; i < maxLength; i++) {
    char c = EEPROM.read(startAddr + i);
    if (c == 0) break;
    result += c;
  }
  return result;
}

void writeStringToEEPROM(int startAddr, const String &data) {
  for (unsigned int i = 0; i < data.length(); i++) {
    EEPROM.write(startAddr + i, data[i]);
  }
  EEPROM.write(startAddr + data.length(), 0);
  EEPROM.commit();
}

void generateDeviceId() {
  const char charset[] = "0123456789abcdef";
  deviceId = "pf-";
  for (int i = 0; i < 16; i++) {
    deviceId += charset[random(16)];
  }
}

bool connectToWifi(const String &ssid, const String &password) {
  Serial.println("Connecting to WiFi...");
  WiFi.begin(ssid.c_str(), password.c_str());
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < WIFI_MAX_ATTEMPTS) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  return WiFi.status() == WL_CONNECTED;
}

void handleSetup(AsyncWebServerRequest *request, uint8_t *data, size_t len) {
  if (!request->hasHeader("X-Setup-Token") || 
      request->header("X-Setup-Token") != SETUP_TOKEN) {
    request->send(403, "text/plain", "Invalid token");
    return;
  }
  
  JsonDocument doc;
  DeserializationError error = deserializeJson(doc, data, len);
  if (error) {
    request->send(400, "text/plain", "Invalid JSON");
    Serial.println("JSON parse error: " + String(error.c_str()));
    return;
  }
  
  String ssid = doc["ssid"] | "";
  String password = doc["password"] | "";
  String userIdFromRequest = doc["user_id"] | "";
  
  if (ssid.isEmpty() || password.isEmpty() || userIdFromRequest.isEmpty()) {
    request->send(400, "text/plain", "Missing parameters");
    return;
  }
  
  if (!connectToWifi(ssid, password)) {
    request->send(400, "text/plain", "Failed to connect to WiFi");
    return;
  }
  
  if (deviceId.isEmpty()) {
    generateDeviceId();
  }
  
  writeStringToEEPROM(WIFI_SSID_ADDR, ssid);
  writeStringToEEPROM(WIFI_PASS_ADDR, password);
  writeStringToEEPROM(DEVICE_ID_ADDR, deviceId);
  writeStringToEEPROM(USER_ID_ADDR, userIdFromRequest);
  EEPROM.write(SETUP_COMPLETE_ADDR, 1);
  EEPROM.commit();
  
  userId = userIdFromRequest;
  setupComplete = true;
  
  registerDevice();
  
  JsonDocument responseDoc;
  responseDoc["success"] = true;
  responseDoc["device_id"] = deviceId;
  
  String responseJson;
  serializeJson(responseDoc, responseJson);
  
  request->send(200, "application/json", responseJson);
  
  WiFi.softAPdisconnect(true);
  WiFi.mode(WIFI_STA);
}

void registerDevice() {
  if (WiFi.status() != WL_CONNECTED) return;
  
  HTTPClient http;
  
  http.begin(String(SUPABASE_URL) + DEVICES_ENDPOINT);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("apikey", SUPABASE_KEY);
  http.addHeader("Authorization", "Bearer " + String(SUPABASE_KEY));
  
  JsonDocument doc;
  doc["device_id"] = deviceId;
  doc["user_id"] = userId;
  doc["device_name"] = "Pet Feeder";
  JsonObject lastStatus = doc["last_status"].to<JsonObject>();
  lastStatus["food_level"] = 100;
  
  String requestBody;
  serializeJson(doc, requestBody);
  
  int httpResponseCode = http.POST(requestBody);
  
  if (httpResponseCode > 0) {
    Serial.println("Device registered successfully");
    Serial.println(http.getString());
  } else {
    Serial.print("Error registering device: ");
    Serial.println(httpResponseCode);
  }
  
  http.end();
}

void updateDeviceStatus() {
  if (WiFi.status() != WL_CONNECTED) return;
  
  int foodLevel = map(analogRead(FOOD_LEVEL_PIN), 0, 4095, 0, 100); // ESP32 ADC range 0-4095
  
  HTTPClient http;
  
  String endpoint = String(SUPABASE_URL) + DEVICES_ENDPOINT + "?device_id=eq." + deviceId;
  http.begin(endpoint);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("apikey", SUPABASE_KEY);
  http.addHeader("Authorization", "Bearer " + String(SUPABASE_KEY));
  http.addHeader("Prefer", "return=minimal");
  
  JsonDocument doc;
  JsonObject lastStatus = doc["last_status"].to<JsonObject>();
  lastStatus["food_level"] = foodLevel;
  lastStatus["wifi_strength"] = WiFi.RSSI();
  lastStatus["last_update"] = String(millis() / 1000);
  
  String requestBody;
  serializeJson(doc, requestBody);
  
  int httpResponseCode = http.PATCH(requestBody);
  
  if (httpResponseCode <= 0) {
    Serial.print("Error updating device status: ");
    Serial.println(httpResponseCode);
  }
  
  http.end();
}

void checkForCommands() {
  if (WiFi.status() != WL_CONNECTED) return;
  
  HTTPClient http;
  
  String endpoint = String(SUPABASE_URL) + DEVICES_ENDPOINT + "?select=last_status&device_id=eq." + deviceId;
  http.begin(endpoint);
  http.addHeader("apikey", SUPABASE_KEY);
  http.addHeader("Authorization", "Bearer " + String(SUPABASE_KEY));
  
  int httpResponseCode = http.GET();
  
  if (httpResponseCode > 0) {
    String response = http.getString();
    
    JsonDocument doc;
    DeserializationError error = deserializeJson(doc, response);
    if (error) {
      Serial.println("JSON parse error: " + String(error.c_str()));
      return;
    }
    
    if (doc.is<JsonArray>() && doc.size() > 0) {
      JsonObject lastStatus = doc[0]["last_status"];
      
      if (lastStatus["command"] == "dispense") {
        int amount = lastStatus["command_amount"] | 10;
        dispenseFood(amount);
        
        HTTPClient clearHttp;
        clearHttp.begin(endpoint.substring(0, endpoint.indexOf("?")));
        clearHttp.addHeader("Content-Type", "application/json");
        clearHttp.addHeader("apikey", SUPABASE_KEY);
        clearHttp.addHeader("Authorization", "Bearer " + String(SUPABASE_KEY));
        clearHttp.addHeader("Prefer", "return=minimal");
        
        JsonDocument clearDoc;
        JsonObject clearStatus = clearDoc["last_status"].to<JsonObject>();
        clearStatus["food_level"] = map(analogRead(FOOD_LEVEL_PIN), 0, 4095, 0, 100);
        clearStatus["wifi_strength"] = WiFi.RSSI();
        clearStatus["last_update"] = String(millis() / 1000);
        
        String clearBody;
        serializeJson(clearDoc, clearBody);
        
        clearHttp.PATCH(clearBody);
        clearHttp.end();
        
        recordFeeding(amount);
      }
    }
  } else {
    Serial.print("Error checking for commands: ");
    Serial.println(httpResponseCode);
  }
  
  http.end();
}

void dispenseFood(int amount) {
  if (amount < 1 || amount > 100) amount = 10; // Validate amount
  Serial.print("Dispensing food: ");
  Serial.print(amount);
  Serial.println("g");
  
  motorDuration = amount * MOTOR_DELAY_PER_GRAM;
  motorStartTime = millis();
  motorRunning = true;
  digitalWrite(MOTOR_PIN, HIGH);
}

void updateMotor() {
  if (motorRunning && (millis() - motorStartTime >= motorDuration)) {
    digitalWrite(MOTOR_PIN, LOW);
    motorRunning = false;
  }
}

void recordFeeding(int amount) {
  if (WiFi.status() != WL_CONNECTED) return;
  
  HTTPClient http;
  http.begin(String(SUPABASE_URL) + HISTORY_ENDPOINT);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("apikey", SUPABASE_KEY);
  http.addHeader("Authorization", "Bearer " + String(SUPABASE_KEY));
  
  JsonDocument doc;
  doc["device_id"] = deviceId;
  doc["time"] = "now()";
  doc["amount"] = amount;
  doc["manual"] = true;
  
  String requestBody;
  serializeJson(doc, requestBody);
  
  int httpResponseCode = http.POST(requestBody);
  
  if (httpResponseCode <= 0) {
    Serial.print("Error recording feeding: ");
    Serial.println(httpResponseCode);
  }
  
  http.end();
}
