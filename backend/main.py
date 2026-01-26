from fastapi import FastAPI, WebSocket, WebSocketDisconnect, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import json

load_dotenv()

import base64
import numpy as np
import cv2
import io
import pypdf
from typing import List, Dict

from fraud_detection import FraudDetector
from agents import ReasoningAgent, ScoringAgent, DecisionAgent
from reporting import ReportGenerator
from email_service import EmailService

app = FastAPI()

# Initialize Services
fraud_detector = FraudDetector()
report_generator = ReportGenerator()
email_service = EmailService()

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

@app.post("/upload-cv")
async def upload_cv(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")
    
    try:
        content = await file.read()
        pdf_file = io.BytesIO(content)
        reader = pypdf.PdfReader(pdf_file)
        text = ""
        for page in reader.pages:
            text += page.extract_text() or ""
        
        return {"filename": file.filename, "text": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.websocket("/ws/interview/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await websocket.accept()
    
    # Per-Session State
    reasoning_agent = ReasoningAgent()
    scoring_agent = ScoringAgent()
    decision_agent = DecisionAgent()
    
    interview_scores = {
        "technical_score": [],
        "communication_score": [],
        "confidence_score": []
    }
    
    candidate_data = {"name": "Candidate", "cv_text": ""}
    question_count = 0
    MAX_QUESTIONS = 5
    current_ideal_answer = ""
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            msg_type = message.get("type")
            
            if msg_type == "init":
                # client sends candidate info and CV text
                candidate_data = message.get("payload", {})
                print(f"Initialized interview for {candidate_data.get('name')}")
                
                # Generate first question
                q_data = reasoning_agent.generate_question(context=candidate_data)
                first_question_text = q_data.get("question")
                current_ideal_answer = q_data.get("ideal_answer")
                
                await websocket.send_json({
                    "type": "question",
                    "payload": first_question_text
                })
                question_count += 1
                
            elif msg_type == "video_frame":
                # Process video for fraud/confidence (Optional for now, keeping fraud check)
                encoded_data = message.get("payload").split(',')[1]
                nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
                frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                
                fraud_result = fraud_detector.detect_fraud(frame)
                if fraud_result["is_fraud"]:
                     await websocket.send_json({
                        "type": "fraud_alert",
                        "payload": fraud_result
                    })
            
            elif msg_type == "answer":
                user_answer = message.get("payload")
                
                # Score the answer using ideal answer comparison
                score = scoring_agent.evaluate(user_answer, current_ideal_answer)
                
                # Aggregate scores
                interview_scores["technical_score"].append(score.get("technical_score", 0))
                interview_scores["communication_score"].append(score.get("communication_score", 0))
                interview_scores["confidence_score"].append(score.get("confidence_score", 0))
                
                # Store answer in context for next question
                reasoning_agent.process_answer(user_answer)
                
                if question_count < MAX_QUESTIONS:
                    q_data = reasoning_agent.generate_question(context=candidate_data)
                    next_question_text = q_data.get("question")
                    current_ideal_answer = q_data.get("ideal_answer")
                    
                    await websocket.send_json({
                        "type": "question",
                        "payload": next_question_text
                    })
                    question_count += 1
                else:
                    # Initialize End of Interview
                    # Average scores
                    curr_tech = sum(interview_scores["technical_score"]) / len(interview_scores["technical_score"]) if interview_scores["technical_score"] else 0
                    curr_comm = sum(interview_scores["communication_score"]) / len(interview_scores["communication_score"]) if interview_scores["communication_score"] else 0
                    curr_conf = sum(interview_scores["confidence_score"]) / len(interview_scores["confidence_score"]) if interview_scores["confidence_score"] else 0
                    
                    agg_scores = {
                        "technical_score": curr_tech,
                        "communication_score": curr_comm,
                        "confidence_score": curr_conf
                    }
                    
                    decision = decision_agent.make_decision(agg_scores)
                    report = report_generator.generate_report(candidate_data, agg_scores, decision, reasoning_agent.history)
                    
                    # Send Email (Simulated)
                    email = candidate_data.get("email", "candidate@example.com")
                    email_service.send_email(email, "Your Interview Report", report)
                    
                    await websocket.send_json({
                        "type": "interview_end",
                        "payload": {
                            "report": report,
                            "decision": decision
                        }
                    })
                    break # Close loop
                    
    except WebSocketDisconnect:
        print(f"Client {client_id} disconnected")

    except Exception as e:
        print(f"Error in Websocket: {e}")
        import traceback
        traceback.print_exc()

@app.get("/")
def read_root():
    return {"message": "AI Interviewer Backend Running"}
