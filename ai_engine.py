from transformers import pipeline
from database import get_all_content

summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

def explain_pdf():
    docs = get_all_content()
    if not docs:
        return []

    text = docs[-1]["content"][:3000]
    summary = summarizer(text, max_length=150, min_length=60, do_sample=False)

    explanation = summary[0]["summary_text"]
    sentences = explanation.split(". ")

    return sentences
