import asyncio
import websockets
import smbus2
import json
import time
import RPi.GPIO as GPIO

AS5600_ADDR = 0x36
ANGLE_REG = 0x0E
BUTTON_PIN = 22

# GPIO setup
GPIO.setmode(GPIO.BCM)
GPIO.setup(BUTTON_PIN, GPIO.IN, pull_up_down=GPIO.PUD_UP)

bus1 = smbus2.SMBus(1)  # Eerste sensor op i2c-1
bus3 = smbus2.SMBus(3)  # Tweede sensor op i2c-3

def read_angle(bus):
    try:
        raw_data = bus.read_i2c_block_data(AS5600_ADDR, ANGLE_REG, 2)
        angle = (raw_data[0] << 8) | raw_data[1]
        angle = angle & 0x0FFF
        return (angle / 4096.0) * 360.0
    except Exception as e:
        print(f"Read error on bus {bus.fd if hasattr(bus, 'fd') else bus}: {e}")
        return None

async def rotary_sender(websocket):
    prev1 = None
    prev2 = None
    remote = websocket.remote_address if hasattr(websocket, 'remote_address') else 'unknown'
    print(f"[dual_rotary_ws] Client connected from {remote}!")
    try:
        while True:
            angle1 = read_angle(bus1)
            angle2 = read_angle(bus3)
            button_pressed = GPIO.input(BUTTON_PIN) == GPIO.LOW
            
            if angle1 is not None:
                # print(f"Angle1: {angle1:.2f}°", end=' ')
                pass
            else:
                print("Angle1: ERROR", end=' ')
            if angle2 is not None:
                # print(f"Angle2: {angle2:.2f}°")
                pass
            else:
                print("Angle2: ERROR")
            
            msg = json.dumps({"angle1": angle1, "angle2": angle2, "button": button_pressed})
            try:
                await websocket.send(msg)
            except Exception as e:
                print(f"[dual_rotary_ws] WebSocket send error to {remote}: {e}")
                break
            await asyncio.sleep(0.02)  # 50 Hz
    except websockets.ConnectionClosed as e:
        print(f"[dual_rotary_ws] WebSocket connection closed from {remote}: {e}")
    except Exception as e:
        print(f"[dual_rotary_ws] Unexpected error from {remote}: {e}")
    finally:
        print(f"[dual_rotary_ws] Client from {remote} disconnected.")

async def main():
    print("[dual_rotary_ws] WebSocket server starting on localhost:8765...")
    async with websockets.serve(rotary_sender, "localhost", 8765, origins=None):
        print("[dual_rotary_ws] WebSocket server is running and waiting for clients...")
        await asyncio.Future()  # run forever

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Exiting...")
    finally:
        GPIO.cleanup()
