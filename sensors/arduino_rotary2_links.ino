#include <Wire.h>
#include <math.h>

#define AS5600_ADDR 0x36
#define ANGLE_REG 0x0E
#define BUTTON_PIN 4   // verander naar 2 als je knop op D2 zit

float prevAngle = 0;
bool initialized = false;
const float THRESHOLD = 2.0;

float readAngle() {
  Wire.beginTransmission(AS5600_ADDR);
  Wire.write(ANGLE_REG);

  if (Wire.endTransmission(false) != 0) {
    return -1;
  }

  if (Wire.requestFrom(AS5600_ADDR, 2) != 2) {
    return -1;
  }

  uint8_t highByte = Wire.read();
  uint8_t lowByte = Wire.read();

  uint16_t rawAngle = (highByte << 8) | lowByte;
  rawAngle &= 0x0FFF;

  return (rawAngle / 4096.0) * 360.0;
}

void setup() {
  Serial.begin(115200);
  Wire.begin();
  pinMode(BUTTON_PIN, INPUT_PULLUP);

  delay(500);

  float angle = readAngle();

  if (angle >= 0) {
    prevAngle = angle;
    initialized = true;
  } else {
    initialized = false;
  }
}

void loop() {
  if (!initialized) {
    Serial.println("ERROR");
    delay(500);

    float angle = readAngle();
    if (angle >= 0) {
      prevAngle = angle;
      initialized = true;
    }

    return;
  }

  float angle = readAngle();

  if (angle < 0) {
    Serial.println("ERROR");
    initialized = false;
    delay(200);
    return;
  }

  float diff = angle - prevAngle;

  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;

  int button = digitalRead(BUTTON_PIN) == LOW ? 1 : 0;

  Serial.print(angle, 2);
  Serial.print(",");
  Serial.print(diff, 2);
  Serial.print(",");
  Serial.println(button);

  if (fabs(diff) > THRESHOLD) {
    prevAngle = angle;
  }

  delay(20);
}