from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import sys
import math
import re
from werkzeug.utils import secure_filename
from google.cloud import texttospeech

from file_converter import docx_to_pdf, pptx_to_pdf
from speech import speech_to_text
from ai_engine import explain_pdf
from database import save_pdf, get_all_content
from pdf_utils import extract_text_by_page

# ------------------------------------------------
# APP SETUP
# ------------------------------------------------
app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
AUDIO_DIR = os.path.join(BASE_DIR, "static", "audio")

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(AUDIO_DIR, exist_ok=True)

sys.path.append(BASE_DIR)

# ------------------------------------------------
# UPLOAD PDF / DOCX / PPTX
# ------------------------------------------------
@app.route("/upload", methods=["POST"])
def upload_file():
    file = request.files.get("file")
    if not file:
        return jsonify({"error": "No file uploaded"}), 400

    filename = secure_filename(file.filename)
    ext = filename.rsplit(".", 1)[-1].lower()

    upload_path = os.path.join(UPLOAD_DIR, filename)
    file.save(upload_path)

    # -------- CONVERT TO PDF --------
    if ext == "docx":
        pdf_path = upload_path.replace(".docx", ".pdf")
        docx_to_pdf(upload_path, pdf_path)

    elif ext in ["ppt", "pptx"]:
        pdf_path = upload_path.rsplit(".", 1)[0] + ".pdf"
        pptx_to_pdf(upload_path, pdf_path)

    elif ext == "pdf":
        pdf_path = upload_path

    else:
        return jsonify({"error": "Unsupported file type"}), 400

    # -------- PAGE-WISE TEXT --------
    pages = extract_text_by_page(pdf_path)

    full_text = "\n".join(
        p["text"] for p in pages if p["text"].strip()
    )

    save_pdf(
        filename=os.path.basename(pdf_path),
        full_text=full_text,
        
    )

    return jsonify({
        "message": "File uploaded successfully",
        "filename": os.path.basename(pdf_path),
        "text": full_text,
        "pages": pages
    })


# ------------------------------------------------
# SERVE PDF
# ------------------------------------------------
@app.route("/pdf/<path:filename>")
def serve_pdf(filename):
    return send_from_directory(UPLOAD_DIR, filename, as_attachment=False)


# ------------------------------------------------
# GET FULL TEXT
# ------------------------------------------------
@app.route("/get_pdf_text")
def get_pdf_text():
    docs = get_all_content()
    if not docs:
        return jsonify({"text": ""})

    return jsonify({"text": docs[0]["content"]})


# ------------------------------------------------
# GET PAGE-WISE TEXT
# ------------------------------------------------
@app.route("/pdf_text_pages")
def get_pdf_text_pages():
    docs = get_all_content()
    if not docs:
        return jsonify([])

    return jsonify(docs[0]["pages"])


# ------------------------------------------------
# AI EXPLANATION
# ------------------------------------------------
@app.route("/explain_pdf")
def explain_pdf_api():
    return jsonify({"sentences": explain_pdf()})


# ------------------------------------------------
# GOOGLE NEURAL TTS
# ------------------------------------------------
@app.route("/read_pdf")
def read_pdf():
    docs = get_all_content()
    if not docs:
        return jsonify({"error": "No PDF found"}), 400

    text = docs[0]["content"]

    sentences = re.split(r'(?<=[.!?])\s+', text)
    sentences = [s for s in sentences if len(s.strip()) > 10]

    client = texttospeech.TextToSpeechClient()

    voice = texttospeech.VoiceSelectionParams(
        language_code="en-IN",
        name="en-IN-Wavenet-A",
        ssml_gender=texttospeech.SsmlVoiceGender.FEMALE
    )

    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.MP3,
        speaking_rate=0.95
    )

    response_data = []

    for i, sentence in enumerate(sentences):
        response = client.synthesize_speech(
            input=texttospeech.SynthesisInput(text=sentence),
            voice=voice,
            audio_config=audio_config
        )

        audio_file = f"sentence_{i}.mp3"
        audio_path = os.path.join(AUDIO_DIR, audio_file)

        with open(audio_path, "wb") as f:
            f.write(response.audio_content)

        duration = max(1, math.ceil(len(sentence.split()) / 2.2))

        response_data.append({
            "id": i,
            "sentence": sentence,
            "audio": f"/static/audio/{audio_file}",
            "duration": duration
        })

    return jsonify(response_data)


# ------------------------------------------------
# SERVE AUDIO
# ------------------------------------------------
@app.route("/static/audio/<path:filename>")
def serve_audio(filename):
    return send_from_directory(AUDIO_DIR, filename)


# ------------------------------------------------
# VOICE QUESTION
# ------------------------------------------------
@app.route("/voice", methods=["POST"])
def ask_voice():
    audio = request.files.get("audio")
    if not audio:
        return jsonify({"error": "No audio uploaded"}), 400

    path = "voice.wav"
    audio.save(path)

    question = speech_to_text(path)

    return jsonify({
        "question": question,
        "answer": "Voice Q&A pipeline unchanged"
    })


if __name__ == "__main__":
    app.run(debug=True, port=5000, use_reloader=False)
