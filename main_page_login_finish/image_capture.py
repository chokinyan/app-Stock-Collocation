import cv2
import numpy as np
import os
from datetime import datetime
from picamera2 import Picamera2
import time
import sys

# Change this to the name of the person you're photographing
PERSON_NAME = sys.argv[1] if len(sys.argv) > 1 else exit("Please provide a name as an argument.")

class ImageCaptureCV:
    def __init__(self, person_name):
        self.person_name = person_name
        self.folder = self.create_folder(person_name)
        self.photo_count = 0
        
        # Initialize the camera
        self.picam2 = Picamera2()
        self.picam2.configure(self.picam2.create_preview_configuration(main={"format": 'XRGB8888', "size": (640, 480)}))
        self.picam2.start()
        
        # Allow camera to warm up
        time.sleep(2)
        
        # Window settings
        self.window_name = f"Capture d'images - {person_name}"
        cv2.namedWindow(self.window_name, cv2.WINDOW_AUTOSIZE)
        
        # Button areas (x, y, width, height)
        self.capture_button = (50, 500, 150, 50)  # Bouton Capture
        self.quit_button = (250, 500, 150, 50)    # Bouton Quitter
        
        # Colors
        self.button_color = (100, 100, 100)
        self.button_hover_color = (150, 150, 150)
        self.text_color = (255, 255, 255)
        
        # Mouse callback
        cv2.setMouseCallback(self.window_name, self.mouse_callback)

    def create_folder(self, name):
        dataset_folder = f"{os.path.dirname(os.path.realpath(__file__))}/dataset"
        if not os.path.exists(dataset_folder):
            os.makedirs(dataset_folder)
        
        person_folder = os.path.join(dataset_folder, name)
        if not os.path.exists(person_folder):
            os.makedirs(person_folder)
        return person_folder

    def draw_button(self, img, button_area, text, color):
        """Draw a button on the image"""
        x, y, w, h = button_area
        cv2.rectangle(img, (x, y), (x + w, y + h), color, -1)
        cv2.rectangle(img, (x, y), (x + w, y + h), (0, 0, 0), 2)
        
        # Add text
        font = cv2.FONT_HERSHEY_SIMPLEX
        text_size = cv2.getTextSize(text, font, 0.6, 2)[0]
        text_x = x + (w - text_size[0]) // 2
        text_y = y + (h + text_size[1]) // 2
        cv2.putText(img, text, (text_x, text_y), font, 0.6, self.text_color, 2)

    def draw_interface(self, frame):
        """Draw the complete interface"""
        # Extend frame height to accommodate buttons
        interface_height = 580
        interface = np.zeros((interface_height, 640, 3), dtype=np.uint8)
        
        # Place camera frame
        interface[0:480, 0:640] = frame
        
        # Draw status bar
        cv2.rectangle(interface, (0, 480), (640, 500), (50, 50, 50), -1)
        status_text = f"Photos capturees: {self.photo_count} | Personne: {self.person_name}"
        cv2.putText(interface, status_text, (10, 495), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
        
        # Draw buttons
        self.draw_button(interface, self.capture_button, "CAPTURE", self.button_color)
        self.draw_button(interface, self.quit_button, "QUITTER", self.button_color)
        
        # Draw instructions
        instructions = [
            "Cliquez sur CAPTURE pour prendre une photo",
            "Cliquez sur QUITTER ou appuyez sur 'q' pour sortir",
            "Vous pouvez aussi utiliser ESPACE pour capturer"
        ]
        
        for i, instruction in enumerate(instructions):
            cv2.putText(interface, instruction, (10, 520 + i * 15), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.4, (200, 200, 200), 1)
        
        return interface

    def is_point_in_button(self, point, button_area):
        """Check if a point is inside a button area"""
        x, y, w, h = button_area
        px, py = point
        return x <= px <= x + w and y <= py <= y + h

    def mouse_callback(self, event, x, y, flags, param):
        """Handle mouse events"""
        if event == cv2.EVENT_LBUTTONDOWN:
            if self.is_point_in_button((x, y), self.capture_button):
                self.capture_photo()
            elif self.is_point_in_button((x, y), self.quit_button):
                self.quit_application()

    def capture_photo(self):
        """Capture and save a photo"""
        try:
            # Capture frame from Pi Camera
            frame = self.picam2.capture_array()
            
            self.photo_count += 1
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"{self.person_name}_{timestamp}.jpg"
            filepath = os.path.join(self.folder, filename)
            
            cv2.imwrite(filepath, frame)
            print(f"Photo {self.photo_count} saved: {filepath}")
            
        except Exception as e:
            print(f"Erreur lors de la capture: {e}")

    def quit_application(self):
        """Clean up and quit"""
        self.picam2.stop()
        cv2.destroyAllWindows()
        print(f"Photo capture completed. {self.photo_count} photos saved for {self.person_name}.")
        return False

    def run(self):
        """Main loop"""
        print(f"Taking photos for {self.person_name}.")
        print("Cliquez sur les boutons ou utilisez les raccourcis clavier:")
        print("- ESPACE: Capture d'écran")
        print("- 'q': Quitter")
        
        while True:
            try:
                # Capture frame from Pi Camera
                frame = self.picam2.capture_array()
                
                # Create interface with buttons
                interface = self.draw_interface(frame)
                
                # Display the interface
                cv2.imshow(self.window_name, interface)
                
                # Handle keyboard input
                key = cv2.waitKey(1) & 0xFF
                
                if key == ord(' '):  # Space key
                    self.capture_photo()
                elif key == ord('q'):  # Q key
                    if not self.quit_application():
                        break
                elif key == 27:  # ESC key
                    if not self.quit_application():
                        break
                        
            except Exception as e:
                print(f"Erreur dans la boucle principale: {e}")
                break

def capture_photos(name):
    """Main function to start the application"""
    app = ImageCaptureCV(name)
    app.run()

if __name__ == "__main__":
    capture_photos(PERSON_NAME)