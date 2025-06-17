import RPi.GPIO as GPIO
from mfrc522 import SimpleMFRC522
import sys

reader = SimpleMFRC522()

try:
    # Check if parameter is provided
    if len(sys.argv) < 2:
        print("Usage: python rfid_write.py <data_to_write>")
        sys.exit(1)
    
    data_to_write = sys.argv[1]
    
    print(f"Place your card near the reader to write data: {data_to_write}")
    reader.write(data_to_write)
    print("Data written to the card successfully!")
finally:
    GPIO.cleanup()