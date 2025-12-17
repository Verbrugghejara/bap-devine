import smbus2
import time

AS5600_ADDR = 0x36
ANGLE_REG = 0x0E

bus1 = smbus2.SMBus(1)  # Eerste sensor op i2c-1
bus3 = smbus2.SMBus(3)  # Tweede sensor op i2c-3

def read_angle(bus):
    raw_data = bus.read_i2c_block_data(AS5600_ADDR, ANGLE_REG, 2)
    angle = (raw_data[0] << 8) | raw_data[1]
    angle = angle & 0x0FFF
    return (angle / 4096.0) * 360.0

try:
    while True:
        angle1 = read_angle(bus1)
        angle2 = read_angle(bus3)
        print(f"Sensor 1 (i2c-1): {angle1:.2f}° | Sensor 2 (i2c-3): {angle2:.2f}°")
        time.sleep(0.5)
except KeyboardInterrupt:
    print("Exiting...")