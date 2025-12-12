/*
 * Arduino sketch voor Rotary Sensor 1 (RECHTS)
 * Hardware: Arduino Leonardo/Pro Micro + AS5600 magnetische encoder
 * 
 * Pinout AS5600:
 * - SDA → A4 (Leonardo Pin 2)
 * - SCL → A5 (Leonardo Pin 3)
 * - VCC → 5V
 * - GND → GND
 * 
 * Button (optioneel):
 * - Pin → D2
 * - GND → GND (met pull-up resistor)
 * 
 * Functie: Draaien activeert 'd' key (rechts)
 */

#include <Wire.h>
#include <Keyboard.h>

#define AS5600_ADDR 0x36
#define ANGLE_REG 0x0E
#define BUTTON_PIN 2

float prevAngle = 0;
bool initialized = false;
const float THRESHOLD = 3.0;  // 3 graden beweging triggert keypress

float readAngle() {
  Wire.beginTransmission(AS5600_ADDR);
  Wire.write(ANGLE_REG);
  Wire.endTransmission();
  Wire.requestFrom(AS5600_ADDR, 2);
  
  if (Wire.available() >= 2) {
    uint8_t highByte = Wire.read();
    uint8_t lowByte = Wire.read();
    uint16_t rawAngle = (highByte << 8) | lowByte;
    rawAngle &= 0x0FFF;  // Mask to 12 bits
    return (rawAngle / 4096.0) * 360.0;
  }
  return -1;
}

void setup() {
  Wire.begin();
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  Keyboard.begin();
  
  // Wacht tot sensor stabiel is
  delay(100);
  float angle = readAngle();
  if (angle >= 0) {
    prevAngle = angle;
    initialized = true;
  }
}

void loop() {
  if (!initialized) {
    delay(50);
    return;
  }
  
  float angle = readAngle();
  if (angle < 0) {
    delay(20);
    return;
  }
  
  // Rotary 1: Elke beweging → 'd' (rechts)
  float diff = angle - prevAngle;
  
  // Handle 360° wraparound
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  
  if (abs(diff) > THRESHOLD) {
    Keyboard.press('d');
    delay(50);
    Keyboard.releaseAll();
    prevAngle = angle;
  }
  
  // Button: spatiebalk
  if (digitalRead(BUTTON_PIN) == LOW) {
    Keyboard.press(' ');
    delay(100);
    Keyboard.releaseAll();
    delay(200);  // Debounce
  }
  
  delay(20);  // 50 Hz update rate
}
