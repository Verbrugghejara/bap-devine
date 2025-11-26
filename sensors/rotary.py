import RPi.GPIO as GPIO
import time

# Define GPIO pins
CLK = 17
DT = 27
counter = 0

# Setup GPIO
GPIO.setmode(GPIO.BCM)
GPIO.setup(CLK, GPIO.IN, pull_up_down=GPIO.PUD_UP)
GPIO.setup(DT, GPIO.IN, pull_up_down=GPIO.PUD_UP)

# State table for rotary encoder (gray code)
# (prev << 2 | curr): direction
rotary_table = {
    0b0001: 1,  # 00->01 CW
    0b0010: -1, # 00->10 CCW
    0b0100: -1, # 01->00 CCW
    0b0111: 1,  # 01->11 CW
    0b1000: 1,  # 10->00 CW
    0b1011: -1, # 10->11 CCW
    0b1101: -1, # 11->01 CCW
    0b1110: 1,  # 11->10 CW
}

prev_state = (GPIO.input(CLK) << 1) | GPIO.input(DT)

try:
    while True:
        curr_state = (GPIO.input(CLK) << 1) | GPIO.input(DT)
        transition = (prev_state << 2) | curr_state
        direction = rotary_table.get(transition, 0)
        if direction != 0:
            counter += direction
            dir_str = "Clockwise" if direction > 0 else "Counterclockwise"
            print(f"Position: {counter}, Direction: {dir_str}")
        prev_state = curr_state
        time.sleep(0.001)  # Snellere polling voor betere detectie
except KeyboardInterrupt:
    print("Exiting...")
finally:
    GPIO.cleanup()
