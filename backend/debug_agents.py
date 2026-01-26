import os
import sys
from dotenv import load_dotenv

# Ensure we can import from current directory
sys.path.append(os.getcwd())

# Load Env
load_dotenv()
print(f"API Key present: {bool(os.getenv('GROQ_API_KEY'))}")

try:
    from agents import ReasoningAgent
    print("Initializing ReasoningAgent...")
    agent = ReasoningAgent()
    
    print("Attempting to generate question...")
    context = {"candidate_name": "Test User", "cv_text": "Experienced Python Developer with 5 years in AI."}
    
    # This calls llm.completion -> which calls Groq
    try:
        result = agent.generate_question(context)
        print("\n--- RESULT ---")
        print(result)
        print("--------------\n")
        
        if "Tell me about a time" in str(result):
            print("FAILURE: Returned fallback response!")
        else:
            print("SUCCESS: Returned generated response.")
            
    except Exception as e:
        print(f"CRITICAL EXECUTION ERROR: {e}")
        import traceback
        traceback.print_exc()

except ImportError as e:
    print(f"Import Error: {e}")
except Exception as e:
    print(f"Setup Error: {e}")
