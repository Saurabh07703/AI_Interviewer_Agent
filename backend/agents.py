import random
from llm_client import LLMClient

class ReasoningAgent:
    """
    Manages the interview flow, generates questions based on context.
    """
    def __init__(self):
        self.llm = LLMClient()
        self.history = []

    def generate_question(self, context: dict) -> str:
        system_prompt = "You are an expert technical interviewer. Generate a relevant interview question based on the candidate's history and the job description."
        user_prompt = f"Context: {context}. History: {self.history}. Generate the next question."
        
        question = self.llm.completion(user_prompt, system_prompt)
        
        self.history.append({"role": "agent", "content": question})
        return question

    def process_answer(self, answer: str):
        self.history.append({"role": "candidate", "content": answer})

class ScoringAgent:
    """
    Evaluates answers and assigns scores.
    """
    def __init__(self):
        self.llm = LLMClient()

    def evaluate(self, answer: str, criteria: list) -> dict:
        system_prompt = "You are an expert evaluator. Score the candidate's answer from 0-100 on Technical, Communication, and Confidence metrics."
        user_prompt = f"Answer: {answer}. Criteria: {criteria}. Provide scores in JSON format."
        
        response = self.llm.completion(user_prompt, system_prompt)
        
        # In a real implementation, we would parse the JSON response.
        # For now, we return mock/parsed values.
        return {
            "technical_score": random.randint(70, 95), # Simulating parsing
            "communication_score": random.randint(70, 98),
            "confidence_score": random.randint(60, 90),
            "raw_feedback": response
        }

class DecisionAgent:
    """
    Makes final hiring recommendation.
    """
    def make_decision(self, aggregate_scores: dict) -> dict:
        avg_score = sum(val for key, val in aggregate_scores.items() if isinstance(val, int)) / 3
        recommendation = "Hire" if avg_score > 75 else "Reject"
        return {
            "final_score": round(avg_score, 2),
            "recommendation": recommendation
        }
