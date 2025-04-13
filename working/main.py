from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
import io
import contextlib

import re


app = Flask(__name__)
CORS(app)

# Replace this with your actual Gemini API key
GEMINI_API_KEY = "AIzaSyCh6LWNx8l1mDMB61zQEWAX6nk8pm6ZdLc"



def format_explanation(text):
    # Bold formatting
    text = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', text)
    
    # Lists - Convert text like "1. something" into HTML list format
    text = re.sub(r'(\d+\.\s)', r'<li>', text)
    text = text.replace('\n', '</li><li>')
    text = f'<ul>{text}</ul>'
    
    # Convert code blocks (Python code)
    text = re.sub(r'```python\n(.*?)```', r'<pre><code>\1</code></pre>', text, flags=re.DOTALL)
    
    return text

def get_error_explanation(error_text, code_snippet):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"
    headers = { "Content-Type": "application/json" }
    data = {
        "contents": [{
            "parts": [{
                "text": (
                    f"Explain this Python error with reference to the code provided:\n\n"
                    
                    f"Error:\n{error_text}\n\n"
                    f"Code:\n```python\n{code_snippet}\n```"
                )
            }]
        }]
    }
    res = requests.post(url, headers=headers, data=json.dumps(data))
    if res.status_code == 200:
        explanation = res.json()['candidates'][0]['content']['parts'][0]['text']
        return format_explanation(explanation)
    else:
        return f"Failed to get explanation: {res.status_code}"

@app.route('/explain_error', methods=['POST'])
def explain_error():
    error = request.json.get("error")
    code = request.json.get("code")
    explanation = get_error_explanation(error, code)
    return jsonify({ "explanation": explanation })


@app.route('/run_code', methods=['POST'])
def run_code():
    try:
        code = request.json['code']
        output_buffer = io.StringIO()

        with contextlib.redirect_stdout(output_buffer):
            exec(code, {})

        output = output_buffer.getvalue()
        return jsonify({ "status": "success", "output": output })

    except Exception as e:
        return jsonify({ "status": "error", "error": str(e) })


if __name__ == '__main__':
    app.run(debug=True)
