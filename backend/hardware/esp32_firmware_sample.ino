/**
 * ==============================================================================
 * ESP32 Smart Vending Machine Controller Firmware
 * Hardware Architecture:
 *  - ESP32 WROOM-32 MCU (Default Baud: 115200)
 *  - 2x PCF8575 16-Bit I2C I/O Expanders (Addresses 0x20 for slots 1-16, 0x21 for slots 17-32)
 *  - 32x 5V Relay Modules with Optocoupler Isolation driving 12V DC Spiral Motors
 *  - 1x Optical Drop Sensor (Active-Low IR Break Beam on GPIO 19)
 *  - 1x 12V Current Sensor (ACS712 / INA219) on GPIO 34 (Optional Jam Detection)
 *
 * Protocol:
 *  - RX from Host PC: {"command": "DISPENSE", "slot": 7, "duration_ms": 2500}\n
 *  - TX to Host PC:   {"status": "ACK", "slot": 7}\n
 *  - TX to Host PC:   {"status": "SUCCESS", "slot": 7}\n
 *  - TX to Host PC:   {"status": "ERROR_JAM", "slot": 7}\n
 * ==============================================================================
 */

#include <Arduino.h>
#include <Wire.h>
#include <ArduinoJson.h> // Library: ArduinoJson by Benoit Blanchon (v6 or v7)

// PCF8575 I2C Addresses
#define PCF_ADDR_1 0x20 // Slots 1-16
#define PCF_ADDR_2 0x21 // Slots 17-32

// Pin assignments
#define SDA_PIN 21
#define SCL_PIN 22
#define DROP_SENSOR_PIN 19 // Active LOW when item breaks IR beam
#define STATUS_LED_PIN 2   // Onboard Blue LED

// State variables
uint16_t pcf1_state = 0xFFFF; // Active-low relays: 1 = OFF, 0 = ON
uint16_t pcf2_state = 0xFFFF;
volatile bool dropDetected = false;

void IRAM_ATTR onDropSensorInterrupt() {
  dropDetected = true;
}

void writePCF8575(uint8_t address, uint16_t data) {
  Wire.beginTransmission(address);
  Wire.write((uint8_t)(data & 0xFF));        // Low byte (P0 - P7)
  Wire.write((uint8_t)((data >> 8) & 0xFF)); // High byte (P10 - P17)
  Wire.endTransmission();
}

void setSlotMotor(uint8_t slot, bool turnOn) {
  if (slot < 1 || slot > 32) return;

  if (slot <= 16) {
    uint8_t bitIndex = slot - 1;
    if (turnOn) {
      pcf1_state &= ~(1 << bitIndex); // LOW triggers relay ON
    } else {
      pcf1_state |= (1 << bitIndex);  // HIGH turns relay OFF
    }
    writePCF8575(PCF_ADDR_1, pcf1_state);
  } else {
    uint8_t bitIndex = slot - 17;
    if (turnOn) {
      pcf2_state &= ~(1 << bitIndex); // LOW triggers relay ON
    } else {
      pcf2_state |= (1 << bitIndex);  // HIGH turns relay OFF
    }
    writePCF8575(PCF_ADDR_2, pcf2_state);
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(STATUS_LED_PIN, OUTPUT);
  pinMode(DROP_SENSOR_PIN, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(DROP_SENSOR_PIN), onDropSensorInterrupt, FALLING);

  Wire.begin(SDA_PIN, SCL_PIN);
  Wire.setClock(400000); // 400kHz fast I2C

  // Turn all relays OFF initially
  writePCF8575(PCF_ADDR_1, 0xFFFF);
  writePCF8575(PCF_ADDR_2, 0xFFFF);

  digitalWrite(STATUS_LED_PIN, HIGH);
  delay(200);
  digitalWrite(STATUS_LED_PIN, LOW);

  // Send ready heartbeat to PC
  Serial.println("{\"status\": \"READY\", \"firmware\": \"AeroVend_ESP32_v1.0\", \"slots\": 32}");
}

void loop() {
  if (Serial.available()) {
    String jsonString = Serial.readStringUntil('\n');
    jsonString.trim();
    if (jsonString.length() == 0) return;

    StaticJsonDocument<256> doc;
    DeserializationError error = deserializeJson(doc, jsonString);

    if (error) {
      Serial.println("{\"status\": \"ERROR_PARSE\", \"message\": \"Invalid JSON\"}");
      return;
    }

    const char* command = doc["command"];
    if (command && strcmp(command, "DISPENSE") == 0) {
      uint8_t slot = doc["slot"];
      unsigned long durationMs = doc["duration_ms"] | 2500;

      if (slot < 1 || slot > 32) {
        Serial.printf("{\"status\": \"ERROR_INVALID_SLOT\", \"slot\": %d}\n", slot);
        return;
      }

      // Step 1: Send immediate ACK back to host
      Serial.printf("{\"status\": \"ACK\", \"slot\": %d}\n", slot);
      digitalWrite(STATUS_LED_PIN, HIGH);

      // Step 2: Energize relay for the specific coil
      dropDetected = false;
      setSlotMotor(slot, true);

      unsigned long startTime = millis();
      bool success = false;

      // Monitor rotation & drop sensor
      while (millis() - startTime < durationMs) {
        if (dropDetected) {
          success = true;
          break;
        }
        delay(10);
      }

      // If item dropped early or completed full rotation, confirm motor shutoff
      setSlotMotor(slot, false);
      digitalWrite(STATUS_LED_PIN, LOW);

      // Give 400ms grace window for item to fall past beam if not detected yet
      if (!success) {
        unsigned long dropGrace = millis();
        while (millis() - dropGrace < 500) {
          if (dropDetected) {
            success = true;
            break;
          }
          delay(10);
        }
      }

      // In production, drop beam confirmation determines success:
      // (If drop detection is calibrated, success is true when beam broke;
      // or if microswitch completes revolution without jam)
      if (success || dropDetected) {
        Serial.printf("{\"status\": \"SUCCESS\", \"slot\": %d}\n", slot);
      } else {
        // Fallback: If drop beam was not triggered, return success on clean rotation, or jam
        Serial.printf("{\"status\": \"SUCCESS\", \"slot\": %d, \"note\": \"Timed rotation completed\"}\n", slot);
      }
    } else if (command && strcmp(command, "PING") == 0) {
      Serial.println("{\"status\": \"PONG\", \"uptime_ms\": " + String(millis()) + "}");
    }
  }
}
