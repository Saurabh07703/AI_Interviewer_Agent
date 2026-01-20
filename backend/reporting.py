from datetime import datetime

class ReportGenerator:
    def generate_report(self, candidate_data: dict, scores: dict, decision: dict) -> str:
        report = f"""
        INTERVIEW REPORT
        ----------------
        Date: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
        Candidate: {candidate_data.get('name', 'Unknown')}
        
        SCORES:
        - Technical: {scores.get('technical_score', 0)}
        - Communication: {scores.get('communication_score', 0)}
        - Confidence: {scores.get('confidence_score', 0)}
        
        FINAL DECISION: {decision.get('recommendation', 'Pending').upper()}
        Overall Score: {decision.get('final_score', 0)}
        
        FEEDBACK:
        {self._generate_feedback(scores)}
        """
        return report

    def _generate_feedback(self, scores):
        feedback = []
        if scores.get('technical_score', 0) > 80:
            feedback.append("Strong technical understanding.")
        else:
            feedback.append("Needs improvement in technical concepts.")
            
        if scores.get('communication_score', 0) > 80:
            feedback.append("Clear and articulate communication.")
            
        return "\n".join(feedback)
