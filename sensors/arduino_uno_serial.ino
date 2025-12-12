/*
 * Arduino UNO sketch voor AS5600 magnetische encoder
 * Stuurt angle data via Serial (voor gebruik met Node.js bridge)
 * 
 * BELANGRIJK: Upload deze sketch naar BEIDE Uno's
 * - Uno #1 stuurt data op /dev/ttyUSB0 (of ttyACM0)
 * - Uno #2 stuurt data op /dev/ttyUSB1 (of ttyACM1)
 * 
 * Pinout AS5600:
 * - SDA → A4
 * - SCL → A5
 * - VCC → 5V
 * - GND → GND
 * 
 * Button (optioneel, alleen Uno #1):
 * - Pin → D2
 * - GND → GND
 */

#include <Wire.h>

#define AS5600_ADDR 0x36
#define ANGLE_REG 0x0E
#define BUTTON_PIN 2
#define HAS_BUTTON false  // Zet op true voor Uno #1

float prevAngle = 0;
bool initialized = false;

float readAngle() {
  Wire.beginTransmission(AS5600_ADDR);
  Wire.write(ANGLE_REG);
  Wire.endTransmission();
  Wire.requestFrom(AS5600_ADDR, 2);
  
  if (Wire.available() >= 2) {
    uint8_t highByte = Wire.read();
    uint8_t lowByte = Wire.read();
    uint16_t rawAngle = (highByte << 8) | lowByte;
    rawAngle &= 0x0FFF;
    return (rawAngle / 4096.0) * 360.0;
  }
  return -1;
}

void setup() {
  Serial.begin(115200);
  Wire.begin();
  
  if (HAS_BUTTON) {
    pinMode(BUTTON_PIN, INPUT_PULLUP);
  }
  
  delay(100);
  float angle = readAngle();
  if (angle >= 0) {
    prevAngle = angle;
    initialized = true;
  }
}

void loop() {
  if (!initialized) {
    Serial.println("ERROR");
    delay(50);
    return;
  }
  
  float angle = readAngle();
  
  if (angle < 0) {
    Serial.println("ERROR");
    delay(20);
    return;
  }
  
  // Bereken verschil
  float diff = angle - prevAngle;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  
  // Output: angle,diff,button
  Serial.print(angle, 2);
  Serial.print(",");
  Serial.print(diff, 2);
  
  if (HAS_BUTTON) {
    Serial.print(",");
    Serial.println(digitalRead(BUTTON_PIN) == LOW ? "1" : "0");
  } else {
    Serial.println(",0");
  }
  
  prevAngle = angle;
  delay(20);  // 50 Hz
}
