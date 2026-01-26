import random
import json
import re
from llm_client import LLMClient

class ReasoningAgent:
    """
    Manages the interview flow, generates questions based on context.
    """
    def __init__(self):
        self.llm = LLMClient()
        self.history = []

    def generate_question(self, context: dict) -> dict:
        system_prompt = "You are an expert technical interviewer. Generate a relevant technical interview question based on the candidate's history and CV. Also provide a concise 'Ideal Answer' or key points expected in the response. Output in JSON format: {'question': '...', 'ideal_answer': '...'}"
        
        cv_text = context.get('cv_text', 'No CV provided.')
        
        user_prompt = f"CV Content: {cv_text[:2000]}...\nContext: {context}.\nHistory: {self.history}.\nGenerate the next question and ideal answer as JSON."
        
        response = self.llm.completion(user_prompt, system_prompt)
        
        # Try to parse JSON from LLM response
        try:
            # Simple cleanup to handle potential markdown wrappers
            clean_response = response.replace("```json", "").replace("```", "").strip()
            data = json.loads(clean_response)
            question_text = data.get("question", "Tell me about yourself.")
            ideal_answer = data.get("ideal_answer", "Values relevant experience.")
        except:
            # Fallback if JSON parsing fails
            question_text = response
            ideal_answer = "Evaluate based on general technical correctness."

        self.history.append({"role": "agent", "content": question_text})
        return {"question": question_text, "ideal_answer": ideal_answer}

    def process_answer(self, answer: str):
        self.history.append({"role": "candidate", "content": answer})

class ScoringAgent:
    """
    Evaluates answers and assigns scores by comparing with ideal answer.
    """
    def __init__(self):
        self.llm = LLMClient()

    def evaluate(self, user_answer: str, ideal_answer: str) -> dict:
        system_prompt = "You are an expert evaluator. Compare the Candidate's Answer to the Ideal Answer. Rate from 0-100 on Technical Accuracy, Communication Clarity, and Confidence."
        user_prompt = f"Question Context: (Hidden)\nIdeal Answer: {ideal_answer}\nCandidate Answer: {user_answer}\n\nProvide scores in JSON format: {{'technical_score': int, 'communication_score': int, 'confidence_score': int}}"
        
        response = self.llm.completion(user_prompt, system_prompt)
        
        default_scores = {"technical_score": 50, "communication_score": 50, "confidence_score": 50}
        
        try:
            # Clean and parse JSON
            clean_response = response.replace("```json", "").replace("```", "").strip()
            # Find the first { and last } to extract JSON object
            match = re.search(r'\{.*\}', clean_response, re.DOTALL)
            if match:
                json_str = match.group(0)
                scores = json.loads(json_str)
                return {
                    "technical_score": int(scores.get("technical_score", 50)),
                    "communication_score": int(scores.get("communication_score", 50)),
                    "confidence_score": int(scores.get("confidence_score", 50))
                }
            else:
                return default_scores
        except Exception as e:
            print(f"Scoring Error: {e}")
            return default_scores

class DecisionAgent:
    """
    Makes final hiring recommendation.
    """
    def make_decision(self, aggregate_scores: dict) -> dict:
        avg_score = sum(val for key, val in aggregate_scores.items() if isinstance(val, (int, float))) / 3
        recommendation = "HIRE" if avg_score > 70 else "REJECT"
        return {
            "final_score": round(avg_score, 2),
            "decision": recommendation,
            "technical_score": aggregate_scores.get("technical_score", 0),
            "communication_score": aggregate_scores.get("communication_score", 0),
            "confidence_score": aggregate_scores.get("confidence_score", 0)
        }
