import os
import random

class LLMClient:
    def __init__(self, provider="openai"):
        self.provider = provider
        self.api_key = os.getenv("OPENAI_API_KEY")
        # In a real scenario, initialize OpenAI client here
        # self.client = OpenAI(api_key=self.api_key)

    def completion(self, prompt: str, system_prompt: str = "You are a helpful AI assistant.") -> str:
        """
        Generates a completion from the LLM.
        """
        if self.api_key:
            try:
                # Placeholder for actual API call
                # response = self.client.chat.completions.create(...)
                # return response.choices[0].message.content
                return f"[MOCK OPENAI RESPONSE] based on: {prompt[:20]}..."
            except Exception as e:
                print(f"LLM Error: {e}")
                return self._mock_fallback(prompt)
        else:
            return self._mock_fallback(prompt)

    def _mock_fallback(self, prompt: str) -> str:
        """
        Offline fallback for valid testing without costs/keys.
        """
        if "question" in prompt.lower():
            return "Tell me about a time you had to learn a new technology quickly."
        elif "score" in prompt.lower():
            return "Technical: 85, Communication: 90, Confidence: 80"
        return "I understand. Please continue."
