from flask import Flask, Response, request, jsonify, send_from_directory
import face_recognition
import numpy as np
import cv2
import time
import pickle
import mysql.connector
import RPi.GPIO as GPIO
from mfrc522 import SimpleMFRC522
from picamera2 import Picamera2
import os

app = Flask(__name__, static_folder='.', static_url_path='')

config = {
    'user': 'auth_user',
    'password': 'auth_pass',
    'host': 'localhost',
    'database': 'auth_db'
}

camera = None
camera_active = False
encodings_data = None

def charger_encodings():
    global encodings_data
    if encodings_data is None:
        with open(f"{os.path.dirname(os.path.realpath(__file__))}/encodings.pickle", "rb") as f:
            encodings_data = pickle.loads(f.read())

def verifier_face(nom):
    if nom == "Unknown":
        return False
    cnx = mysql.connector.connect(**config)
    c = cnx.cursor()
    c.execute("SELECT COUNT(*) FROM users WHERE face_name=%s", (nom,))
    count = c.fetchone()[0]
    c.close()
    cnx.close()
    return (count > 0)

def verifier_pin(code):
    cnx = mysql.connector.connect(**config)
    c = cnx.cursor()
    c.execute("SELECT COUNT(*) FROM users WHERE pin=%s", (code,))
    count = c.fetchone()[0]
    c.close()
    cnx.close()
    return (count > 0)

def verifier_rfid(value):
    cnx = mysql.connector.connect(**config)
    c = cnx.cursor()
    c.execute("SELECT COUNT(*) FROM users WHERE rfid=%s", (value,))
    count = c.fetchone()[0]
    c.close()
    cnx.close()
    return (count > 0)

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/start_camera', methods=['POST'])
def start_camera():
    global camera, camera_active
    if not camera_active:
        camera = Picamera2()
        camera.configure(camera.create_video_configuration(main={"format": 'XRGB8888', "size": (640, 480)}))
        camera.start()
        camera_active = True
    return jsonify({"success": True})

@app.route('/stop_camera', methods=['POST'])
def stop_camera():
    global camera, camera_active
    if camera_active and camera is not None:
        camera.stop()
        camera.close()
        camera_active = False
    return jsonify({"success": True})

def gen_frames():
    global camera, camera_active
    while camera_active and camera is not None:
        frame = camera.capture_array()
        ret, buffer = cv2.imencode('.jpg', frame)
        if not ret:
            continue
        yield (b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')

@app.route('/video_feed')
def video_feed():
    return Response(gen_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/auth/face', methods=['POST'])
def auth_face():
    global camera, camera_active
    if not camera_active or camera is None:
        return jsonify({"success": False, "message": "Caméra désactivée"})
    frame = camera.capture_array()
    charger_encodings()
    known_face_encodings = encodings_data["encodings"]
    known_face_names = encodings_data["names"]
    small = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
    rgb = cv2.cvtColor(small, cv2.COLOR_BGR2RGB)
    locs = face_recognition.face_locations(rgb)
    encs = face_recognition.face_encodings(rgb, locs)
    nom = "Unknown"
    if encs:
        dist = face_recognition.face_distance(known_face_encodings, encs[0])
        idx = np.argmin(dist)
        if dist[idx] < 0.6:
            nom = known_face_names[idx]
    #if verifier_face(nom):
    #    return jsonify({"success": True})
    return jsonify({"success": False,"nom":nom})

@app.route('/auth/pin', methods=['POST'])
def auth_pin():
    pin = request.form.get("pin", "")
    if verifier_pin(pin):
        return jsonify({"success": True, "message": "Accès autorisé"})
    return jsonify({"success": False, "message": "Accès refusé"})

@app.route('/auth/rfid', methods=['POST'])
def auth_rfid():
    reader = SimpleMFRC522()
    
    try:
        print("Place your card near the reader")
        id, text = reader.read()
        print("ID: %s\nText: %s" % (id, text))
        
        if id:
            cid = str(id)
            #if verifier_rfid(cid):
            #    return jsonify({"success": True, "message": "Accès autorisé"})
            #else:
            #    return jsonify({"success": False, "message": "Carte non autorisée"})
            return jsonify({"success": True, "message": "Carte détectée", "id": cid})
        else:
            return jsonify({"success": False, "message": "Aucune carte détectée"})
            
    except Exception as e:
        print(f"RFID Error: {e}")
        return jsonify({"success": False, "message": "Erreur de lecture RFID"})
    finally:
        GPIO.cleanup()

@app.route('/<path:path>')
def serve_static_file(path):
    return send_from_directory('.', path)

if __name__ == "__main__":
    app.run(host="localhost", port=5000)