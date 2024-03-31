from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline

app = Flask(__name__)
CORS(app)

quote_generator = pipeline("text-generation", model="nandinib1999/quote-generator")

@app.route("/generate-quote", methods=["POST"])
def generate_quote():
    data = request.get_json()
    prompt = data.get("prompt", "")
    
    quote_response = quote_generator(prompt, max_length=50, num_return_sequences=1)
    generated_response = quote_response[0]['generated_text']
    
    generated_quote = generated_response.split(prompt, 1)[-1] if prompt in generated_response else generated_response
    
    return jsonify({"quote": generated_quote.strip()})

if __name__ == "__main__":
    app.run(port=5000)
