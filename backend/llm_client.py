import os
import random
from groq import Groq

class LLMClient:
    def __init__(self, provider="groq"):
        self.provider = provider
        self.api_key = os.getenv("GROQ_API_KEY")
        if self.api_key:
            self.client = Groq(api_key=self.api_key)
        else:
            self.client = None

    def completion(self, prompt: str, system_prompt: str = "You are a helpful AI assistant.") -> str:
        """
        Generates a completion from the LLM using Groq.
        """
        if self.client:
            try:
                chat_completion = self.client.chat.completions.create(
                    messages=[
                        {
                            "role": "system",
                            "content": system_prompt,
                        },
                        {
                            "role": "user",
                            "content": prompt,
                        }
                    ],
                    model="llama-3.3-70b-versatile",
                )
                return chat_completion.choices[0].message.content
            except Exception as e:
                print(f"!!! LLM CRITICAL ERROR !!!")
                print(f"Error Type: {type(e)}")
                print(f"Error Message: {e}")
                import traceback
                traceback.print_exc()
                return self._mock_fallback(prompt)
        else:
            print("!!! LLM ERROR: Client is None (API Key missing or invalid) !!!")
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
