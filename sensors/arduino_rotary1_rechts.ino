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


#define AS5600_ADDR 0x36
#define ANGLE_REG 0x0E
#define BUTTON_PIN 2

float prevAngle = 0;
bool initialized = false;
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

  float diff = angle - prevAngle;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;

  int button = digitalRead(BUTTON_PIN) == LOW ? 1 : 0;

  // Altijd sturen: angle,diff,button
  Serial.print(angle, 2);
  Serial.print(",");
  Serial.print(diff, 2);
  Serial.print(",");
  Serial.println(button);

  // Alleen prevAngle updaten bij echte beweging
  if (abs(diff) > THRESHOLD) {
    prevAngle = angle;
  }

  delay(20); // 50 Hz, past goed bij je WebSocket bridge
}
