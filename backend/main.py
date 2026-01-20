from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import json
import base64
import numpy as np
import cv2
from fraud_detection import FraudDetector

app = FastAPI()
fraud_detector = FraudDetector()

origins = [
    "http://localhost:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.websocket("/ws/interview/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            # Expecting JSON: {"type": "video", "data": "base64..."} or {"type": "audio", "data": "..."}
            message = json.loads(data)
            
            if message.get("type") == "video":
                # Decode base64 image
                encoded_data = message.get("data").split(',')[1] # Remove header if present
                nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
                frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                
                # Run Fraud Detection
                fraud_result = fraud_detector.detect_fraud(frame)
                
                # Send back results
                await websocket.send_json({
                    "type": "fraud_alert",
                    "payload": fraud_result
                })
                
    except WebSocketDisconnect:
        print(f"Client {client_id} disconnected")
    except Exception as e:
        print(f"Error: {e}")

@app.get("/")
def read_root():
    return {"message": "Hello from AI Interviewer Agent Backend!"}
