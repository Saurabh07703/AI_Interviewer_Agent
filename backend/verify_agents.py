from encoders import MultimodalEncoder
from agents import ReasoningAgent, ScoringAgent, DecisionAgent
from reporting import ReportGenerator
from email_service import EmailService

def main():
    print("--- Starting Agent Verification ---")
    
    # 1. Initialize Components
    encoder = MultimodalEncoder()
    reasoning_agent = ReasoningAgent()
    scoring_agent = ScoringAgent()
    decision_agent = DecisionAgent()
    reporter = ReportGenerator()
    emailer = EmailService()
    
    # 2. Simulate Inputs
    print("\n[Input Phase]")
    inputs = encoder.process_input(text="Resume content...", audio="audio_bytes", video="video_bytes")
    print(f"Encoded Info: {inputs}")
    
    # 3. Simulate Interview Logic
    print("\n[Reasoning Phase]")
    question = reasoning_agent.generate_question({})
    print(f"Agent Question: {question}")
    reasoning_agent.process_answer("I solved the problem by...")
    
    # 4. Scoring & Decision
    print("\n[Scoring Phase]")
    scores = scoring_agent.evaluate("Answer content", [])
    print(f"Scores: {scores}")
    
    decision = decision_agent.make_decision(scores)
    print(f"Decision: {decision}")
    
    # 5. Reporting
    print("\n[Reporting Phase]")
    candidate_data = {"name": "John Doe"}
    report = reporter.generate_report(candidate_data, scores, decision)
    print(report)
    
    # 6. Email
    print("\n[Email Phase]")
    emailer.send_email("johndoe@example.com", "Interview Results", report)
    
    print("\n--- Verification Complete ---")

if __name__ == "__main__":
    main()
