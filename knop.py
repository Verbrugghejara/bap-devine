import RPi.GPIO as GPIO
import time

BUTTON_PIN = 22

GPIO.setmode(GPIO.BCM)
GPIO.setup(BUTTON_PIN, GPIO.IN, pull_up_down=GPIO.PUD_UP)

while True:
    print("druk op de know")
    if GPIO.input(BUTTON_PIN) == GPIO.LOW:
        print("Button pressed!")
        # hier stuur je via websocket door naar je game
    time.sleep(0.01)
