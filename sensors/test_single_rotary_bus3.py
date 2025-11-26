import smbus2
import time

AS5600_ADDR = 0x36
ANGLE_REG = 0x0E

bus = smbus2.SMBus(3)  # Gebruik bus 3 voor de tweede sensor

def read_angle(bus):
    raw_data = bus.read_i2c_block_data(AS5600_ADDR, ANGLE_REG, 2)
    angle = (raw_data[0] << 8) | raw_data[1]
    angle = angle & 0x0FFF
    return (angle / 4096.0) * 360.0

try:
    while True:
        angle = read_angle(bus)
        print(f"Angle: {angle:.2f}°")
        time.sleep(0.1)
except KeyboardInterrupt:
    print("Exiting...")
except Exception as e:
    print(f"Error: {e}")
