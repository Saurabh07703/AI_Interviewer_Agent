import cv2
import numpy as np

class FraudDetector:
    def __init__(self):
        # Initialize OpenCV face detector
        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

    def detect_fraud(self, frame_data):
        """
        Analyzes a video frame for fraud signals.
        Expected frame_data: numpy array representing the image.
        Returns a dictionary of detected anomalies.
        """
        # Ensure frame is in correct format (assuming BGR from OpenCV/typical video stream)
        if frame_data is None or frame_data.size == 0:
             return {"error": "Invalid frame data"}

        gray = cv2.cvtColor(frame_data, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(gray, 1.1, 4)
        
        alerts = []
        if len(faces) == 0:
            alerts.append("No face detected")
        elif len(faces) > 1:
            alerts.append("Multiple faces detected")
            
        # Placeholder logic for more advanced gaze tracking:
        # 1. Use MediaPipe Face Mesh to get iris landmarks.
        # 2. Calculate vector from eye center to iris center.
        # 3. If vector magnitude > threshold, flag as looking away.

        return {
            "is_suspicious": len(alerts) > 0,
            "alerts": alerts,
            "face_count": len(faces)
        }
