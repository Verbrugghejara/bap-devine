import asyncio
import websockets
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

clients = set()

def get_direction():
    global prev_state
    curr_state = (GPIO.input(CLK) << 1) | GPIO.input(DT)
    transition = (prev_state << 2) | curr_state
    direction = rotary_table.get(transition, 0)
    prev_state = curr_state
    return direction

async def rotary_sender(websocket):
    clients.add(websocket)
    try:
        while True:
            direction = get_direction()
            if direction != 0:
                dir_str = "right" if direction > 0 else "left"
                await websocket.send(dir_str)
            await asyncio.sleep(0.001)
    except websockets.ConnectionClosed:
        pass
    finally:
        clients.remove(websocket)

async def main():
    async with websockets.serve(rotary_sender, "0.0.0.0", 8765):
        await asyncio.Future()  # run forever

try:
    asyncio.run(main())
except KeyboardInterrupt:
    print("Exiting...")
finally:
    GPIO.cleanup()
