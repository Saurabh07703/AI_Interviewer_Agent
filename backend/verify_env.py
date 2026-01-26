import os
from dotenv import load_dotenv

print("--- Environment Verification ---")
# 1. Try loading from default location
load_dotenv()
key = os.getenv("GROQ_API_KEY")

if key:
    print(f"SUCCESS: Found GROQ_API_KEY")
    print(f"Key preview: {key[:10]}...")
    if key == "your_groq_api_key_here":
        print("WARNING: Key is still the placeholder value!")
    else:
        print("Key looks valid (not placeholder).")
        
    # Test Import
    try:
        from groq import Groq
        print("SUCCESS: 'groq' module imported.")
        try:
            client = Groq(api_key=key)
            print("SUCCESS: Groq client initialized.")
        except Exception as e:
            print(f"ERROR: Groq client init failed: {e}")
            
    except ImportError:
        print("ERROR: Could not import 'groq'. Run 'pip install groq'.")

else:
    print("ERROR: GROQ_API_KEY not found in environment.")
    print("Files in current dir:", os.listdir())
    
print("--------------------------------")
