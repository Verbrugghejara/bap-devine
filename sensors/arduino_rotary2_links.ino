/*
 * Arduino sketch voor Rotary Sensor 2 (LINKS)
 * Hardware: Arduino Leonardo/Pro Micro + AS5600 magnetische encoder
 * 
 * Pinout AS5600:
 * - SDA → A4 (Leonardo Pin 2)
 * - SCL → A5 (Leonardo Pin 3)
 * - VCC → 5V
 * - GND → GND
 * 
 * Functie: Draaien activeert 'a' key (links)
 */

#include <Wire.h>
#include <Keyboard.h>

#define AS5600_ADDR 0x36
#define ANGLE_REG 0x0E

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
  
  // Rotary 2: Elke beweging → 'a' (links)
  float diff = angle - prevAngle;
  
  // Handle 360° wraparound
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  
  if (abs(diff) > THRESHOLD) {
    Keyboard.press('a');
    delay(50);
    Keyboard.releaseAll();
    prevAngle = angle;
  }
  
  delay(20);  // 50 Hz update rate
}
