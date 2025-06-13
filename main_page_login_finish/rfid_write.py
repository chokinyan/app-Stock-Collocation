import RPi.GPIO as GPIO
from mfrc522 import SimpleMFRC522

reader = SimpleMFRC522()

try:
    data_to_write = "Illia"
    
    print("Place your card near the reader to write data...")
    reader.write(data_to_write)
    print("Data written to the card succesfully!")
finally:
    GPIO.cleanup()