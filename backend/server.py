from flask import Flask, render_template, Response, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import cv2

app = Flask(__name__)
CORS(app)  # Allow React frontend to call this API

# MongoDB setup
client = MongoClient("mongodb://localhost:27017/")
db = client["overlay_db"]
collection = db["overlays"]

# Global variable for current RTSP URL
current_rtsp_url = 0  # 0 = default webcam

# Video streaming generator
def gen_frames():
    cap = cv2.VideoCapture(current_rtsp_url)
    while True:
        success, frame = cap.read()
        if not success:
            break
        ret, buffer = cv2.imencode('.jpg', frame)
        frame = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
    cap.release()

# Livestream route
@app.route('/video_feed')
def video_feed():
    return Response(gen_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

# Set RTSP URL
@app.route("/set_rtsp", methods=["POST"])
def set_rtsp():
    global current_rtsp_url
    data = request.json
    url = data.get("url")
    if not url or url == "0":
        current_rtsp_url = 0  # webcam
    else:
        current_rtsp_url = url
    return jsonify({"message": "RTSP URL updated"}), 200

# CRUD API for overlays
@app.route("/overlays", methods=["POST"])
def create_overlay():
    data = request.json
    collection.insert_one(data)
    return jsonify({"message": "Overlay created"}), 201

@app.route("/overlays", methods=["GET"])
def get_overlays():
    overlays = list(collection.find({}, {"_id": 0}))
    return jsonify(overlays)

@app.route("/overlays/<overlay_id>", methods=["PUT"])
def update_overlay(overlay_id):
    data = request.json
    result = collection.update_one({"overlay_id": overlay_id}, {"$set": data})
    if result.matched_count:
        return jsonify({"message": "Updated successfully"}), 200
    return jsonify({"error": "Overlay not found"}), 404

@app.route("/overlays/<overlay_id>", methods=["DELETE"])
def delete_overlay(overlay_id):
    result = collection.delete_one({"overlay_id": overlay_id})
    if result.deleted_count:
        return jsonify({"message": "Deleted successfully"}), 200
    return jsonify({"error": "Overlay not found"}), 404

if __name__ == "__main__":
    app.run(debug=True, port=5000)






