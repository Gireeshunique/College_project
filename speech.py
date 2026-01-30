# VOICE SUPPORT
import whisper
from gtts import gTTS
import uuid
import os

stt = whisper.load_model("base")

def speech_to_text(audio_path):
    result = stt.transcribe(audio_path)
    return result["text"]

def text_to_speech(text):
    filename = f"{uuid.uuid4().hex}.mp3"
    path = f"static/audio/{filename}"
    os.makedirs("static/audio", exist_ok=True)
    gTTS(text).save(path)
    return filename
