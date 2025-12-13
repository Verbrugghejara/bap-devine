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




#define AS5600_ADDR 0x36
#define ANGLE_REG 0x0E
#define BUTTON_PIN 4


float prevAngle = 0;
bool initialized = false;
int prevButton = 1; // HIGH (niet ingedrukt)
const float THRESHOLD = 2.0;  // 2 graden beweging triggert output

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
  Serial.begin(115200);
  Wire.begin();
  pinMode(BUTTON_PIN, INPUT_PULLUP);
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

  int button = digitalRead(BUTTON_PIN);

  float diff = angle - prevAngle;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;

  // Verstuur bij rotatie
  if (abs(diff) > THRESHOLD) {
    Serial.print(angle, 2);
    Serial.print(",");
    Serial.print(-abs(diff), 2); // altijd negatief voor links
    Serial.print(",");
    Serial.println(button == LOW ? 1 : 0);
    prevAngle = angle;
    prevButton = button;
  }
  // Verstuur bij button change (ook zonder rotatie)
  else if (button != prevButton) {
    Serial.print(angle, 2);
    Serial.print(",0,");
    Serial.println(button == LOW ? 1 : 0);
    prevButton = button;
  }

  delay(5);  // 200 Hz update rate
}
