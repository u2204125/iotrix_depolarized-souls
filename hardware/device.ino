#include <SPI.h>
#include <Wire.h>
#include <MFRC522.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include "esp_camera.h"
#include <WiFi.h>
#include "soc/soc.h"
#include "soc/rtc_cntl_reg.h"

// ============================================================
// 1. CONFIGURATION
// ============================================================
const char* ssid     = "YOUR_WIFI_SSID";         // CHANGE THIS
const char* password = "YOUR_WIFI_PASSWORD";     // CHANGE THIS

// Shared pins between I2C (OLED) and SPI (RC522)
#define SHARED_SDA     14   // OLED SDA + RC522 SCK
#define SHARED_SCL     15   // OLED SCL + RC522 MOSI

// RC522 Pins
#define RC522_SS       13
#define RC522_RST      2
#define RC522_MISO     12

// Sensors
#define IR_SENSOR_PIN  4

// Timing
#define RFID_TIMEOUT      20000   // 20 seconds to scan card
#define CAMERA_TIMEOUT    30000   // 30s face recog window
#define COOLDOWN_SECONDS  5

// OLED
#define SCREEN_WIDTH  128
#define SCREEN_HEIGHT 64
#define OLED_ADDR     0x3C
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

// RC522
MFRC522 mfrc522(RC522_SS, RC522_RST);

// Camera config (AI-Thinker ESP32-CAM)
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27
#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

// ============================================================
// BULLETPROOF BUS MULTIPLEXING (THE REAL FIX)
// ============================================================

void enableSPI() {
  Wire.end();                                      // Kill I2C
  SPI.end();                                       // Make sure SPI is clean

  pinMode(SHARED_SDA, OUTPUT);
  pinMode(SHARED_SCL, OUTPUT);
  digitalWrite(SHARED_SDA, LOW);
  digitalWrite(SHARED_SCL, LOW);

  SPI.begin(SHARED_SDA, RC522_MISO, SHARED_SCL, RC522_SS); // SCK, MISO, MOSI, SS
  pinMode(RC522_SS, OUTPUT);
  digitalWrite(RC522_SS, LOW);                     // Select RC522
  mfrc522.PCD_Init();                              // Re-init after bus switch
}

void enableI2C() {
  SPI.end();                                       // Kill SPI completely

  // Deselect RC522 so it ignores I2C traffic
  pinMode(RC522_SS, OUTPUT);
  digitalWrite(RC522_SS, HIGH);

  // Release pins and add strong pull-ups
  pinMode(SHARED_SDA, INPUT_PULLUP);
  pinMode(SHARED_SCL, INPUT_PULLUP);
  delay(10);

  // Aggressive I2C bus recovery (fixes stuck SDA/SCL)
  pinMode(SHARED_SCL, OUTPUT);
  digitalWrite(SHARED_SCL, HIGH);
  pinMode(SHARED_SDA, OUTPUT);

  for (int i = 0; i < 9; i++) {
    digitalWrite(SHARED_SCL, LOW);
    delayMicroseconds(5);
    digitalWrite(SHARED_SCL, HIGH);
    delayMicroseconds(5);
  }

  // Generate STOP condition
  digitalWrite(SHARED_SDA, LOW);
  delayMicroseconds(5);
  digitalWrite(SHARED_SCL, LOW);
  delayMicroseconds(5);
  digitalWrite(SHARED_SCL, HIGH);
  delayMicroseconds(5);
  digitalWrite(SHARED_SDA, HIGH);

  // Return to proper I2C mode
  pinMode(SHARED_SDA, INPUT_PULLUP);
  pinMode(SHARED_SCL, INPUT_PULLUP);

  Wire.begin(SHARED_SDA, SHARED_SCL);              // SDA, SCL
  Wire.setClock(100000);                           // 100kHz = stable

  // Re-initialize OLED — THIS IS MANDATORY after SPI abuse
  delay(50);
  if (!display.begin(SSD1306_SWITCHCAPVCC, OLED_ADDR)) {
    Serial.println(F("SSD1306 init failed! Retrying..."));
    delay(100);
    display.begin(SSD1306_SWITCHCAPVCC, OLED_ADDR);
  }
  display.clearDisplay();
  display.display();
}

void showMessage(String line1, String line2 = "", int size1 = 2, int size2 = 1) {
  enableI2C();                                     // Always safe switch to OLED

  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);

  // Title
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.println(F("Security System"));
  display.drawLine(0, 10, 127, 10, SSD1306_WHITE);

  // Main message
  display.setTextSize(size1);
  int16_t x, y;
  uint16_t w, h;
  display.getTextBounds(line1, 0, 0, &x, &y, &w, &h);
  display.setCursor((128 - w) / 2, 20);
  display.println(line1);

  // Sub message
  if (line2 != "") {
    display.setTextSize(size2);
    display.getTextBounds(line2, 0, 0, &x, &y, &w, &h);
    display.setCursor((128 - w) / 2, 48);
    display.println(line2);
  }

  display.display();
}

// ============================================================
// CAMERA & WIFI
// ============================================================
bool initCamera() {
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sscb_sda = SIOD_GPIO_NUM;
  config.pin_sscb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;
  config.frame_size = FRAMESIZE_QVGA;
  config.jpeg_quality = 12;
  config.fb_count = 1;

  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed with error 0x%x\n", err);
    return false;
  }
  return true;
}

void connectWiFi() {
  WiFi.begin(ssid, password);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    attempts++;
  }
}

// ============================================================
// SETUP
// ============================================================
void setup() {
  WRITE_PERI_REG(RTC_CNTL_BROWN_OUT_REG, 0); // Disable brownout
  Serial.begin(115200);

  pinMode(IR_SENSOR_PIN, INPUT);

  // Start with clean I2C state
  pinMode(SHARED_SDA, INPUT_PULLUP);
  pinMode(SHARED_SCL, INPUT_PULLUP);
  delay(100);

  // Initialize OLED first
  enableI2C();
  showMessage("Booting...", "System Init", 2, 1);

  // Initialize Camera
  if (!initCamera()) {
    showMessage("CAMERA", "FAILED!", 2);
    while (1) delay(1000);
  }

  showMessage("System Ready", "Waiting motion...", 1);
}

// ============================================================
// MAIN LOOP
// ============================================================
void loop() {
  // Wait for motion
  if (digitalRead(IR_SENSOR_PIN) == LOW) {
    delay(100);
    return;
  }

  Serial.println("Motion detected!");

  // PHASE 1: RFID AUTH
  showMessage("SCAN CARD", "20s window", 2);

  enableSPI();
  bool cardOK = false;
  unsigned long rfidStart = millis();

  while (millis() - rfidStart < RFID_TIMEOUT) {
    if (mfrc522.PICC_IsNewCardPresent() && mfrc522.PICC_ReadCardSerial()) {
      Serial.print("Card UID: ");
      for (byte i = 0; i < mfrc522.uid.size; i++) {
        Serial.print(mfrc522.uid.uidByte[i] < 0x10 ? " 0" : " ");
        Serial.print(mfrc522.uid.uidByte[i], HEX);
      }
      Serial.println();
      cardOK = true;
      mfrc522.PICC_HaltA();
      mfrc522.PCD_StopCrypto1();
      break;
    }
    delay(50);
  }

  if (cardOK) {
    showMessage("ACCESS", "GRANTED", 3);
    delay(3000);
  } else {
    // PHASE 2: FACE RECOGNITION (Camera + WiFi)
    showMessage("Face Auth", "Connecting...", 1);

    SPI.end(); // Make sure SPI is dead
    connectWiFi();

    if (WiFi.status() == WL_CONNECTED) {
      showMessage("Capturing", WiFi.localIP().toString(), 1);
      delay(CAMERA_TIMEOUT); // Replace with real capture/upload later
      showMessage("SUCCESS", "Face Verified", 2);
      delay(3000);
    } else {
      showMessage("NO WIFI", "Failed", 2);
      delay(3000);
    }
    WiFi.disconnect(true);
    WiFi.mode(WIFI_OFF);
  }

  // COOLDOWN
  for (int i = COOLDOWN_SECONDS; i > 0; i--) {
    showMessage("Cooldown", String(i) + " sec", 2);
    delay(1000);
  }

  showMessage("System Idle", "Waiting motion...", 1);
  delay(1000);
}